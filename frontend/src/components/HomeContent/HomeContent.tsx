import { useTabs } from '../../contexts/TabContext';
import { SEO } from '../SEO/SEO';
import classes from './HomeContent.module.css';

export const HomeContent = () => {
  const { state, dispatch } = useTabs();

  const handleOpenTab = (id: string, title: string, componentName: string) => {
    const exists = state.tabs.find((tab) => tab.id === id);
    if (!exists) {
      dispatch({ type: 'ADD_TAB', tab: { id, title, componentName } });
    }
    dispatch({ type: 'SET_ACTIVE', id });
  };

  return (
    <div className={classes.container}>
      <SEO
        title="Home"
        description="Browse plugins, tools, and templates for WordPress, Figma, VS Code, and more. Purchase once, use forever, or subscribe for full access."
      />
      <section className={classes.section}>
        <h2>Welcome to My Plugin Store</h2>
        <p className={classes.intro}>
          I build plugins, tools, and templates for platforms like WordPress, Figma, VS Code, and more.
          Browse the catalog, purchase what you need, or subscribe for full access to everything.
        </p>
      </section>

      <section className={classes.section}>
        <h2>How It Works</h2>
        <div className={classes.cards}>
          <div className={classes.card}>
            <h3>Standalone Products</h3>
            <p>
              Buy individual plugins or templates as a one-time purchase. Pay once, own it forever, and
              re-download anytime from your library.
            </p>
            <button
              className={classes.ctaButton}
              onClick={() => handleOpenTab('products', 'Products.tsx', 'ProductsPage')}
            >
              Browse Products
            </button>
          </div>
          <div className={classes.card}>
            <h3>Subscription</h3>
            <p>
              Subscribe monthly or yearly to unlock access to the entire product catalog. Download
              anything, as many times as you want, for as long as your subscription is active.
            </p>
            <button
              className={classes.ctaButton}
              onClick={() => handleOpenTab('subscription', 'Subscription.tsx', 'SubscriptionPage')}
            >
              View Plans
            </button>
          </div>
          <div className={classes.card}>
            <h3>My Library</h3>
            <p>
              Every product you purchase or download (including free ones) appears in your library.
              Come back anytime to re-download your files.
            </p>
            <button
              className={classes.ctaButton}
              onClick={() => handleOpenTab('library', 'Library.tsx', 'LibraryPage')}
            >
              Open Library
            </button>
          </div>
        </div>
      </section>

      <section className={classes.contactSection}>
        <h2>Questions or custom requests?</h2>
        <p>Have a specific plugin in mind? Need something custom-built? Get in touch.</p>
        <button
          className={classes.ctaButton}
          onClick={() => handleOpenTab('about', 'About.tsx', 'AboutPage')}
        >
          About & Contact
        </button>
      </section>
    </div>
  );
};
