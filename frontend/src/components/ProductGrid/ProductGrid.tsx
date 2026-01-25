import { useState, useEffect } from 'react';
import { publicGetAllProducts } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';
import { useImageZoom } from '../../hooks/useImageZoom';
import { useUserPurchaseStatus } from '../../hooks/useUserPurchaseStatus';
import { useProductActions } from '../../hooks/useProductActions';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import { SEO } from '../SEO/SEO';
import { getCoverImageUrls } from '../../utils/coverImageUtils';
import type { IProductFrontend } from '../../models/ProductInterface';
import classes from './ProductGrid.module.css';

export const ProductGrid = () => {
  const [products, setProducts] = useState<IProductFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  const { hasSubscription, purchasedIds } = useUserPurchaseStatus(isLoggedIn);
  const { handleBuy, handleDownload, actionLoading, error } = useProductActions();
  const { modalImage, zoom, origin, openModal, closeModal, handleTouchStart, handleTouchMove, handleTouchEnd } = useImageZoom();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await publicGetAllProducts();
        setProducts(data.products);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className={classes.container}>Loading products...</div>;

  return (
    <div className={classes.container}>
      <SEO
        title="Products"
        description="Browse and purchase plugins, tools, and templates for WordPress, Figma, VS Code, and more platforms."
      />
      <div className={classes.header}>
        <h2>Products</h2>
        <p>Browse plugins, tools, and templates. Purchase once, use forever.</p>
        {hasSubscription && (
          <p className={classes.subscriptionBadge}>Subscriber — All products available for download</p>
        )}
      </div>

      {error && <p className={classes.errorText}>{error}</p>}

      {products.length === 0 ? (
        <p className={classes.emptyText}>No products available yet. Check back soon!</p>
      ) : (
        <div className={classes.grid}>
          {products.map(product => {
            const canDownload = product.price === 0 || hasSubscription || purchasedIds.has(product._id);
            return (
              <div key={product._id} className={classes.card}>
                {product.coverImage ? (
                  <ResponsiveImage
                    coverImage={product.coverImage}
                    alt={product.title}
                    className={classes.cover}
                    sizes="(max-width: 600px) 100vw, 280px"
                    onClick={() => {
                      const urls = getCoverImageUrls(product.coverImage);
                      if (urls) openModal(urls.originalSrc);
                    }}
                  />
                ) : (
                  <div className={classes.coverPlaceholder}>
                    {product.category === 'plugin' ? '\u{1F50C}' : '\u{1F4E6}'}
                  </div>
                )}
                <div className={classes.cardBody}>
                  <div className={classes.title}>{product.title}</div>
                  <div className={classes.category}>{product.category} / {product.platform}</div>
                  <div className={classes.description}>{product.description}</div>
                  <div className={classes.footer}>
                    <span className={`${classes.price} ${product.price === 0 ? classes.priceFree : ''}`}>
                      {product.price === 0 ? 'Free' : `${product.price.toFixed(2)} kr`}
                    </span>
                    {isLoggedIn ? (
                      <button
                        className={classes.button}
                        disabled={actionLoading === product._id}
                        onClick={() => canDownload ? handleDownload(product._id) : handleBuy(product._id)}
                      >
                        {actionLoading === product._id ? '...' : canDownload ? 'Download' : 'Buy'}
                      </button>
                    ) : (
                      <span className={classes.loginPrompt}>Log in</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalImage && (
        <div
          className={classes.modal}
          onClick={closeModal}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={modalImage}
            alt="Enlarged product"
            className={classes.modalImage}
            style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x}% ${origin.y}%` }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
