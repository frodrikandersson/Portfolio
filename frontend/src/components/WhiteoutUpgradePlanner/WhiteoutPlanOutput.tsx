import { LuckyWheelPlan } from './LuckyWheelPlan';
import type { WheelPlan as WheelPlanShape } from '../../utils/whiteoutWheelPlanner';
import { CharmPlan } from './CharmPlan';
import { PetPlan } from './PetPlan';
import { RefinePlan } from './RefinePlan';
import { ExpertPlan } from './ExpertPlan';
import { HeroShardPlan } from './HeroShardPlan';
import type { ExpertPlan as ExpertPlanShape } from '../../utils/whiteoutExpertPlanner';
import type { SigilSpend } from '../../utils/whiteoutExpertGates';
import type { RefinePlan as RefinePlanShape } from '../../utils/whiteoutRefinePlanner';
import type { PetPlan as PetPlanShape } from '../../utils/whiteoutPetPlanner';
import type { CharmPlan as CharmPlanShape } from '../../utils/whiteoutCharmPlanner';
import { MasteryPlan } from './MasteryPlan';
import type { MasteryPlan as MasteryPlanShape } from '../../utils/whiteoutMasteryPlanner';
import {
  WHITEOUT_RESOURCES,
  RESOURCE_LABELS,
  type WhiteoutResource,
} from '../../data/whiteoutBuildings';
import { summariseSteps, type OptimizerResult } from '../../utils/whiteoutOptimizer';
import { summariseResearch, type ResearchPlan } from '../../utils/whiteoutResearchOptimizer';
import { formatDuration } from '../../utils/whiteoutScoring';
import { resourceIcon } from '../../data/whiteoutItemIcons';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';
import { formatFull } from '../../utils/whiteoutFormat';
import type { ChiefGearPlan as GearPlan } from '../../utils/whiteoutChiefGearPlanner';
import { ChiefGearPlan } from './ChiefGearPlan';
import type { WidgetPlan as WidgetPlanShape } from '../../utils/whiteoutWidgetPlanner';
import { WidgetPlan } from './WidgetPlan';
import { GENERAL_TARGET_LABELS, type WhiteoutInventory } from '../../models/whiteoutInventory';
import type { DeriveResult } from '../../utils/whiteoutDerive';
import { GatheringPlan } from './GatheringPlan';
import { TroopTrainingPlan } from './TroopTrainingPlan';
import type { TroopPlan } from '../../utils/whiteoutTroopOptimizer';
import type { TroopType } from '../../data/whiteoutTroops';
import type { GatherPlan } from '../../utils/whiteoutGathering';
import classes from './WhiteoutUpgradePlanner.module.css';

interface WhiteoutPlanOutputProps {
  plan: OptimizerResult;
  research: ResearchPlan;
  /** Needed to say why a plan came back empty, rather than guessing. */
  inventory: WhiteoutInventory;
  /** The day the player is looking at. */
  activeDay: number;
  /** True when the event has no stages, so a day number would mean nothing. */
  singleStage?: boolean;
  /** What the scoring engine decided to do with this plan's power. */
  buildingPowerPlan: DeriveResult['buildingPowerPlan'];
  /** The day the construction work scores, or null when nothing pays for it. */
  upgradeDay: number | null;
  /** The Lucky Wheel plan, and the days it covers. */
  wheel: WheelPlanShape | null;
  wheelDays: number[];
  /** The day research speedups were assigned to, or null when unspent. */
  researchDay: number | null;
  /** The gathering day, or null when no gathering speed has been entered. */
  gathering: GatherPlan | null;
  /** Days of this event that score resources gathered. */
  gatherDays: number[];
  /** Points per unit of each resource on the day being scored. */
  gatherPerUnit: Record<string, number>;
  /**
   * The troop plan, or null when it was dropped because burning the training
   * speedups raw pays more than the troops they would train.
   */
  troops: TroopPlan | null;
  /**
   * The Chief Gear plan, and the day it is scored on.
   *
   * The day is found by the scoring engine from the event's own rows, so a new
   * event with a gear stage shows this section without anything being wired to
   * a day number here.
   */
  chiefGear: GearPlan | null;
  chiefGearDay: number | null;
  /** The widget plan, the day that pays for them, and the rate. */
  widgets: WidgetPlanShape | null;
  widgetDay: number | null;
  pointsPerWidget: number;
  /** The Mastery Forging plan, the day that pays for stones, and the rate. */
  mastery: MasteryPlanShape | null;
  /** The charm plan, the day it scores on, and what a point of score pays. */
  charms: CharmPlanShape | null;
  charmDay: number | null;
  pointsPerCharmScore: number;
  /** The pet plan, the day it scores on, and what a point of score pays. */
  pets: PetPlanShape | null;
  petDay: number | null;
  pointsPerPetScore: number;
  /** The Crystal Laboratory plan, the day it lands on, and the week's count. */
  /** Which expert skills to raise, and where the Sigils fit. */
  experts: ExpertPlanShape | null;
  expertDay: number | null;
  sigilSpend: SigilSpend;
  /** The day hero shards score most, or null when nothing pays for them. */
  shardDay: number | null;
  refine: RefinePlanShape | null;
  refineDay: number | null;
  refinesDone: number;
  /** Points the refine is really worth, measured by solving the plan both ways. */
  refineGain: number;
  essenceDay: number | null;
  pointsPerStone: number;
  /** Days of this event that score troops trained. */
  troopDays: number[];
  /** Batches queued before the event that land on the troop day. */
  preQueuedTroops: { type: TroopType; tier: number; count: number; points: number }[];
  /** True while a slower plan is still catching up with the latest input. */
  researchPending?: boolean;
}

/**
 * Why a plan has no steps.
 *
 * "Add resources and speedups" is the wrong thing to say when the player has
 * plenty of both and the real cause is that their General pile was pointed at a
 * different pool, or that a building level is gating everything. Each case gets
 * named instead.
 */
const emptyReason = (
  inventory: WhiteoutInventory,
  kind: 'construction' | 'research',
  secondsAvailable: number,
  blocked: { name: string }[]
) => {
  const own =
    kind === 'research' ? inventory.researchSpeedupMinutes : inventory.constructionSpeedupMinutes;
  const label = kind === 'research' ? 'Research' : 'Construction';

  if (secondsAvailable <= 0) {
    const general = Math.max(inventory.generalSpeedupMinutes, 0);
    if (own <= 0 && general > 0 && inventory.generalSpeedupTarget !== kind) {
      return (
        `No ${label.toLowerCase()} speedups to spend. Your General pile is set to go to ` +
        `${GENERAL_TARGET_LABELS[inventory.generalSpeedupTarget]}, so none of it reaches ` +
        `${label.toLowerCase()}. Change "Spend General on" in the Speedups card, or add ` +
        `${label} speedups.`
      );
    }
    return `No ${label.toLowerCase()} speedups entered, so there is no time to spend.`;
  }

  if (blocked.length > 0) {
    return (
      `Every node left is blocked by a building level. Set your building levels in Your ` +
      `inventory, starting with the Research Center.`
    );
  }

  return kind === 'research'
    ? 'Add Steel and resources in Your inventory to get a plan.'
    : 'Add resources and your building levels in Your inventory to get a plan.';
};

/**
 * What to actually upgrade, and what it costs.
 *
 * This is output, not input, so it lives with the event rather than with the
 * inventory: the plan only means anything against the event being scored, since
 * that is what decides whether the speedups are better spent building or burned
 * on a points row.
 */
export const WhiteoutPlanOutput = ({
  plan,
  research,
  inventory,
  activeDay,
  singleStage,
  buildingPowerPlan,
  charms,
  charmDay,
  pointsPerCharmScore,
  pets,
  petDay,
  pointsPerPetScore,
  experts,
  expertDay,
  sigilSpend,
  shardDay,
  refine,
  refineDay,
  refinesDone,
  refineGain,
  upgradeDay,
  wheel,
  wheelDays,
  researchDay,
  gathering,
  gatherDays,
  gatherPerUnit,
  troops,
  troopDays,
  chiefGear,
  chiefGearDay,
  widgets,
  widgetDay,
  pointsPerWidget,
  mastery,
  essenceDay,
  pointsPerStone,
  preQueuedTroops,
  researchPending,
}: WhiteoutPlanOutputProps) => {
  const steps = summariseSteps(plan.steps);
  const researchSteps = summariseResearch(research.steps);

  // A plan is only advice on the day it is acted on, so each one is shown on
  // that day and nowhere else. Repeating all of them under every day buried the
  // one that mattered, and on days where a plan should not be run at all it
  // actively contradicted the warning in the day panel above.
  //
  // A null upgradeDay means nothing on this table pays for the building work,
  // so the plan is shown nowhere rather than everywhere. That was one bug: an
  // old test read a missing BUILDING POWER row as "no particular day" and put
  // the upgrade plan on all seven, contradicting its own allocation.
  //
  // It is NOT gated on the power row surviving, which was the other bug. The
  // power row losing to the speedups means only that the power is not scored
  // twice; the upgrades still run, because running them is how the speedups
  // are spent, and the Fire Crystals they consume score on their own row for
  // far more than the minutes do. Hiding the plan there hid it on exactly the
  // days construction was worth the most.
  const showUpgrade = upgradeDay !== null && upgradeDay === activeDay;
  const showResearch = researchDay !== null && researchDay === activeDay;
  const showGathering = gathering !== null && gatherDays.includes(activeDay);
  // Null when the plan lost to burning the speedups, in which case the day
  // panel already says so and a training table would contradict it.
  // A queued batch stands on its own: it costs no speedups, so it is shown even
  // when the speedup plan lost to burning the pile.
  const showTroops =
    (troops !== null || preQueuedTroops.length > 0) && troopDays.includes(activeDay);
  const showChiefGear = chiefGear !== null && chiefGearDay === activeDay;
  // Only worth a section when there is something to say: a backpack with no
  // widgets at all would otherwise print an empty table on the gear day.
  const showWidgets = widgets !== null && widgetDay === activeDay && widgets.held > 0;
  const showMastery =
    mastery !== null && essenceDay === activeDay && mastery.stonesHeld > 0;
  // Shown on every wheel day, not just the busiest: the split is the advice,
  // so a player on Day 3 has to see what Day 2 was for.
  const showWheel = wheel !== null && wheelDays.includes(activeDay);
  // These two have to be in the guard below as well as in the body. They were
  // not, and the charm panel simply never appeared: the component returns null
  // when nothing else is being shown, so a day whose only advice was the charm
  // plan rendered nothing at all. It looked like the panel was broken when it
  // was the gate above it.
  const showCharms = charms !== null && charms.jumps.length > 0 && charmDay === activeDay;
  const showPets = pets !== null && pets.jumps.length > 0 && petDay === activeDay;
  // Only when refining actually wins. The calculator hands `refine` over as
  // null unless the plan solved WITH the conversion outscores the plan solved
  // without it, so the panel appearing is itself the recommendation. (This
  // comment used to claim the opposite, that it showed even to say "do not
  // refine"; that stopped being true when the win test was added.)
  const showRefine = refine !== null && refineDay === activeDay && refine.crystalsLeft > 0;
  // Both follow the same rule as every other pooled plan: shown on the day the
  // pool is spent, so seven days do not repeat one answer.
  const showExperts = experts !== null && expertDay === activeDay;
  const showShards = shardDay !== null && shardDay === activeDay;

  if (
    !showUpgrade &&
    !showResearch &&
    !showGathering &&
    !showTroops &&
    !showChiefGear &&
    !showWidgets &&
    !showMastery &&
    !showWheel &&
    !showCharms &&
    !showPets &&
    !showRefine &&
    !showExperts &&
    !showShards
  ) {
    return null;
  }

  return (
    <div className={classes.output}>
      <p className={classes.outputLabel}>
        {singleStage ? 'What to do' : `What to do on Day ${activeDay}`}
      </p>

      {showUpgrade && (
        <section className={classes.result}>
          <div className={classes.resultHeader}>
            <h3>Upgrade plan</h3>
            {plan.limitingFactors.length > 0 && (
              <span className={classes.limitChip}>
                Ran out of{' '}
                {plan.limitingFactors
                  .map(f => (f === 'time' ? 'speedups' : RESOURCE_LABELS[f as WhiteoutResource] ?? f))
                  .join(', ')}
              </span>
            )}
          </div>

          <dl className={classes.stats}>
            <div>
              <dt>Power gained</dt>
              <dd>{formatFull(plan.powerGained)}</dd>
            </div>
            <div>
              <dt>Upgrades</dt>
              <dd>{plan.steps.length}</dd>
            </div>
            <div>
              <dt>Build time used</dt>
              <dd className={classes.spend}>{formatDuration(plan.secondsUsed)}</dd>
            </div>
            <div>
              <dt>Speedups left</dt>
              <dd className={classes.left}>{formatDuration(plan.secondsRemaining)}</dd>
            </div>
          </dl>

          {steps.length > 0 ? (
            <>
              {!buildingPowerPlan.hasRow && (
                <p className={classes.cardNote}>
                  This event has no building power row, so none of this scores directly. It is here
                  as a guide to what your stock can build.
                </p>
              )}
              {/* The power row sitting empty is a decision, not a bug: the same
                  minutes cannot be counted as speedups and as power. Without
                  this the page shows a zero and never says why. */}
              {buildingPowerPlan.droppedFor && (
                <p className={classes.cardNote}>
                  The building power row is not counted. These are the same minutes as your
                  construction speedups, and burning them on Day {buildingPowerPlan.droppedFor.betterDay} is
                  worth {formatFull(Math.round(buildingPowerPlan.droppedFor.speedupValue))} points
                  against {formatFull(Math.round(buildingPowerPlan.droppedFor.powerValue))} for the
                  power. Counting both would spend them twice.
                </p>
              )}
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>Building</th>
                      <th>From</th>
                      <th>To</th>
                      <th className={classes.num}>Power</th>
                      <th className={classes.num}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((s, i) => (
                      <tr key={`${s.slug}-${i}`}>
                        <td>{s.name}</td>
                        <td>{s.fromLevel === 'none' ? 'Not built' : s.fromLevel}</td>
                        <td>{s.toLevel}</td>
                        <td className={classes.num}>{formatFull(s.power)}</td>
                        <td className={classes.num}>{formatDuration(s.buffedSeconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className={classes.usage}>
                {WHITEOUT_RESOURCES.filter(r => (plan.resourcesUsed[r] ?? 0) > 0).map(r => (
                  <li key={r}>
                    <span>
                      <WhiteoutItemIcon src={resourceIcon(r)} />
                      {RESOURCE_LABELS[r]}
                    </span>
                    <span className={classes.num}>
                      <span className={classes.spend}>
                        {formatFull(plan.resourcesUsed[r] ?? 0)}
                      </span>{' '}
                      used,{' '}
                      <span className={classes.left}>{formatFull(plan.remaining[r] ?? 0)}</span>{' '}
                      left
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={classes.cardNote}>
              {emptyReason(inventory, 'construction', plan.secondsAvailable, [])}
            </p>
          )}
        </section>
      )}

      {showResearch && (
        <section className={classes.result}>
          <div className={classes.resultHeader}>
            <h3>Research plan{researchPending ? ' (updating)' : ''}</h3>
            {research.limitingFactors.length > 0 && (
              <span className={classes.limitChip}>
                Ran out of{' '}
                {research.limitingFactors
                  .map(f =>
                    f === 'time' ? 'research speedups' : RESOURCE_LABELS[f as WhiteoutResource] ?? f
                  )
                  .join(', ')}
              </span>
            )}
          </div>

          <dl className={classes.stats}>
            <div>
              <dt>Power gained</dt>
              <dd>{formatFull(research.powerGained)}</dd>
            </div>
            <div>
              <dt>Levels</dt>
              <dd>{research.steps.length}</dd>
            </div>
            <div>
              <dt>Research time</dt>
              <dd>{formatDuration(research.secondsUsed)}</dd>
            </div>
            <div>
              <dt>Steel used</dt>
              {/* The icon rides with the figure rather than the heading: the
                  headings here are 0.66rem uppercase and an icon would dwarf
                  one. */}
              <dd className={classes.spend}>
                <WhiteoutItemIcon src={resourceIcon('steel')} size="sm" />
                {formatFull(research.resourcesUsed.steel)}
              </dd>
            </div>
            {/* The half that decides whether there is another node after this
                one. Steel is the only resource research really gates on, so
                what is left of it is the question the table above raises. */}
            <div>
              <dt>Steel left</dt>
              <dd className={classes.left}>
                <WhiteoutItemIcon src={resourceIcon('steel')} size="sm" />
                {formatFull(research.remaining.steel)}
              </dd>
            </div>

          </dl>

          {researchSteps.length > 0 ? (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>Tree</th>
                    <th>Research</th>
                    <th>From</th>
                    <th>To</th>
                    <th className={classes.num}>Power</th>
                    <th className={classes.num}>Steel</th>
                    <th className={classes.num}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {researchSteps.slice(0, 25).map(r => (
                    <tr key={r.key}>
                      <td>{r.tree}</td>
                      <td>{r.name}</td>
                      <td>Lv {r.fromLevel}</td>
                      <td>Lv {r.toLevel}</td>
                      <td className={classes.num}>{formatFull(r.power)}</td>
                      <td className={classes.num}>{formatFull(r.cost.steel)}</td>
                      <td className={classes.num}>{formatDuration(r.seconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={classes.cardNote}>
              {emptyReason(
                inventory,
                'research',
                research.secondsAvailable,
                research.blockedByBuilding
              )}
            </p>
          )}

          {researchSteps.length > 25 && (
            <p className={classes.cardNote}>
              Showing the 25 biggest of {researchSteps.length} nodes.
            </p>
          )}

          {/* Research is a weaker case than building: this event pays for the
              speedups being spent, but has no row for the tech power they buy. */}
          {researchSteps.length > 0 && (
            <p className={classes.cardNote}>
              {researchDay !== null ? (
                <>
                  Your research speedups are scored on <strong>Day {researchDay}</strong>, for the
                  minutes burned. The tech power they buy is not scored by this event, so run this
                  whenever suits you, as long as the speedups go in on Day {researchDay}.
                </>
              ) : (
                <>
                  Nothing in this event scores research speedups, so this plan is a guide to what
                  your Steel can buy rather than something to time around the event.
                </>
              )}
            </p>
          )}

          {research.blockedByBuilding.length > 0 && (
            <p className={classes.cardNote}>
              Blocked by building level:{' '}
              {research.blockedByBuilding
                .map(b => `${b.name} needs ${b.slug.replace(/-/g, ' ')} ${b.level}`)
                .join('; ')}
              .
            </p>
          )}
        </section>
      )}

      {showTroops && <TroopTrainingPlan troops={troops} preQueued={preQueuedTroops} />}

      {showGathering && gathering && (
        <GatheringPlan gathering={gathering} perUnit={gatherPerUnit} />
      )}

      {showExperts && experts && (
        <ExpertPlan plan={experts} sigils={sigilSpend} day={expertDay} />
      )}

      {showShards && <HeroShardPlan inventory={inventory} day={shardDay} />}

      {showWidgets && widgets && (
        <WidgetPlan plan={widgets} pointsPerWidget={pointsPerWidget} />
      )}

      {showMastery && mastery && (
        <MasteryPlan plan={mastery} pointsPerStone={pointsPerStone} />
      )}

      {/* Only on the day it is spent, like the other pooled plans, so seven
          days do not each repeat the same advice. */}
      {showCharms && charms && (
        <CharmPlan plan={charms} pointsPerScore={pointsPerCharmScore} day={charmDay} />
      )}

      {showPets && pets && (
        <PetPlan plan={pets} pointsPerScore={pointsPerPetScore} day={petDay} />
      )}

      {showRefine && refine && (
        <RefinePlan plan={refine} refinesDone={refinesDone} day={refineDay} gain={refineGain} />
      )}

      {showWheel && wheel && <LuckyWheelPlan plan={wheel} activeDay={activeDay} />}

      {showChiefGear && chiefGear && <ChiefGearPlan plan={chiefGear} />}
    </div>
  );
};
