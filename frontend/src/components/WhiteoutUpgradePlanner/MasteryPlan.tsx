import { formatFull } from '../../utils/whiteoutFormat';
import type { MasteryPlan as Plan } from '../../utils/whiteoutMasteryPlanner';
import classes from './WhiteoutUpgradePlanner.module.css';

interface MasteryPlanProps {
  plan: Plan;
  /** Points the event pays per Essence Stone used. */
  pointsPerStone: number;
}

const at = (p: { level: number; stage: number }) =>
  p.stage > 0 ? `Lv ${p.level}.${p.stage}` : `Lv ${p.level}`;

/**
 * Which of the twelve pieces to forge.
 *
 * The event pays per stone SPENT, so a bag total is not the answer: stones only
 * move through Mastery Forging, and Mastery Forging needs Mythic Gear from
 * Lv 11 up. That second limit is the one that surprises people, which is why a
 * gear shortfall gets its own line rather than being folded into a total.
 */
export const MasteryPlan = ({ plan, pointsPerStone }: MasteryPlanProps) => (
  <section className={classes.result}>
    <div className={classes.resultHeader}>
      <h3>Mastery Forging plan</h3>
      {plan.stonesStranded > 0 && (
        <span className={classes.limitChip}>
          {formatFull(plan.stonesStranded)} cannot be used
        </span>
      )}
    </div>

    <dl className={classes.stats}>
      <div>
        <dt>Points</dt>
        <dd>{formatFull(plan.stonesSpent * pointsPerStone)}</dd>
      </div>
      <div>
        <dt>Stones used</dt>
        <dd>
          <span className={classes.spend}>{formatFull(plan.stonesSpent)}</span> of{' '}
          <span className={classes.left}>{formatFull(plan.stonesHeld - plan.stonesSpent)}</span>{' '}
          left
        </dd>
      </div>
      <div>
        <dt>Mythic Gear used</dt>
        <dd>
          <span className={classes.spend}>{formatFull(plan.gearSpent)}</span> of{' '}
          <span className={classes.left}>{formatFull(plan.gearHeld - plan.gearSpent)}</span> left
        </dd>
      </div>
      <div>
        <dt>Pieces moved</dt>
        <dd>{plan.moves.length}</dd>
      </div>
    </dl>

    {plan.nothingLeftToForge ? (
      <p className={classes.cardNote}>
        All twelve pieces are at Mastery 20, so there is nothing left for Essence Stones to buy.
        Every stone held scores nothing on this day.
      </p>
    ) : plan.moves.length === 0 ? (
      <p className={classes.cardNote}>
        Nothing can be forged yet.{' '}
        {plan.limitedBy === 'mythic gear'
          ? 'Every piece is sitting on a step that wants Mythic Gear, and there is none in the backpack.'
          : 'There are no Essence Stones in the backpack to spend.'}
      </p>
    ) : (
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Piece</th>
              <th>From</th>
              <th>To</th>
              <th className={classes.num}>Steps</th>
              <th className={classes.num}>Stones</th>
              <th className={classes.num}>Gear</th>
              <th className={classes.num}>Points</th>
            </tr>
          </thead>
          <tbody>
            {plan.moves.map(move => (
              <tr key={move.pieceId}>
                {/* No icon here on purpose: it would be the same Essence Stone
                    twelve times over, which repeats rather than identifies. The
                    piece name is the identifying thing. */}
                <td>{move.label}</td>
                <td>{at(move.from)}</td>
                <td>{at(move.to)}</td>
                <td className={classes.num}>{move.steps}</td>
                <td className={classes.num}>{formatFull(move.stones)}</td>
                <td className={classes.num}>{move.mythicGear || '–'}</td>
                <td className={classes.num}>{formatFull(move.stones * pointsPerStone)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* The gear shortfall is the interesting one. Stones left over because the
        pieces are finished is arithmetic; stones left over because there is no
        Mythic Gear is a thing the player can go and fix. */}
    {plan.limitedBy === 'mythic gear' && plan.stonesStranded > 0 && (
      <p className={classes.warnLine}>
        {formatFull(plan.stonesStranded)} stones are stuck behind Mythic Gear, not behind mastery.
        Every step from Lv 11 up wants spare Mythic pieces, and the twelve need{' '}
        {formatFull(plan.roomGear)} in all to open the{' '}
        {formatFull(plan.roomStones)} of forging left. Those stranded stones are worth{' '}
        <strong>{formatFull(plan.stonesStranded * pointsPerStone)}</strong> the moment the gear
        turns up.
      </p>
    )}

    {plan.limitedBy === 'stones' && (
      <p className={classes.cardNote}>
        Every stone went in. The twelve pieces could take another{' '}
        {formatFull(plan.roomStones - plan.stonesSpent)} before they are finished.
      </p>
    )}

    {plan.limitedBy === null && !plan.nothingLeftToForge && plan.stonesStranded > 0 && (
      <p className={classes.cardNote}>
        {formatFull(plan.stonesStranded)} left over with every piece at Mastery 20. There is
        nothing further to spend them on.
      </p>
    )}
  </section>
);
