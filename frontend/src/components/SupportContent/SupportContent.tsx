import classes from './SupportContent.module.css';

export const SupportContent = () => {
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>Support & FAQ</h1>
        <p>Common questions about products, subscriptions, and downloads.</p>
      </div>

      <div className={classes.section}>
        <h2>Products & Downloads</h2>

        <div className={classes.faqItem}>
          <h3>How do I download a product after purchase?</h3>
          <p>
            After completing your purchase, the product will appear in your Library.
            Navigate to My Library from the sidebar and click the Download button.
          </p>
        </div>

        <div className={classes.faqItem}>
          <h3>Can I re-download a product I already purchased?</h3>
          <p>
            Yes. All your purchases are saved in your Library and can be re-downloaded at any time.
          </p>
        </div>

        <div className={classes.faqItem}>
          <h3>Are free products really free?</h3>
          <p>
            Yes. Free products can be downloaded immediately without payment. They will also appear in your Library for future access.
          </p>
        </div>
      </div>

      <div className={classes.section}>
        <h2>Subscriptions</h2>

        <div className={classes.faqItem}>
          <h3>What does a subscription include?</h3>
          <p>
            A subscription gives you access to all current and future products for as long as your subscription is active.
          </p>
        </div>

        <div className={classes.faqItem}>
          <h3>How do I cancel my subscription?</h3>
          <p>
            Go to the Subscription page and click "Manage Subscription" to open the Stripe customer portal, where you can cancel or update your plan.
          </p>
        </div>

        <div className={classes.faqItem}>
          <h3>Do I keep access to products after cancelling?</h3>
          <p>
            Your subscription remains active until the end of the current billing period. After that, you retain access to any products you purchased individually.
          </p>
        </div>
      </div>

      <div className={classes.section}>
        <h2>Account & Privacy</h2>

        <div className={classes.faqItem}>
          <h3>How do I update my profile information?</h3>
          <p>
            Navigate to your Profile page from the sidebar. Click "Edit Profile" to update your name or picture.
          </p>
        </div>

        <div className={classes.faqItem}>
          <h3>How is my data handled?</h3>
          <p>
            We collect only essential data to provide our services. You can manage your privacy preferences at any time through the consent settings that appear when you first log in.
          </p>
        </div>
      </div>

      <div className={classes.section}>
        <h2>Contact</h2>
        <div className={classes.contactInfo}>
          <p>
            Have a question not covered here? Reach out via the Social Links page or open an issue on the project's GitHub repository.
          </p>
        </div>
      </div>
    </div>
  );
};
