import { useState, useEffect, useCallback } from "react";
import {
  adminGetAllProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadCover,
} from "../services/productService";
import type { IProductFrontend } from "../models/ProductInterface";

export interface ProductFormState {
  title: string;
  description: string;
  price: string;
  category: string;
  platform: string;
  slug: string;
  isPublished: boolean;
  file: File | null;
  coverFile: File | null;
}

const initialFormState: ProductFormState = {
  title: "",
  description: "",
  price: "",
  category: "",
  platform: "",
  slug: "",
  isPublished: true,
  file: null,
  coverFile: null,
};

export const useAdminProducts = () => {
  const [products, setProducts] = useState<IProductFrontend[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const data = await adminGetAllProducts();
      setProducts(data.products);
    } catch {
      setError("Failed to load products");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialFormState);
  };

  const handleEdit = (product: IProductFrontend) => {
    setEditingId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      category: product.category,
      platform: product.platform,
      slug: product.slug,
      isPublished: product.isPublished,
      file: null,
      coverFile: null,
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(id);
      fetchProducts();
      setSuccess("Product deleted");
    } catch {
      setError("Failed to delete product");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.slug.trim()) {
      setError("Title, description, and slug are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("platform", form.platform);
    formData.append("slug", form.slug.trim());
    formData.append("isPublished", String(form.isPublished));
    if (form.file) formData.append("file", form.file);

    try {
      let product: IProductFrontend;
      if (editingId) {
        product = await adminUpdateProduct(editingId, formData);
        setSuccess("Product updated");
      } else {
        if (!form.file) {
          setError("Product file is required");
          setLoading(false);
          return;
        }
        product = await adminCreateProduct(formData);
        setSuccess("Product created");
      }

      if (form.coverFile && product._id) {
        await adminUploadCover(product._id, form.coverFile);
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    editingId,
    form,
    setForm,
    loading,
    error,
    success,
    resetForm,
    handleEdit,
    handleDelete,
    handleSubmit,
    fetchProducts,
  };
};
