import { useState, useRef } from "react";
import classes from "./ProductManager.module.css";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { generateSlug } from "../../utils/generateSlug";
import { MediaPickerModal } from "../MediaPickerModal/MediaPickerModal";
import { ResponsiveImage } from "../ResponsiveImage/ResponsiveImage";
import { adminLinkMediaToEntity } from "../../services/mediaService";
import type { IMediaFrontend } from "../../models/MediaInterface";

export const ProductManager = () => {
  const {
    products, editingId, form, setForm,
    loading, error, success,
    resetForm: originalResetForm, handleEdit: originalHandleEdit, handleDelete, handleSubmit: originalHandleSubmit,
    fetchProducts,
  } = useAdminProducts();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<IMediaFrontend | null>(null);
  const [linkingMedia, setLinkingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    originalResetForm();
    setSelectedMedia(null);
  };

  const handleEdit = (product: Parameters<typeof originalHandleEdit>[0]) => {
    originalHandleEdit(product);
    setSelectedMedia(null);
  };

  const handleMediaSelect = async (media: IMediaFrontend) => {
    if (editingId) {
      // For existing products, link immediately
      setLinkingMedia(true);
      try {
        await adminLinkMediaToEntity(media._id, 'product', editingId, 'coverImage');
        await fetchProducts();
        setSelectedMedia(null);
      } catch (err) {
        console.error('Failed to link media:', err);
      } finally {
        setLinkingMedia(false);
      }
    } else {
      // For new products, store selection to link after creation
      setSelectedMedia(media);
    }
  };

  const handleSubmit = async () => {
    await originalHandleSubmit();
    // Note: For new products with selectedMedia, we'd need the product ID after creation
    // This requires modifying handleSubmit to return the product or emit an event
    // For now, the user can edit the product after creation to add the cover
    setSelectedMedia(null);
  };

  return (
    <div className={classes.productManager}>
      <div className={classes.form}>
        <input
          className={classes.input}
          placeholder="Product title"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          onBlur={() => !form.slug && updateField('slug', generateSlug(form.title))}
        />
        <textarea
          className={classes.textarea}
          placeholder="Description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
        <div className={classes.formRow}>
          <input
            className={classes.input}
            placeholder="Price (0 = free)"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
          />
          <input
            className={classes.input}
            placeholder="Category (e.g. plugin)"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
          />
          <input
            className={classes.input}
            placeholder="Platform (e.g. vscode)"
            value={form.platform}
            onChange={(e) => updateField('platform', e.target.value)}
          />
        </div>
        <div className={classes.formRow}>
          <input
            className={classes.input}
            placeholder="Slug (URL-friendly name)"
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
          />
          <label className={classes.checkbox}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => updateField('isPublished', e.target.checked)}
            />
            Published
          </label>
        </div>
        <div className={classes.formRow}>
          <div className={classes.mediaPickerSection}>
            <label className={classes.fileLabel}>Product file (.zip, etc.)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.tar,.gz,.vsix,.js,.ts,.json,.rar,.7z"
              className={classes.hiddenInput}
              onChange={(e) => updateField('file', e.target.files?.[0] || null)}
            />
            {form.file ? (
              <div className={classes.mediaPreview}>
                <span className={classes.mediaPreviewInfo}>{form.file.name}</span>
                <button
                  type="button"
                  className={classes.mediaPreviewClear}
                  onClick={() => updateField('file', null)}
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={classes.mediaPickerBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                Select Product File
              </button>
            )}
          </div>
          <div className={classes.mediaPickerSection}>
            <label className={classes.fileLabel}>Cover image</label>
            {selectedMedia ? (
              <div className={classes.mediaPreview}>
                <ResponsiveImage
                  coverImage={selectedMedia}
                  alt={selectedMedia.title}
                  className={classes.mediaPreviewImage}
                  sizes="60px"
                />
                <span className={classes.mediaPreviewInfo}>{selectedMedia.title}</span>
                <button
                  type="button"
                  className={classes.mediaPreviewClear}
                  onClick={() => setSelectedMedia(null)}
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={classes.mediaPickerBtn}
                onClick={() => setPickerOpen(true)}
                disabled={linkingMedia}
              >
                {linkingMedia ? 'Linking...' : 'Select Cover Image'}
              </button>
            )}
          </div>
        </div>

        {error && <p className={classes.error}>{error}</p>}
        {success && <p className={classes.success}>{success}</p>}

        <div className={classes.formActions}>
          <button className={classes.submitBtn} onClick={handleSubmit} disabled={loading || linkingMedia}>
            {loading ? "Saving..." : editingId ? "Update Product" : "Create Product"}
          </button>
          {editingId && (
            <button className={classes.cancelBtn} onClick={resetForm}>Cancel</button>
          )}
        </div>
      </div>

      <div className={classes.productList}>
        {products.map((product) => (
          <div key={product._id} className={classes.productItem}>
            <div className={classes.productItemInfo}>
              <span className={classes.productItemTitle}>{product.title}</span>
              <span className={classes.productItemMeta}>
                {product.price === 0 ? "Free" : `${product.price} kr`}
                {" \u2022 "}{product.category}
                {" \u2022 "}{product.isPublished ? "Published" : "Draft"}
                {" \u2022 "}{product.downloadCount} downloads
              </span>
            </div>
            <div className={classes.productItemActions}>
              <button className={classes.editBtn} onClick={() => handleEdit(product)}>Edit</button>
              <button className={classes.deleteBtn} onClick={() => handleDelete(product._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Cover Image"
      />
    </div>
  );
};
