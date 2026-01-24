import classes from "./ProductManager.module.css";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { generateSlug } from "../../utils/generateSlug";

export const ProductManager = () => {
  const {
    products, editingId, form, setForm,
    loading, error, success,
    resetForm, handleEdit, handleDelete, handleSubmit,
  } = useAdminProducts();

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

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
          <div>
            <label className={classes.fileLabel}>Product file (.zip, etc.)</label>
            <input
              type="file"
              accept=".zip,.tar,.gz,.vsix,.js,.ts,.json,.rar,.7z"
              onChange={(e) => updateField('file', e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label className={classes.fileLabel}>Cover image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => updateField('coverFile', e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {error && <p className={classes.error}>{error}</p>}
        {success && <p className={classes.success}>{success}</p>}

        <div className={classes.formActions}>
          <button className={classes.submitBtn} onClick={handleSubmit} disabled={loading}>
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
    </div>
  );
};
