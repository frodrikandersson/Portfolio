import { petById } from '../../data/whiteoutPets';
import { formatFull } from '../../utils/whiteoutFormat';
import { PET_POOL_LABELS, type PetPlan as Plan, type PetPools } from '../../utils/whiteoutPetPlanner';
import classes from './WhiteoutUpgradePlanner.module.css';

interface PetPlanProps {
  plan: Plan;
  /** Points the event pays per 1 advancement score. */
  pointsPerScore: number;
  /** The day this lands on. */
  day: number | null;
}

const POOLS: (keyof PetPools)[] = ['food', 'manuals', 'potions', 'serums'];

/**
 * Which pets to advance, and how far the materials go.
 *
 * The event pays per point of advancement score, and every pet grants the same
 * score at a given level, so the plan is really a shopping order: spend on
 * whichever pet reaches the next tenth cheapest. That usually means the low
 * rarity pets first, which is the opposite of how pets are normally ranked.
 */
export const PetPlan = ({ plan, pointsPerScore, day }: PetPlanProps) => {
  const moves = plan.jumps.filter(j => j.to > j.from).sort((a, b) => b.score - a.score);

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Pet plan</h3>
        {plan.limitingFactors.length > 0 && (
          <span className={classes.limitChip}>
            short of {plan.limitingFactors.map(f => PET_POOL_LABELS[f]).join(', ')}
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Points</dt>
          <dd>{formatFull(Math.round(plan.score * pointsPerScore))}</dd>
        </div>
        <div>
          <dt>Advancement score</dt>
          <dd>{formatFull(plan.score)}</dd>
        </div>
        <div>
          <dt>Advancements</dt>
          <dd>{moves.reduce((s, j) => s + j.levels.length, 0)}</dd>
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
          Nothing to spend. Set which pets you own on the Pets card and enter your Pet Food,
          Taming Manuals, Energizing Potions and Strengthening Serums on the Consumables card.
        </p>
      ) : (
        <>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>From</th>
                  <th>To</th>
                  <th className={classes.num}>Food</th>
                  <th className={classes.num}>Manuals</th>
                  <th className={classes.num}>Potions</th>
                  <th className={classes.num}>Serums</th>
                  <th className={classes.num}>Points</th>
                </tr>
              </thead>
              <tbody>
                {moves.map(j => (
                  <tr key={j.petId}>
                    <td>{petById.get(j.petId)?.name ?? j.petId}</td>
                    <td>Lv. {j.from}</td>
                    <td>Lv. {j.to}</td>
                    <td className={classes.num}>{formatFull(j.cost.food)}</td>
                    <td className={classes.num}>{formatFull(j.cost.manuals)}</td>
                    <td className={classes.num}>{j.cost.potions > 0 ? formatFull(j.cost.potions) : '-'}</td>
                    <td className={classes.num}>{j.cost.serums > 0 ? formatFull(j.cost.serums) : '-'}</td>
                    <td className={classes.num}>{formatFull(Math.round(j.score * pointsPerScore))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className={classes.usage}>
            {POOLS.filter(k => plan.spent[k] > 0 || plan.left[k] > 0).map(k => (
              <li key={k}>
                <span>{PET_POOL_LABELS[k]}</span>
                <span className={classes.num}>
                  <span className={classes.spend}>{formatFull(plan.spent[k])}</span> used,{' '}
                  <span className={classes.left}>{formatFull(plan.left[k])}</span> left
                </span>
              </li>
            ))}
          </ul>

          {plan.limitingFactors.includes('serums') && (
            <p className={classes.cardNote}>
              Strengthening Serums are the wall. Nothing below Lv. 50 wants them, so Food and
              Manuals pile up behind the first pet that reaches it.
            </p>
          )}
        </>
      )}
    </section>
  );
};
