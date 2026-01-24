import classes from './TermsOfServiceContent.module.css';

export const TermsOfServiceContent = () => {
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>Terms of Service</h1>
        <p>Last updated: January 2025</p>
      </div>

      <div className={classes.section}>
        <h2>1. Overview</h2>
        <p>
          By accessing or using this website and its services, you agree to be bound by these Terms of Service.
          These terms apply to all visitors, users, and customers.
        </p>
      </div>

      <div className={classes.section}>
        <h2>2. Products & Purchases</h2>
        <p>
          Products sold on this site (plugins, tools, templates) are digital goods. All purchases are one-time
          payments unless otherwise stated. Once purchased, you receive a perpetual license to use the product
          for personal or commercial use, unless the product listing specifies otherwise.
        </p>
        <ul>
          <li>Refunds are handled on a case-by-case basis.</li>
          <li>Redistribution or resale of purchased products is not permitted.</li>
          <li>You may not claim authorship of purchased products.</li>
        </ul>
      </div>

      <div className={classes.section}>
        <h2>3. Subscriptions</h2>
        <p>
          Subscription plans grant access to all available products for the duration of the subscription.
          Subscriptions renew automatically unless cancelled. You can manage or cancel your subscription
          at any time through the Stripe customer portal.
        </p>
        <ul>
          <li>Access to products is revoked when the subscription ends.</li>
          <li>Previously downloaded files remain on your device but are not re-downloadable after cancellation.</li>
        </ul>
      </div>

      <div className={classes.section}>
        <h2>4. User Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account credentials. You must not share
          your account with others or use another person's account without permission.
        </p>
      </div>

      <div className={classes.section}>
        <h2>5. Intellectual Property</h2>
        <p>
          All content on this site, including but not limited to code, designs, text, and graphics, is the
          intellectual property of QuilCount unless otherwise noted. You may not reproduce, distribute, or
          create derivative works without explicit permission.
        </p>
      </div>

      <div className={classes.section}>
        <h2>6. Limitation of Liability</h2>
        <p>
          Products and services are provided "as is" without warranty of any kind. QuilCount is not liable
          for any damages arising from the use or inability to use the products or services offered on this site.
        </p>
      </div>

      <div className={classes.section}>
        <h2>7. Changes to Terms</h2>
        <p>
          These terms may be updated at any time. Continued use of the site after changes constitutes
          acceptance of the new terms. Significant changes will be communicated via the site.
        </p>
      </div>

      <div className={classes.section}>
        <h2>8. Contact</h2>
        <p>
          If you have questions about these terms, reach out through the Social Links page or send an email directly.
        </p>
      </div>
    </div>
  );
};
