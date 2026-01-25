import { useUserLibrary } from '../../hooks/useUserLibrary';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import classes from './UserLibrary.module.css';

export const UserLibrary = () => {
  const { purchases, loading, error, downloadingId, handleDownload } = useUserLibrary();

  if (loading) return <div className={classes.container}>Loading your library...</div>;

  return (
    <div className={classes.container}>
      <h2>My Library</h2>
      {error && <p className={classes.errorText}>{error}</p>}

      {purchases.length === 0 ? (
        <div className={classes.empty}>
          <p>No products in your library yet.</p>
          <p>Purchase or download free products to see them here.</p>
        </div>
      ) : (
        <div className={classes.grid}>
          {purchases.map(p => (
            <div key={p._id} className={classes.card}>
              {p.product?.coverImage && (
                <ResponsiveImage
                  coverImage={p.product.coverImage}
                  alt={p.product.title || 'Product'}
                  sizes="(max-width: 600px) 100vw, 260px"
                />
              )}
              <h3>{p.product?.title || 'Unknown Product'}</h3>
              <div className={classes.meta}>
                {p.amount === 0 ? 'Free' : `${p.amount.toFixed(2)} kr`}
                {' \u2022 '}
                {new Date(p.purchaseDate).toLocaleDateString()}
              </div>
              <button
                className={classes.downloadBtn}
                onClick={() => handleDownload(p.productId)}
                disabled={downloadingId === p.productId}
              >
                {downloadingId === p.productId ? 'Downloading...' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
