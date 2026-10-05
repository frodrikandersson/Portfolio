import {
  CHIEF_GEAR_MATERIALS,
  CHIEF_GEAR_MATERIAL_LABELS,
  CHIEF_GEAR_ITEM_IDS,
  CHIEF_GEAR_UPGRADES,
  CHIEF_GEAR_SLOT_NAMES,
  CHIEF_GEAR_STEPS,
  chiefGearUpgradeLabel,
} from '../../data/whiteoutChiefGear';
import { consumableIcon } from '../../data/whiteoutItemIcons';
import { formatFull } from '../../utils/whiteoutFormat';
import type { ChiefGearPlan as Plan } from '../../utils/whiteoutChiefGearPlanner';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';
import classes from './WhiteoutUpgradePlanner.module.css';

interface ChiefGearPlanProps {
  plan: Plan;
}

/** Same tidying as the input card: row ids are for joining, not for reading. */
const readable = (index: number) => {
  if (index < 0) return 'nothing built';
  const step = CHIEF_GEAR_STEPS[index];
  const upgrade = CHIEF_GEAR_UPGRADES[step.upgrade];
  const name = chiefGearUpgradeLabel(upgrade);
  if (step.part === step.parts) return name;
  return `${name}, part ${step.part} of ${step.parts}`;
};

const material = (m: (typeof CHIEF_GEAR_MATERIALS)[number]) => (
  <>
    <WhiteoutItemIcon src={consumableIcon(CHIEF_GEAR_ITEM_IDS[m])} size="sm" />
    {CHIEF_GEAR_MATERIAL_LABELS[m]}
  </>
);

/**
 * What to do with the Chief Gear materials on the day the event pays for them.
 *
 * The trades come first on purpose: they have to happen before the upgrades
 * they pay for, and the daily redemption caps mean a player who leaves them to
 * the end can find the shop closed on them.
 */
export const ChiefGearPlan = ({ plan }: ChiefGearPlanProps) => {
  const moved = plan.slots.filter(s => s.steps > 0);

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Chief Gear plan</h3>
        {plan.blockedBy.length > 0 && (
          <span className={classes.limitChip}>
            Ran out of {plan.blockedBy.map(m => CHIEF_GEAR_MATERIAL_LABELS[m]).join(', ')}
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Points</dt>
          <dd>{formatFull(plan.points)}</dd>
        </div>
        <div>
          <dt>Upgrades</dt>
          <dd>{plan.steps.length}</dd>
        </div>
        <div>
          <dt>Slots moved</dt>
          <dd>
            {moved.length} of {plan.slots.length}
          </dd>
        </div>
        <div>
          <dt>Trades</dt>
          <dd>{plan.trades.reduce((total, t) => total + t.times, 0)}</dd>
        </div>
      </dl>

      {plan.steps.length === 0 ? (
        <p className={classes.cardNote}>
          {plan.unpricedSlots.length === plan.slots.length
            ? 'Every slot is past the part of the ladder anyone has costs for, so there is nothing to plan.'
            : 'Nothing in the backpack covers the next upgrade on any slot.'}
        </p>
      ) : (
        <>
          {plan.trades.length > 0 && (
            <>
              <h4 className={classes.groupHeading}>First, at the exchange</h4>
              <ul className={classes.usage}>
                {plan.trades.map(t => (
                  <li key={`${t.from}-${t.to}`}>
                    <span>
                      {material(t.from)} &rarr; {material(t.to)}
                      {/* JSX eats the newline between these two, and the tag is
                          inside the label span so the row's flex gap does not
                          reach it either. The space has to be explicit. */}
                      {t.downgrade && <> <em className={classes.fieldHint}>breaks it down</em></>}
                    </span>
                    <span className={classes.num}>
                      Redeem {formatFull(t.times)}&times;: {formatFull(t.gave)} for{' '}
                      {formatFull(t.got)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className={classes.cardNote}>
                Do these before the upgrades: each trade has a daily redemption cap, and the
                upgrades below assume the materials are already converted.
              </p>
              {/* The warning names whichever trade the plan actually made.
                  Breaking Design Plans down is the damaging one and the one the
                  planner reaches for most; buying Lunar Amber is merely
                  expensive, since plans are its only source. */}
              {plan.trades.some(t => t.downgrade) ? (
                <p className={classes.warnLine}>
                  Most points today, and it costs you. Breaking Design Plans down is close to
                  one way: a plan buys 300 Alloy, but buying that plan back costs 1,000. Alloy and
                  Polishing Solution come back from normal play. Plans do not. Only do this if the
                  points really matter.
                </p>
              ) : (
                <p className={classes.warnLine}>
                  Lunar Amber can only be bought with Design Plans, so this is the price rather
                  than a mistake. It is still 10 plans each, with no way to sell it back.
                </p>
              )}
            </>
          )}

          <h4 className={classes.groupHeading}>Then, the upgrades</h4>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>From</th>
                  <th>To</th>
                  <th className={classes.num}>Upgrades</th>
                  <th className={classes.num}>Points</th>
                </tr>
              </thead>
              <tbody>
                {moved.map(s => (
                  <tr key={s.slot}>
                    <td>{CHIEF_GEAR_SLOT_NAMES[s.slot]}</td>
                    <td>{readable(s.from)}</td>
                    <td>{readable(s.to)}</td>
                    <td className={classes.num}>{s.steps}</td>
                    <td className={classes.num}>{formatFull(s.points)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className={classes.groupHeading}>Materials</h4>
          <ul className={classes.usage}>
            {CHIEF_GEAR_MATERIALS.map(m => (
              <li key={m}>
                <span>{material(m)}</span>
                <span className={classes.num}>
                  <span className={classes.spend}>{formatFull(plan.spent[m])}</span> used,{' '}
                  <span className={classes.left}>{formatFull(plan.left[m])}</span> left
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {plan.unpricedSlots.length > 0 && plan.steps.length > 0 && (
        <p className={classes.cardNote}>
          {plan.unpricedSlots.map(s => CHIEF_GEAR_SLOT_NAMES[s]).join(', ')} stopped because the
          next upgrade&rsquo;s cost is not known yet, not because you ran out.
        </p>
      )}
    </section>
  );
};
