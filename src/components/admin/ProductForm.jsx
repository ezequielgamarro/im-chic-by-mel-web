import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Genera un slug seguro a partir del título (sin acentos, minúsculas, guiones).
 */
const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/**
 * Extrae la ruta del objeto dentro del bucket `productos` a partir de su
 * URL pública. Devuelve null si no se reconoce el formato.
 */
const extractStoragePath = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const marker = '/object/public/productos/';
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  const path = imageUrl.slice(idx + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
};

/**
 * Formulario de producto (tarea T8: alta, tarea T12: edición).
 * En modo "crear" (sin `product`) hace INSERT; en modo "editar" (con
 * `product`) precarga los datos y hace UPDATE. Reutiliza las mismas
 * validaciones de RF-2 (precio > 0, imagen jpg/png/webp, ≤ 2 MB).
 */
export default function ProductForm({ onCreated, onUpdated, onCancel, product = null }) {
  const isEdit = Boolean(product);
  const [title, setTitle] = useState(product?.title ?? '');
  const [price, setPrice] = useState(
    product && product.price !== undefined && product.price !== null
      ? String(product.price)
      : ''
  );
  const [description, setDescription] = useState(product?.description ?? '');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  // Libera el object URL de la vista previa cuando cambia o al desmontar.
  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : '');
    setErrors((prev) => ({ ...prev, photo: '' }));
  };

  const validate = () => {
    const next = {};

    if (!title.trim()) {
      next.title = 'Ingresá el título del producto.';
    }

    const priceNum = Number(price);
    if (price.trim() === '' || Number.isNaN(priceNum) || priceNum <= 0) {
      next.price = 'Ingresá un precio válido (mayor a 0).';
    }

    if (!description.trim()) {
      next.description = 'Ingresá una descripción.';
    }

    const hasImage = Boolean(file) || (isEdit && product?.image_url);
    if (!hasImage) {
      next.photo = 'Subí una foto del producto.';
    } else if (file && !ALLOWED_MIME[file.type]) {
      next.photo = 'La foto debe ser JPG, PNG o WebP.';
    } else if (file && file.size > MAX_SIZE) {
      next.photo = 'La foto no puede superar los 2 MB.';
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      let imageUrl = isEdit ? product?.image_url || null : null;
      let uploadedPath = null;

      // 1) Si se reemplaza la foto, subir la nueva a Storage.
      if (file) {
        const ext = ALLOWED_MIME[file.type] || file.name.split('.').pop().toLowerCase();
        const slug = slugify(title) || 'producto';
        uploadedPath = `productos/${Date.now()}-${slug}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(uploadedPath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('productos')
          .getPublicUrl(uploadedPath);
        imageUrl = urlData?.publicUrl;
      }

      if (isEdit) {
        // 2) UPDATE de la fila existente.
        const payload = {
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
        };
        if (file) payload.image_url = imageUrl;

        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id);
        if (updateError) {
          // Limpia la imagen recién subida para no dejar huérfanos.
          if (uploadedPath) {
            await supabase.storage.from('productos').remove([uploadedPath]).catch(() => {});
          }
          throw updateError;
        }

        // 3) Si se reemplazó la foto, borrar la imagen anterior del bucket.
        if (file && product?.image_url) {
          const oldPath = extractStoragePath(product.image_url);
          if (oldPath && oldPath !== uploadedPath) {
            await supabase.storage.from('productos').remove([oldPath]).catch(() => {});
          }
        }

        onUpdated?.();
      } else {
        // 2) INSERT en la tabla de productos (stock inicial 0).
        const { error: insertError } = await supabase.from('products').insert({
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
          image_url: imageUrl,
          stock: 0,
        });
        if (insertError) {
          if (uploadedPath) {
            await supabase.storage.from('productos').remove([uploadedPath]).catch(() => {});
          }
          throw insertError;
        }

        // Reset del formulario solo en modo alta.
        setTitle('');
        setPrice('');
        setDescription('');
        setFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        onCreated?.();
      }
    } catch (err) {
      setSubmitError(
        err?.message || 'No pudimos guardar el producto. Intentalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white/90 border border-[#5A0B22]/10 rounded-3xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <ImagePlus size={20} className="text-[#7A1333]" aria-hidden="true" />
        <h2 className="font-serif text-lg sm:text-xl font-semibold">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Foto */}
        <div className="flex flex-col gap-1.5">
          <span
            id="photo-label"
            className="text-sm font-semibold text-[#5A0B22]"
          >
            Foto
          </span>
          <label
            htmlFor="photo"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-[#7A1333]/40 bg-white text-[#7A1333] font-semibold text-sm cursor-pointer hover:bg-[#FFC9D6]/20 transition-colors focus-within:ring-2 focus-within:ring-[#7A1333] focus-within:outline-none"
          >
            <input
              id="photo"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              aria-describedby={errors.photo ? 'photo-error' : undefined}
              aria-invalid={errors.photo ? true : undefined}
              className="sr-only"
            />
            <ImagePlus size={18} aria-hidden="true" />
            <span>{file || isEdit ? 'Cambiar foto' : 'Subir foto'}</span>
          </label>
          {previewUrl || (isEdit && product?.image_url && !file) ? (
            <div className="flex items-center gap-3 mt-1">
              <img
                src={previewUrl || product?.image_url}
                alt={previewUrl ? 'Vista previa de la foto seleccionada' : `Imagen actual de ${product?.title ?? 'producto'}`}
                className="w-16 h-16 rounded-xl object-cover border border-[#5A0B22]/10"
              />
              <p className="text-xs text-[#5A0B22]/70 break-all">
                {file ? file.name : 'Imagen actual'}
              </p>
            </div>
          ) : null}
          {errors.photo ? (
            <p id="photo-error" className="text-sm font-medium text-[#B91C1C]">
              {errors.photo}
            </p>
          ) : (
            <p className="text-xs text-[#5A0B22]/60">
              JPG, PNG o WebP · máximo 2 MB.
            </p>
          )}
        </div>

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-[#5A0B22]"
          >
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Ej.: Tinted Lip Butter"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
          />
          {errors.title ? (
            <p id="title-error" className="text-sm font-medium text-[#B91C1C]">
              {errors.title}
            </p>
          ) : null}
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="price"
            className="text-sm font-semibold text-[#5A0B22]"
          >
            Precio (ARS)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setErrors((prev) => ({ ...prev, price: '' }));
            }}
            placeholder="Ej.: 35000"
            aria-invalid={errors.price ? true : undefined}
            aria-describedby={errors.price ? 'price-error' : undefined}
            className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
          />
          {errors.price ? (
            <p id="price-error" className="text-sm font-medium text-[#B91C1C]">
              {errors.price}
            </p>
          ) : null}
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-semibold text-[#5A0B22]"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Breve descripción del producto"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? 'description-error' : undefined}
            className="w-full px-4 py-3 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 resize-y focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
          />
          {errors.description ? (
            <p
              id="description-error"
              className="text-sm font-medium text-[#B91C1C]"
            >
              {errors.description}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <p
            role="alert"
            className="text-sm font-medium text-[#B91C1C] bg-[#FEE2E2]/70 border border-[#B91C1C]/20 rounded-xl px-4 py-3"
          >
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
        >
          {submitting ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                aria-hidden="true"
              />
              <span>Guardando…</span>
            </>
          ) : (
            <>
              <Save size={18} className="text-[#F7E7B4]" aria-hidden="true" />
              <span>{isEdit ? 'Guardar cambios' : 'Guardar producto'}</span>
            </>
          )}
        </button>

        {isEdit && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#5A0B22]/20 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            Cancelar
          </button>
        ) : null}
      </form>
    </section>
  );
}
