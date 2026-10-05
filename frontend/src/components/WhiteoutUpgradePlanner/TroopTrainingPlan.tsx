import { TROOP_TYPE_LABELS, type TroopType } from '../../data/whiteoutTroops';
import type { TroopPlan } from '../../utils/whiteoutTroopOptimizer';
import { formatDuration } from '../../utils/whiteoutScoring';
import { formatFull } from '../../utils/whiteoutFormat';
import classes from './WhiteoutUpgradePlanner.module.css';

interface TroopTrainingPlanProps {
  /** The speedup-funded plan, or null when burning the pile paid more. */
  troops: TroopPlan | null;
  /** Batches queued before the event, which cost no speedups at all. */
  preQueued: { type: TroopType; tier: number; count: number; points: number }[];
}

const RESOURCES = ['meat', 'wood', 'coal', 'iron'] as const;

/**
 * What to train and what to promote on the troop day.
 *
 * The mix is the whole point. Training a fresh troop scores its full tier
 * value; promoting one only scores the gap between the tier it was and the tier
 * it becomes, so per resource spent training is well ahead. Per second they are
 * close enough to be a wash. Which means the answer swings on whichever of the
 * two has run out, and on how many idle low-tier troops are sitting there, so
 * neither is preferred outright.
 *
 * Promotions are also why the day total is not just the sum of the rows below:
 * no scoring row represents a tier gap, so those points are banked against the
 * day separately.
 */
export const TroopTrainingPlan = ({ troops, preQueued }: TroopTrainingPlanProps) => {
  const actions = troops?.actions ?? [];
  const promoted = actions.filter(a => a.kind === 'promote');
  const trainPoints = actions.filter(a => a.kind === 'train').reduce((s, a) => s + a.points, 0);
  const promotePoints = promoted.reduce((s, a) => s + a.points, 0);
  const queuedPoints = preQueued.reduce((s, b) => s + b.points, 0);
  const total = (troops?.points ?? 0) + queuedPoints;

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Troop training plan</h3>
        {troops && troops.limitingFactors.length > 0 && (
          <span className={classes.limitChip}>
            Ran out of{' '}
            {troops.limitingFactors.map(f => (f === 'time' ? 'training speedups' : f)).join(', ')}
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Points</dt>
          <dd>{formatFull(total)}</dd>
        </div>
        <div>
          <dt>From the queued batch</dt>
          <dd>{formatFull(queuedPoints)}</dd>
        </div>
        <div>
          <dt>From training</dt>
          <dd>{formatFull(trainPoints)}</dd>
        </div>
        <div>
          <dt>From promoting</dt>
          <dd>{formatFull(promotePoints)}</dd>
        </div>
      </dl>

      {preQueued.length > 0 && (
        <>
          <p className={classes.cardNote}>
            <strong>Queue these before the event.</strong> They finish on the scoring day and cost
            no speedups, so they are counted whether or not burning the pile beat training with it.
            Capacity is the only thing capping them, which is why the Capacity Enhance item and the
            Minister appointment are worth more on this day than any amount of speedups.
          </p>
          <ul className={classes.usage}>
            {preQueued.map(b => (
              <li key={`${b.type}-${b.tier}`}>
                <span>
                  {formatFull(b.count)} {TROOP_TYPE_LABELS[b.type]} at T{b.tier}
                </span>
                <span className={classes.num}>{formatFull(b.points)} pts</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {actions.length > 0 ? (
        <>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Do</th>
                  <th>Troops</th>
                  <th>Tier</th>
                  <th className={classes.num}>Count</th>
                  <th className={classes.num}>Points</th>
                  <th className={classes.num}>Time</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a, i) => (
                  <tr key={`${a.kind}-${a.type}-${a.fromTier ?? 0}-${a.toTier}-${i}`}>
                    <td>{a.kind === 'train' ? 'Train' : 'Promote'}</td>
                    <td>{TROOP_TYPE_LABELS[a.type]}</td>
                    <td>
                      {a.kind === 'promote' ? `T${a.fromTier} to T${a.toTier}` : `T${a.toTier}`}
                    </td>
                    <td className={classes.num}>{formatFull(a.count)}</td>
                    <td className={classes.num}>{formatFull(a.points)}</td>
                    <td className={classes.num}>{formatDuration(a.seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {promoted.length > 0 && (
            <p className={classes.cardNote}>
              A promotion only scores the gap between the two tiers, not the full value of the
              higher one, so it looks weak per troop. It wins anyway when the troops are already
              sitting there: the lower tiers cost nothing more to own, and promoting them spends
              far less than training the same number from scratch.
            </p>
          )}

          {troops && (
            <ul className={classes.usage}>
              {RESOURCES.filter(r => troops.resourcesUsed[r] > 0).map(r => (
                <li key={r}>
                  <span>{r[0].toUpperCase() + r.slice(1)}</span>
                  <span className={classes.num}>
                    {formatFull(troops.resourcesUsed[r])} used,{' '}
                    {formatFull(troops.remaining[r])} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : preQueued.length === 0 ? (
        <p className={classes.cardNote}>
          Nothing to train. Set your camp capacity and the highest tier each camp can reach in Your
          inventory, and add the resources to pay for the batch.
        </p>
      ) : null}
    </section>
  );
};
