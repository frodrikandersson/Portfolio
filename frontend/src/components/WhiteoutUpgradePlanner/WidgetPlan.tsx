import { WIDGET_MAX_LEVEL } from '../../data/whiteoutConsumables';
import { consumableIcon, widgetChestIcon } from '../../data/whiteoutItemIcons';
import { formatFull } from '../../utils/whiteoutFormat';
import type { WidgetPlan as Plan } from '../../utils/whiteoutWidgetPlanner';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';
import { WhiteoutHeroPortrait } from '../WhiteoutItemIcon/WhiteoutHeroPortrait';
import classes from './WhiteoutUpgradePlanner.module.css';

interface WidgetPlanProps {
  plan: Plan;
  /** Points the event pays per widget used, for showing what it is worth. */
  pointsPerWidget: number;
}

/**
 * Which heroes to put the widgets into.
 *
 * The event pays per widget USED, so the useful answer is not how many are in
 * the bag but which gear to pour them into and how far that gets. Anything the
 * plan cannot spend is called out rather than quietly counted, because a
 * player looking at a big number wants to know it is real.
 */
export const WidgetPlan = ({ plan, pointsPerWidget }: WidgetPlanProps) => {
  const moving = plan.generations
    .flatMap(g => g.heroes.map(h => ({ ...h, chestId: g.chestId })))
    .filter(h => h.to > h.from);

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Widget plan</h3>
        {plan.strandedMaxed > 0 && (
          <span className={classes.limitChip}>
            {formatFull(plan.strandedMaxed)} cannot be used
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Points</dt>
          <dd>{formatFull(plan.spent * pointsPerWidget)}</dd>
        </div>
        <div>
          <dt>Widgets used</dt>
          <dd>
            <span className={classes.spend}>{formatFull(plan.spent)}</span> of{' '}
            <span className={classes.left}>{formatFull(plan.held - plan.spent)}</span> left
          </dd>
        </div>
        <div>
          <dt>Gear levels</dt>
          <dd>{moving.reduce((sum, h) => sum + (h.to - h.from), 0)}</dd>
        </div>
        <div>
          <dt>Heroes</dt>
          <dd>{moving.length}</dd>
        </div>
      </dl>

      {moving.length === 0 ? (
        <p className={classes.cardNote}>
          Nothing in the backpack covers a level up. A level costs five more than the last, 5 for
          the first and 50 for the tenth, so a part-filled pile waits until it can afford the next
          one.
        </p>
      ) : (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Hero</th>
                <th>Gen</th>
                <th>From</th>
                <th>To</th>
                <th className={classes.num}>Widgets</th>
                <th className={classes.num}>Points</th>
              </tr>
            </thead>
            <tbody>
              {moving.map(h => (
                <tr key={h.widgetId}>
                  <td>
                    <WhiteoutItemIcon src={consumableIcon(h.widgetId)} size="sm" />
                    {h.hero}
                  </td>
                  <td>
                    <WhiteoutItemIcon src={widgetChestIcon(h.generation)} size="sm" />
                    {h.generation}
                  </td>
                  <td>Lv {h.from}</td>
                  <td>Lv {h.to}</td>
                  <td className={classes.num}>{formatFull(h.spent)}</td>
                  <td className={classes.num}>{formatFull(h.spent * pointsPerWidget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* The two kinds of leftover are worth separating: one is a warning, the
          other is just arithmetic. */}
      {plan.strandedMaxed > 0 && (
        <p className={classes.warnLine}>
          {formatFull(plan.strandedMaxed)} widget{plan.strandedMaxed === 1 ? '' : 's'} can never be
          spent: their hero is already at Lv {WIDGET_MAX_LEVEL}, and a hero-specific widget does
          not transfer. Worth{' '}
          <strong>{formatFull(plan.strandedMaxed * pointsPerWidget)}</strong> if the game let you,
          which it does not.
        </p>
      )}

      {plan.strandedShort > 0 && (
        <p className={classes.cardNote}>
          {formatFull(plan.strandedShort)} left over, short of the next level&rsquo;s price rather
          than stuck. They will spend as soon as more arrive.
        </p>
      )}

      {moving.length > 0 && (
        <div className={classes.heroList}>
          {moving.slice(0, 6).map(h => (
            <WhiteoutHeroPortrait key={`art-${h.widgetId}`} name={h.hero} />
          ))}
        </div>
      )}
    </section>
  );
};
