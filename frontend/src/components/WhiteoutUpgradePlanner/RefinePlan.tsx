import { resourceIcon } from '../../data/whiteoutItemIcons';
import { formatFull } from '../../utils/whiteoutFormat';
import { costPerRefined, tierForRefine } from '../../data/whiteoutCrystalLab';
import type { RefinePlan as Plan } from '../../utils/whiteoutRefinePlanner';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';
import classes from './WhiteoutUpgradePlanner.module.css';

interface RefinePlanProps {
  plan: Plan;
  /** Super Refinements already run this week, for showing where you are. */
  refinesDone: number;
  day: number | null;
  /**
   * Extra points the UPGRADE PLAN scores because the crystals were refined
   * first. Refining itself pays nothing.
   *
   * Worth being exact about, because "Points gained" on a panel headed Crystal
   * Laboratory reads as though the conversion scored, and it does not. The two
   * rows that pay are "use 1 Fire Crystal to upgrade buildings" and "use 1
   * Refined Fire Crystal to upgrade buildings". This figure is the difference
   * between those two rows' takings across the plan solved both ways, so every
   * point in it is paid for pouring a crystal into a building, never for
   * standing at the lab.
   *
   * From solving the upgrade plan with and without it.
   *
   * Not plan.pointsGained, which compares rates alone and assumes every
   * crystal on both sides gets spent. They are only ever spent by building
   * upgrades, so a board with nothing left to pour them into makes that
   * estimate badly wrong: measured once, it promised +70,000 on a plan the
   * conversion actually made 180,320 worse.
   */
  gain: number;
}

/** Full sentences, because these follow each other into different frames. */
const STOPPED: Record<Plan['stoppedBecause'], string> = {
  crystals: 'Stopped there because the Fire Crystals ran out.',
  'weekly-limit': 'That is the weekly limit of 100 reached.',
  'not-worth-it': 'Stopped there because the next refine costs more than it returns.',
  'nothing-to-do': 'Nothing to refine.',
};

/**
 * Whether to run Super Refinements, and how many.
 *
 * The in-game screen makes the later tiers look like the good ones: it badges
 * Super Refinement II "Favored" and shows bigger numbers on both sides. The
 * payout does rise, but the cost rises faster, so the price of one Refined
 * Fire Crystal nearly triples from the first tier to the last. This panel's
 * whole job is to say where that stops being worth it.
 */
export const RefinePlan = ({ plan, refinesDone, day, gain }: RefinePlanProps) => {
  const next = tierForRefine(refinesDone + plan.refines + 1);

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Crystal Laboratory</h3>
        {plan.refines === 0 && <span className={classes.limitChip}>nothing worth refining</span>}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Super Refinements</dt>
          <dd>{plan.refines}</dd>
        </div>
        <div>
          <dt>Fire Crystals</dt>
          <dd>
            <span className={classes.spend}>{formatFull(plan.crystalsSpent)}</span> of{' '}
            <span className={classes.left}>{formatFull(plan.crystalsLeft)}</span> left
          </dd>
        </div>
        <div>
          <dt>Refined, on average</dt>
          <dd>{plan.refinedGained.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Extra points from upgrades</dt>
          <dd className={classes.left}>
            {gain > 0 ? `+${formatFull(Math.round(gain))}` : '0'}
          </dd>
        </div>
        {day !== null && (
          <div>
            <dt>Spend on</dt>
            <dd>Day {day}</dd>
          </div>
        )}
      </dl>

      {/*
        The one sentence this panel was missing.
        +708,000 under a heading that says Crystal Laboratory reads as though
        refining scored, and it does not. The points are the UPGRADE PLAN's:
        the event pays more for a Refined crystal poured into a building than
        for a raw one, so converting first and then building is worth more than
        building with the raw crystals. Fredrik worked that out from the
        numbers, which is one reader too many.
      */}
      <p className={classes.cardNote}>
        <strong>Refining scores nothing by itself.</strong> Those points are what your{' '}
        <em>building upgrades</em> earn afterwards, because this event pays more per Refined
        crystal put into a building than per raw one.
      </p>

      {/* The basic Refine is a separate question with no decision in it: the
          allowance is free points if the resources are spare, so it is stated
          rather than weighed. */}
      <p className={classes.cardNote}>
        <strong>Every day:</strong> run all {plan.daily.refines} basic Refines, at{' '}
        {formatFull(plan.daily.resourcesEach)} of each resource for roughly{' '}
        {formatFull(Math.round(plan.daily.points))} points. Nothing else turns spare resources
        into points at that rate.
      </p>

      {plan.byTier.length > 0 && (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Tier</th>
                <th className={classes.num}>Refines</th>
                <th className={classes.num}>Fire Crystals</th>
                <th className={classes.num}>Refined</th>
                <th className={classes.num}>Each costs</th>
                <th className={classes.num}>vs spending raw</th>
              </tr>
            </thead>
            <tbody>
              {plan.byTier.map(t => {
                const tier = tierForRefine(t.tier === 1 ? 1 : (t.tier - 1) * 20 + 1);
                const gain = t.pointsGained - t.pointsIfSpentRaw;
                return (
                  <tr key={t.tier}>
                    <td>Super Refinement {t.tier}</td>
                    <td className={classes.num}>{t.refines}</td>
                    <td className={classes.num}>{formatFull(t.crystalsSpent)}</td>
                    <td className={classes.num}>{t.refinedGained.toFixed(1)}</td>
                    <td className={classes.num}>
                      {tier ? `${costPerRefined(tier).toFixed(1)} FC` : '-'}
                    </td>
                    <td className={classes.num}>
                      {gain > 0 ? `+${formatFull(Math.round(gain))}` : formatFull(Math.round(gain))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className={classes.cardNote}>
        <WhiteoutItemIcon src={resourceIcon('refinedFireCrystal')} reserve={false} />
        {refinesDone > 0 && `${refinesDone} already run this week. `}
        {next && plan.stoppedBecause === 'not-worth-it' ? (
          <>
            Stop after those {plan.refines}: the next one is Super Refinement {next.tier} at{' '}
            {costPerRefined(next).toFixed(1)} Fire Crystals per Refined, which scores less than
            spending them straight into buildings.
          </>
        ) : (
          STOPPED[plan.stoppedBecause]
        )}
      </p>

      {plan.notes.map(note => (
        <p key={note} className={classes.cardNote}>
          {note}
        </p>
      ))}

    </section>
  );
};
