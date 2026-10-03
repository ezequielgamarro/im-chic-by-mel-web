import { createClient } from "jsr:@supabase/supabase-js@2";
import { serve } from "std/http/server.ts";

// =============================================================================
// Types
// =============================================================================

interface GoogleCalendarSettings {
  access_token_enc: string;
  refresh_token_enc: string;
  calendar_id: string;
  token_expires_at?: number; // Unix timestamp
}

interface AdminSettingsRow {
  google_calendar: GoogleCalendarSettings | null;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

interface CalendarEventsListResponse {
  items?: CalendarEvent[];
  nextPageToken?: string;
}

interface BusySlot {
  start: string; // ISO 8601 UTC
  end: string;   // ISO 8601 UTC
}

interface FunctionResponse {
  busy_slots: BusySlot[];
  test_event_created?: boolean;
  test_event_id?: string;
  error?: string;
}

// =============================================================================
// Config & Constants
// =============================================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const ENCRYPTION_KEY = Deno.env.get("ENCRYPTION_KEY")!; // Base64-encoded 32-byte key

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Content-Type": "application/json",
};

// =============================================================================
// Crypto Helpers (using Web Crypto API - Deno compatible)
// =============================================================================

async function getCryptoKey(): Promise<CryptoKey> {
  // ENCRYPTION_KEY is base64-encoded 32 bytes (256 bits)
  const rawKey = Uint8Array.from(atob(ENCRYPTION_KEY), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function decrypt(encryptedB64: string): Promise<string> {
  const key = await getCryptoKey();
  // Format: IV (12 bytes) + ciphertext + authTag (16 bytes) - all base64 concatenated with '.'
  const [ivB64, ciphertextB64] = encryptedB64.split(".");
  if (!ivB64 || !ciphertextB64) {
    throw new Error("Invalid encrypted format: expected 'iv.ciphertext'");
  }
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ciphertextB64), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ciphertextB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivB64}.${ciphertextB64}`;
}

// =============================================================================
// Google OAuth2 Helpers
// =============================================================================

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
  }

  return response.json();
}

// =============================================================================
// Google Calendar API Helpers
// =============================================================================

async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEventsListResponse> {
  const url = new URL(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeZone", "UTC");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Calendar API error: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

async function insertCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<CalendarEvent> {
  const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
    calendarId
  )}/events`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Calendar insert error: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

// =============================================================================
// Main Handler
// =============================================================================

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Only allow GET and POST
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    // 1. Extract JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: CORS_HEADERS }
      );
    }
    const jwt = authHeader.slice(7); // Remove "Bearer "

    // 2. Validate user with Supabase Auth
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // 3. Check if user is admin (using the is_admin() helper logic)
    const isAdmin =
      (user.app_metadata?.role as string) === "admin" ||
      user.user_metadata?.role === "admin";

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // 4. Read admin_settings.google_calendar
    const { data: settings, error: settingsError } = await supabase
      .from("admin_settings")
      .select("google_calendar")
      .single();

    if (settingsError) {
      // If table doesn't exist, return empty slots (graceful degradation)
      if (settingsError.code === "PGRST116" || settingsError.code === "42P01") {
        return new Response(
          JSON.stringify({ busy_slots: [] }),
          { headers: CORS_HEADERS }
        );
      }
      throw new Error(`Failed to read admin_settings: ${settingsError.message}`);
    }

    const calendarSettings = settings?.google_calendar as
      | GoogleCalendarSettings
      | null;

    if (!calendarSettings?.access_token_enc || !calendarSettings?.refresh_token_enc) {
      return new Response(
        JSON.stringify({
          busy_slots: [],
          error: "Google Calendar not configured",
        }),
        { headers: CORS_HEADERS }
      );
    }

    // 5. Decrypt tokens
    let accessToken: string;
    let refreshToken: string;

    try {
      accessToken = await decrypt(calendarSettings.access_token_enc);
      refreshToken = await decrypt(calendarSettings.refresh_token_enc);
    } catch (decryptError) {
      return new Response(
        JSON.stringify({
          busy_slots: [],
          error: `Token decryption failed: ${decryptError instanceof Error ? decryptError.message : "Unknown error"}`,
        }),
        { headers: CORS_HEADERS }
      );
    }

    // 6. Check if access token is expired (with 60s buffer)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = calendarSettings.token_expires_at || 0;

    if (now >= expiresAt - 60) {
      // Token expired or expiring soon - refresh it
      try {
        const tokenResponse = await refreshAccessToken(refreshToken);
        accessToken = tokenResponse.access_token;
        const newExpiresAt = now + tokenResponse.expires_in;

        // Update refresh token if rotated
        const newRefreshToken = tokenResponse.refresh_token || refreshToken;

        // Re-encrypt and update in database
        const newAccessTokenEnc = await encrypt(accessToken);
        const newRefreshTokenEnc = await encrypt(newRefreshToken);

        const { error: updateError } = await supabase
          .from("admin_settings")
          .update({
            google_calendar: {
              ...calendarSettings,
              access_token_enc: newAccessTokenEnc,
              refresh_token_enc: newRefreshTokenEnc,
              token_expires_at: newExpiresAt,
            },
          })
          .eq("id", settings.id); // Assumes single-row table with id

        if (updateError) {
          console.warn("Failed to update tokens in DB:", updateError.message);
        }
      } catch (refreshError) {
        return new Response(
          JSON.stringify({
            busy_slots: [],
            error: `Token refresh failed: ${refreshError instanceof Error ? refreshError.message : "Unknown error"}`,
          }),
          { headers: CORS_HEADERS }
        );
      }
    }

    // 7. Call calendar.events.list
    const timeMin = new Date().toISOString(); // now
    const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // now + 60 days

    let calendarResponse: CalendarEventsListResponse;
    try {
      calendarResponse = await fetchCalendarEvents(
        accessToken,
        calendarSettings.calendar_id || "primary",
        timeMin,
        timeMax
      );
    } catch (calendarError) {
      // If 401, token might be invalid despite our check
      if (
        calendarError instanceof Error &&
        calendarError.message.includes("401")
      ) {
        return new Response(
          JSON.stringify({
            busy_slots: [],
            error: "Calendar access denied - token may be invalid",
          }),
          { headers: CORS_HEADERS }
        );
      }
      throw calendarError;
    }

    // 8. Extract busy slots from events
    const busySlots: BusySlot[] = (calendarResponse.items || [])
      .filter((event) => event.start?.dateTime && event.end?.dateTime)
      .map((event) => ({
        start: event.start!.dateTime!,
        end: event.end!.dateTime!,
      }));

    // 9. Bonus: Create test event if POST request
    let testEventCreated = false;
    let testEventId: string | undefined;

    if (req.method === "POST") {
      const testEvent: CalendarEvent = {
        summary: "Test Event - Im Chic by Mel",
        description: "Automated test event from calendar-availability Edge Function",
        start: {
          dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          timeZone: "UTC",
        },
      };

      try {
        const createdEvent = await insertCalendarEvent(
          accessToken,
          calendarSettings.calendar_id || "primary",
          testEvent
        );
        testEventCreated = true;
        testEventId = createdEvent.id;
      } catch (insertError) {
        console.warn("Test event creation failed:", insertError);
        // Don't fail the whole request for this
      }
    }

    // 10. Return response
    const response: FunctionResponse = {
      busy_slots: busySlots,
      test_event_created: testEventCreated,
      test_event_id: testEventId,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({
        busy_slots: [],
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});