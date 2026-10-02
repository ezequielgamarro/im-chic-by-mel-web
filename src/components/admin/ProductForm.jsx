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
 * Formulario de alta de producto (tarea T8).
 * Valida campos obligatorios, precio > 0 y foto (jpg/png/webp, ≤ 2 MB),
 * sube la imagen a Storage y hace INSERT en `products` (stock 0).
 */
export default function ProductForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
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

    if (!file) {
      next.photo = 'Subí una foto del producto.';
    } else if (!ALLOWED_MIME[file.type]) {
      next.photo = 'La foto debe ser JPG, PNG o WebP.';
    } else if (file.size > MAX_SIZE) {
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
      const ext = ALLOWED_MIME[file.type] || file.name.split('.').pop().toLowerCase();
      const slug = slugify(title) || 'producto';
      const path = `productos/${Date.now()}-${slug}.${ext}`;

      // 1) Subida a Storage.
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(path, file);
      if (uploadError) throw uploadError;

      // 2) URL pública de la imagen subida.
      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(path);
      const imageUrl = urlData?.publicUrl;

      // 3) Insert en la tabla de productos (stock inicial 0).
      const { error: insertError } = await supabase.from('products').insert({
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        image_url: imageUrl,
        stock: 0,
      });
      if (insertError) throw insertError;

      // Reset del formulario.
      setTitle('');
      setPrice('');
      setDescription('');
      setFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onCreated?.();
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
          Nuevo producto
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
            <span>{file ? 'Cambiar foto' : 'Subir foto'}</span>
          </label>
          {previewUrl ? (
            <div className="flex items-center gap-3 mt-1">
              <img
                src={previewUrl}
                alt="Vista previa de la foto seleccionada"
                className="w-16 h-16 rounded-xl object-cover border border-[#5A0B22]/10"
              />
              <p className="text-xs text-[#5A0B22]/70 break-all">
                {file?.name}
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
              <span>Guardar producto</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
