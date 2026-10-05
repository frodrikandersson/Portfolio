import { WHEEL_LAST_MILESTONE, WHEEL_MILESTONES, wheelGemCost } from '../../data/whiteoutLuckyWheel';
import { formatFull } from '../../utils/whiteoutFormat';
import {
  wheelGemsPerShard,
  wheelStoppingPoints,
  type WheelPlan,
} from '../../utils/whiteoutWheelPlanner';
import classes from './WhiteoutUpgradePlanner.module.css';

interface LuckyWheelPlanProps {
  plan: WheelPlan;
  /** The day being looked at, so its own line can be picked out. */
  activeDay: number;
}

/**
 * How many times to spin, and on which day.
 *
 * The wheel is the one place in an event where the split matters more than the
 * total, because its milestones reset daily. Spreading the same gems across
 * two days collects the milestones twice, so the plan is per day rather than a
 * single number, and the other days are shown too: a player reading Day 3
 * needs to know what Day 2 was supposed to have done.
 */
export const LuckyWheelPlan = ({ plan, activeDay }: LuckyWheelPlanProps) => {
  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Lucky Wheel plan</h3>
        {plan.tailSpins > 0 && (
          <span className={classes.limitChip}>
            {formatFull(plan.tailSpins)} past the last milestone
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Spins</dt>
          <dd>{formatFull(plan.totalSpins)}</dd>
        </div>
        <div>
          <dt>Gems</dt>
          <dd>
            <span className={classes.spend}>{formatFull(plan.gemsSpent)}</span> of{' '}
            <span className={classes.left}>{formatFull(plan.gemsHeld - plan.gemsSpent)}</span> left
          </dd>
        </div>
        <div>
          <dt>Shards expected</dt>
          <dd>{plan.shards.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Event points</dt>
          <dd>{formatFull(plan.points)}</dd>
        </div>
      </dl>

      {plan.totalSpins === 0 ? (
        <p className={classes.cardNote}>
          Not enough gems for a single spin. Ten at a time is the cheaper rate, so the first
          worthwhile purchase is a batch of ten.
        </p>
      ) : (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Day</th>
                <th className={classes.num}>Spins</th>
                <th className={classes.num}>Gems</th>
                <th className={classes.num}>Points</th>
              </tr>
            </thead>
            <tbody>
              {plan.days.map(d => (
                <tr key={d.day}>
                  <td>
                    Day {d.day}
                    {d.day === activeDay ? ' (this one)' : ''}
                  </td>
                  <td className={classes.num}>{formatFull(d.spins)}</td>
                  <td className={classes.num}>{formatFull(d.gems)}</td>
                  <td className={classes.num}>{formatFull(d.points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* The one thing a player needs to understand, rather than a list of
          rates: the bonuses are per event, so the total is what matters. */}
      <p className={classes.cardNote}>
        The wheel&rsquo;s bonus shards count <strong>once per event</strong>, not per day, so the
        total is what earns them and the split does not. Reaching{' '}
        {WHEEL_LAST_MILESTONE} spins across the event collects all{' '}
        {WHEEL_MILESTONES.reduce((sum, m) => sum + m.shards, 0)} of them; the spins themselves
        only pay about half a shard each. This plan runs at{' '}
        <strong>{formatFull(Math.round(wheelGemsPerShard(plan)))}</strong> gems a shard, against{' '}
        <strong>897</strong> for a full {WHEEL_LAST_MILESTONE}, which is the best the wheel
        offers.
      </p>

      {plan.tailSpins > 0 && (
        <p className={classes.warnLine}>
          {formatFull(plan.tailSpins)} of these spins come after the last milestone, where every
          bonus has already been paid. They cost about <strong>2,470 gems a shard</strong> against
          roughly 900 for the ones before, so they are worth buying for the event points and not
          for the shards.
        </p>
      )}

      {plan.gemsLeft > 0 && plan.tailSpins === 0 && !plan.shortOfMilestones && (
        <p className={classes.cardNote}>
          {formatFull(plan.gemsLeft)} gems are left over. Every milestone is already paid, so
          more spins would earn only the roll itself, about half a shard each. They are still
          worth event points if you want them, which is a call about ranking rather than shards.
        </p>
      )}

      {/* Where to stop is the player's call, not the planner's: it turns on
          how fast gems come back, which nothing here can see. */}
      <details className={classes.rates}>
        <summary>Where to stop, and what each costs</summary>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th className={classes.num}>Spins</th>
                <th className={classes.num}>Gems</th>
                <th className={classes.num}>Shards</th>
                <th className={classes.num}>Gems each</th>
              </tr>
            </thead>
            <tbody>
              {wheelStoppingPoints().map(stop => (
                <tr key={stop.spins}>
                  <td className={classes.num}>{stop.spins}</td>
                  <td className={classes.num}>{formatFull(stop.gems)}</td>
                  <td className={classes.num}>{stop.shards.toFixed(1)}</td>
                  <td className={classes.num}>{formatFull(Math.round(stop.gemsPerShard))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={classes.cardNote}>
          The best rate is <strong>35 spins</strong>, not {WHEEL_LAST_MILESTONE}. Going all the
          way costs {formatFull(wheelGemCost(WHEEL_LAST_MILESTONE))} gems every event, so if that
          is more than comes back between events, stopping lower and spinning every time beats
          emptying the bag once. Stopping exactly on a milestone is worth a few single spins: 35
          costs {formatFull(wheelGemCost(35))} where 40 in clean batches costs{' '}
          {formatFull(wheelGemCost(40))} and reaches the same milestone.
        </p>
      </details>

      {plan.shortOfMilestones && (
        <p className={classes.cardNote}>
          {formatFull(plan.idealGems)} gems would reach {WHEEL_LAST_MILESTONE} spins and collect
          every bonus, which is{' '}
          {formatFull(Math.max(plan.idealGems - plan.gemsSpent, 0))} more than this plan spends.
        </p>
      )}
    </section>
  );
};
