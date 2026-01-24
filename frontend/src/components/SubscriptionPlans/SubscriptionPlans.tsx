import { useSubscriptionPlans } from '../../hooks/useSubscriptionPlans';
import { formatPrice } from '../../utils/formatPrice';
import classes from './SubscriptionPlans.module.css';

export const SubscriptionPlans = () => {
  const {
    isLoggedIn, subStatus, prices, statusLoading,
    portalLoading, error, checkoutLoading, isActive,
    handleSubscribe, handleManage,
  } = useSubscriptionPlans();

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h2>Subscription Package</h2>
        <p>
          Get access to all current and future plugins, tools, and templates with a single subscription.
        </p>
      </div>

      {error && <p className={classes.errorText}>{error}</p>}

      {isActive && subStatus && (
        <div className={classes.statusCard}>
          <h3>Your Subscription</h3>
          <p className={classes.statusActive}>
            Active - {subStatus.subscriptionPlan} plan
          </p>
          {subStatus.subscriptionExpiresAt && (
            <p>Renews: {new Date(subStatus.subscriptionExpiresAt).toLocaleDateString()}</p>
          )}
          <ul className={classes.features}>
            <li>Access to all products included</li>
            <li>Download any product from the Products page</li>
            <li>New releases automatically available</li>
          </ul>
          <button
            className={classes.manageButton}
            onClick={handleManage}
            disabled={portalLoading}
          >
            {portalLoading ? 'Loading...' : 'Manage Subscription'}
          </button>
        </div>
      )}

      {statusLoading && isLoggedIn && (
        <p className={classes.loadingText}>Checking subscription status...</p>
      )}

      {!isActive && !statusLoading && prices && (
        <>
          <div className={classes.benefit}>
            <span className={classes.benefitHighlight}>All Products Access</span>
            <span> — One subscription, every plugin, tool, and template. Current and future releases included.</span>
          </div>
          <div className={classes.plans}>
            <div className={classes.planCard}>
              <div className={classes.planName}>Monthly</div>
              <div className={classes.planPrice}>{formatPrice(prices.monthly)}</div>
              <div className={classes.planInterval}>per month</div>
              <ul className={classes.features}>
                <li>Access to all products</li>
                <li>New releases included</li>
                <li>Cancel anytime</li>
              </ul>
              {isLoggedIn ? (
                <button
                  className={classes.planButton}
                  onClick={() => handleSubscribe('monthly')}
                  disabled={checkoutLoading === 'monthly'}
                >
                  {checkoutLoading === 'monthly' ? 'Loading...' : 'Subscribe Monthly'}
                </button>
              ) : (
                <p className={classes.loginPrompt}>Log in to subscribe</p>
              )}
            </div>

            <div className={classes.planCard}>
              <div className={classes.planName}>Yearly</div>
              <div className={classes.planPrice}>{formatPrice(prices.yearly)}</div>
              <div className={classes.planInterval}>
                per year
                {prices.monthly.unitAmount && prices.yearly.unitAmount
                  ? ` (save ${Math.round(100 - (prices.yearly.unitAmount / (prices.monthly.unitAmount * 12)) * 100)}%)`
                  : ''}
              </div>
              <ul className={classes.features}>
                <li>Access to all products</li>
                <li>New releases included</li>
                <li>Cancel anytime</li>
              </ul>
              {isLoggedIn ? (
                <button
                  className={classes.planButton}
                  onClick={() => handleSubscribe('yearly')}
                  disabled={checkoutLoading === 'yearly'}
                >
                  {checkoutLoading === 'yearly' ? 'Loading...' : 'Subscribe Yearly'}
                </button>
              ) : (
                <p className={classes.loginPrompt}>Log in to subscribe</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
