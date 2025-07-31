import classes from './Pages.module.css';
import { useTabs } from '../contexts/TabContext';

export const HomePage = () => {
  const { state, dispatch } = useTabs();

  const handleOpenTab = (
    id: string,
    title: string,
    componentName: string,
    props?: any
  ) => {
    const exists = state.tabs.find((tab) => tab.id === id);
    if (!exists) {
      dispatch({
        type: 'ADD_TAB',
        tab: { id, title, componentName, props },
      });
    }
    dispatch({ type: 'SET_ACTIVE', id });
  };

  return (
    <div className={classes.homeContainer}>

      {/* Plugin Services Section */}
      <section className={classes.homeServices}>
        <h2>Plugins & Subscriptions</h2>
        <p className={classes.homeIntro}>
          As a full-stack developer, I build high-quality, efficient plugins tailored to your needs. Whether you're a
          content creator, designer, or website admin, I can craft the right tools for your platform.
        </p>
        <div className={classes.homeServiceCards}>
          <div className={classes.homeCard}>
            <h3>Platform-Specific Plugins</h3>
            <p>
              I develop plugins for platforms like:
              <br />
              <strong>Twitch, WordPress, Figma, Notion, Discord,</strong> and other tools or CMSs. Have a different
              platform in mind? <a href="https://vgen.co/quilcount">Reach out and let’s talk!</a>
            </p>
          </div>
          <div className={classes.homeCard}>
            <h3>One-Time Plugin Purchases</h3>
            <p>
              <a onClick={() => handleOpenTab('products', 'Products.tsx', 'ProductsPage')}>Browse ready-made plugins</a> designed to solve specific problems. Purchase once, use forever.
            </p>
          </div>
          <div className={classes.homeCard}>
            <h3>Plugin Subscription</h3>
            <p>
              Access a growing library of exclusive plugins. Perfect for teams, agencies, and recurring needs.
            </p>
          </div>
        </div>
      </section>

      {/* VGen Commission Section */}
      <section className={classes.homeVgenSection}>
        <h2 className={classes.homeVgenHeading}>Commission Me Through VGen</h2>
        <div className={classes.homeVgenCard}>
          <p>
            Looking for personalized content or custom solutions? I accept commissions through VGen—
            whether it's a tool, plugin, or automation, I can bring your idea to life.
          </p>
          <a
            href="https://vgen.co/quilcount"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="icons/VGenComms.png" alt="VGen Commissions" className={classes.homeVgenIcon} />
          </a>
        </div>
      </section>

      {/* Contact / About Section */}
      <section id="about" className={classes.homeContact}>
        <h2>Looking to contact or hire me?</h2>
        <p>Click below to learn more about me or reach out directly.</p>
        <button onClick={() => handleOpenTab('about', 'About.tsx', 'AboutPage')} className={classes.homeCtaButton}>
          Open About Page
        </button>
      </section>
    </div>
  );
};
