import { CHARM_TYPES, CHARMS_PER_TYPE } from '../../data/whiteoutChiefCharms';
import { formatFull } from '../../utils/whiteoutFormat';
import {
  charmPositionLabel,
  CHARM_STEP_COUNT,
  type CharmPlan as Plan,
} from '../../utils/whiteoutCharmPlanner';
import classes from './WhiteoutUpgradePlanner.module.css';

interface CharmPlanProps {
  plan: Plan;
  /** Points the event pays per 1 Charm score, for showing what it is worth. */
  pointsPerScore: number;
  /** The day this lands on, so the panel can say when to spend. */
  day: number | null;
}

const MATERIAL_LABELS: Record<keyof Plan['spent'], string> = {
  guides: 'Charm Guides',
  designs: 'Charm Designs',
  secrets: 'Charm Secrets',
};

/** Which of the eighteen a slot index is, in the words the card uses. */
const charmName = (index: number) => {
  const type = CHARM_TYPES[Math.floor(index / CHARMS_PER_TYPE)];
  return type ? `${type.label} ${(index % CHARMS_PER_TYPE) + 1}` : `Charm ${index + 1}`;
};

/**
 * How far the charm materials go, and where to put them.
 *
 * The event pays per point of Charm score, so the useful answer is not the
 * size of the pile but which charms to move and how far. Jumps of several
 * instalments are shown as one move, because that is how the planner decides:
 * a level can be worse value than the one above it, so stopping half way is
 * sometimes worse than not starting.
 */
export const CharmPlan = ({ plan, pointsPerScore, day }: CharmPlanProps) => {
  const moves = plan.jumps.filter(j => j.to > j.from).sort((a, b) => b.score - a.score);
  const finished = plan.positions.filter(p => p >= CHARM_STEP_COUNT).length;

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Chief Charm plan</h3>
        {plan.limitingFactors.length > 0 && (
          <span className={classes.limitChip}>
            short of {plan.limitingFactors.map(f => MATERIAL_LABELS[f]).join(', ')}
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Points</dt>
          <dd>{formatFull(Math.round(plan.score * pointsPerScore))}</dd>
        </div>
        <div>
          <dt>Charm score</dt>
          <dd>{formatFull(plan.score)}</dd>
        </div>
        <div>
          <dt>Charms moved</dt>
          <dd>
            {moves.length} of {plan.positions.length}
            {finished > 0 ? ` (${finished} at Lv. 18)` : ''}
          </dd>
        </div>
        {day !== null && (
          <div>
            <dt>Spend on</dt>
            <dd>Day {day}</dd>
          </div>
        )}
      </dl>

      {moves.length === 0 ? (
        <p className={classes.cardNote}>
          Nothing to spend. Enter your Charm Guides, Designs and Secrets on the Consumables card
          and where each charm sits on the Chief Charms card.
        </p>
      ) : (
        <>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Charm</th>
                  <th>From</th>
                  <th>To</th>
                  <th className={classes.num}>Guides</th>
                  <th className={classes.num}>Designs</th>
                  <th className={classes.num}>Secrets</th>
                  <th className={classes.num}>Points</th>
                </tr>
              </thead>
              <tbody>
                {moves.map(j => (
                  <tr key={j.charm}>
                    <td>{charmName(j.charm)}</td>
                    <td>{charmPositionLabel(j.from)}</td>
                    <td>{charmPositionLabel(j.to)}</td>
                    <td className={classes.num}>{formatFull(j.guides)}</td>
                    <td className={classes.num}>{formatFull(j.designs)}</td>
                    <td className={classes.num}>{j.secrets > 0 ? formatFull(j.secrets) : '-'}</td>
                    <td className={classes.num}>{formatFull(Math.round(j.score * pointsPerScore))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className={classes.usage}>
            {(Object.keys(MATERIAL_LABELS) as (keyof Plan['spent'])[])
              .filter(k => plan.spent[k] > 0 || plan.left[k] > 0)
              .map(k => (
                <li key={k}>
                  <span>{MATERIAL_LABELS[k]}</span>
                  <span className={classes.num}>
                    <span className={classes.spend}>{formatFull(plan.spent[k])}</span> used,{' '}
                    <span className={classes.left}>{formatFull(plan.left[k])}</span> left
                  </span>
                </li>
              ))}
          </ul>

          {plan.limitingFactors.includes('secrets') && (
            <p className={classes.cardNote}>
              Charm Secrets are the wall. They are not wanted at all below Lv. 11.1 and then every
              step needs them, so Guides and Designs pile up behind them.
            </p>
          )}
        </>
      )}
    </section>
  );
};
