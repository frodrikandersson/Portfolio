import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { SEO } from '../SEO/SEO';
import { applyRefine, crystalRatesFor, refineForEvent } from '../../utils/whiteoutRefinePlanner';
import { WhiteoutUpgradePlanner } from '../WhiteoutUpgradePlanner/WhiteoutUpgradePlanner';
import { WhiteoutPlanOutput } from '../WhiteoutUpgradePlanner/WhiteoutPlanOutput';
import { hallOfChiefs } from '../../data/whiteoutHallOfChiefs';
import { holidayEvent } from '../../data/whiteoutHolidayEvent';
import { kingOfIcefield } from '../../data/whiteoutKingOfIcefield';
import { armamentCompetition, armamentCompetitionFireCrystal } from '../../data/whiteoutArmamentCompetition';
import { officerProjectEssenceStone, officerProjectCharmDesign } from '../../data/whiteoutOfficerProject';
import { stateOfPower } from '../../data/whiteoutStateOfPower';
import { workingOvertime } from '../../data/whiteoutWorkingOvertime';
import { whiteoutEvents } from '../../data/whiteoutEvents';
import { rowPointsPerUnit } from '../../models/whiteoutInterface';
import type { PointsEvent } from '../../models/whiteoutInterface';
import {
  rowKey,
  scoreDay,
  scoreEvent,
  scoreGroup,
  usableSpeedupMinutes,
  type Quantities,
} from '../../utils/whiteoutScoring';
import { optimizeUpgrades } from '../../utils/whiteoutOptimizer';
import { planResearch } from '../../utils/whiteoutResearchOptimizer';
import {
  deriveQuantities,
  describeDayPlan,
  gatherRowUnit,
  trainRowTier,
  widgetDayOf,
  essenceDayOf,
  wheelDaysOf,
} from '../../utils/whiteoutDerive';
import { parseLevel } from '../../utils/whiteoutLevels';
import {
  rallyCycle,
  zinmanReduction,
  effectiveResearchSpeed,
  agnesSecondsOff,
  speedupMinutesFor,
  effectiveConstructionSpeed,
  researchLevels,
} from '../../models/whiteoutInventory';
import { useWhiteoutInventory } from '../../hooks/useWhiteoutInventory';
import { AccountSwitcher } from './AccountSwitcher';
import { whiteoutBuildings, ZINMAN_DISCOUNTED } from '../../data/whiteoutBuildings';
import { planExpertsFor, gateUnlocksASkill } from '../../utils/whiteoutExpertPlanner';
import { planSigilSpend } from '../../utils/whiteoutExpertGates';
import { iconForLabel } from '../../data/whiteoutItemIcons';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';
import classes from './WhiteoutCalculator.module.css';

const fmt = (n: number) => Math.round(n).toLocaleString();

/** Every scoring table transcribed so far, keyed by the id the catalogue points at. */
const EVENT_TABLES: Record<string, PointsEvent> = {
  [holidayEvent.id]: holidayEvent,
  [hallOfChiefs.id]: hallOfChiefs,
  [kingOfIcefield.id]: kingOfIcefield,
  [armamentCompetition.id]: armamentCompetition,
  [armamentCompetitionFireCrystal.id]: armamentCompetitionFireCrystal,
  [officerProjectEssenceStone.id]: officerProjectEssenceStone,
  [officerProjectCharmDesign.id]: officerProjectCharmDesign,
  [stateOfPower.id]: stateOfPower,
  [workingOvertime.id]: workingOvertime,
};

const DEFAULT_SLUG =
  whiteoutEvents.find(e => e.eventId === holidayEvent.id)?.slug ??
  whiteoutEvents.find(e => e.eventId)?.slug ??
  whiteoutEvents[0].slug;

export const WhiteoutCalculator = () => {
  const {
    inventory,
    setInventory,
    eventSlug,
    setEventSlug,
    reset,
    accounts,
    activeAccountId,
    activeAccountName,
    canAddAccount,
    selectAccount,
    addAccount,
    renameAccount,
    removeAccount,
  } = useWhiteoutInventory(DEFAULT_SLUG);
  const [activeDay, setActiveDay] = useState(1);

  const listing = whiteoutEvents.find(e => e.slug === eventSlug)!;
  const event = listing.eventId ? EVENT_TABLES[listing.eventId] : undefined;

  // One upgrade solve, so it can be run against two different bags: the one
  // the player has, and the one they would have after refining.
  const buildPlanFor = useCallback(
    (bag: typeof inventory) =>
      optimizeUpgrades(whiteoutBuildings, {
        currentLevels: bag.buildingLevels,
        stock: bag.resources,
        // The optimiser takes the two separately, so General is passed only
        // when this is where it was pointed.
        constructionSpeedupMinutes: bag.constructionSpeedupMinutes,
        generalSpeedupMinutes:
          bag.generalSpeedupTarget === 'construction' ? bag.generalSpeedupMinutes : 0,
        // Includes Double Time and Builder's Aide, which are held apart from
        // the manual total so they are not counted twice. The state
        // appointment is not: see effectiveConstructionSpeed for why.
        buffPercent: effectiveConstructionSpeed(bag),
        flatSecondsOff: agnesSecondsOff(bag),
        costDiscount: bag.useZinman ? zinmanReduction(bag.zinmanSkillLevel) : 0,
        discountResources: ZINMAN_DISCOUNTED,
      }),
    []
  );

  // The Crystal Laboratory, decided against the plan rather than the rate card.
  //
  // Refining looks good on rates alone, 2,000 a Fire Crystal against 30,000 a
  // Refined one, and that is what planRefines works from. But neither is spent
  // out of the bag: both are spent by building upgrades, so a board that
  // cannot absorb the Refined crystals loses the raw ones for nothing. The
  // only honest test is to solve the upgrade plan both ways and compare what
  // each actually puts into buildings.
  const refineCandidate = useMemo(
    () => (event ? refineForEvent(event, inventory) : null),
    [event, inventory]
  );

  const refinedBag = useMemo(
    () => applyRefine(inventory, refineCandidate?.plan ?? null),
    [inventory, refineCandidate]
  );

  const planWithout = useMemo(() => buildPlanFor(inventory), [buildPlanFor, inventory]);
  const planWith = useMemo(() => buildPlanFor(refinedBag), [buildPlanFor, refinedBag]);

  // What the crystals each plan spends are worth on this event.
  const crystalWorth = useMemo(() => {
    if (!event || !refineCandidate) return null;
    const rates = crystalRatesFor(event);
    if (!rates) return null;
    const score = (used: { fireCrystal?: number; refinedFireCrystal?: number }) =>
      (used.fireCrystal ?? 0) * rates.raw + (used.refinedFireCrystal ?? 0) * rates.refined;
    return {
      without: score(planWithout.resourcesUsed),
      with: score(planWith.resourcesUsed),
    };
  }, [event, refineCandidate, planWithout, planWith]);

  // Refine only when the plan that follows from it genuinely scores more.
  const refineWins = crystalWorth !== null && crystalWorth.with > crystalWorth.without;

  const refine = refineWins ? refineCandidate : null;
  // The real gain, measured as the difference between the two solved plans,
  // not the rate-card estimate planRefines works from.
  const refineGain = refineWins && crystalWorth ? crystalWorth.with - crystalWorth.without : 0;
  const planningInventory = refineWins ? refinedBag : inventory;
  const plan = refineWins ? planWith : planWithout;

  // The research solver walks a 191 node dependency graph and can take a
  // moment on a big plan, so it runs against deferred input. Typing stays
  // responsive and the table catches up a beat later.
  const deferredInventory = useDeferredValue(inventory);
  const researchPending = deferredInventory !== inventory;

  const research = useMemo(() => {
    const buildingLevels: Record<string, number> = {};
    for (const [slug, level] of Object.entries(deferredInventory.buildingLevels)) {
      // "FC 5" is above "30", not level 5. Stripping the prefix, as this used
      // to, made a Fire Crystal building read as a nearly unbuilt one. Only the
      // Research Center gates research today and it has no FC levels, so this
      // is latent rather than live, but it is wrong either way.
      const parsed = parseLevel(level);
      if (parsed) buildingLevels[slug] = parsed.tier;
    }
    return planResearch({
      completed: researchLevels(deferredInventory),
      trees: deferredInventory.researchTrees,
      resources: deferredInventory.resources,
      speedupMinutes: speedupMinutesFor(deferredInventory, 'research'),
      speedPercent: effectiveResearchSpeed(deferredInventory),
      buildingLevels,
    });
  }, [deferredInventory]);

  const derived = useMemo(
    () =>
      event
        ? deriveQuantities(event, {
            inventory: planningInventory,
            refine: refine?.plan ?? null,
            refineDay: refine?.day ?? null,
            buildingPower: plan.powerGained,
            // Troops compete for whatever the building plan did not take.
            troopResources: plan.remaining,
            // The research rows pay for the power the plan gains, the same way
            // the building rows pay for building power.
            researchPower: research.powerGained,
            // A speedup only scores when it goes into something running, so the
            // pools are capped by what these two plans can absorb.
            usableMinutes: {
              construction: usableSpeedupMinutes(plan, speedupMinutesFor(planningInventory, 'construction')),
              research: usableSpeedupMinutes(research, speedupMinutesFor(planningInventory, 'research')),
            },
            // The crystal rows pay for the spend, which the plan already knows.
            crystalsSpent: {
              fireCrystal: plan.resourcesUsed.fireCrystal ?? 0,
              refinedFireCrystal: plan.resourcesUsed.refinedFireCrystal ?? 0,
            },
          })
        : null,
    [event, planningInventory, refine, plan, research]
  );

  const quantities: Quantities = useMemo(() => derived?.quantities ?? {}, [derived]);

  // Which days score resources gathered, and what a unit of each is worth
  // there. The gathering plan is only shown on those days, since a schedule of
  // marches means nothing on a day that does not pay for them.
  const { gatherDays, gatherPerUnit } = useMemo(() => {
    const days: number[] = [];
    const perUnit: Record<string, number> = {};
    if (!event) return { gatherDays: days, gatherPerUnit: perUnit };
    for (const day of event.days) {
      let scoresGathering = false;
      for (const group of day.groups) {
        for (const row of group.rows) {
          const spec = gatherRowUnit(row);
          if (!spec) continue;
          scoresGathering = true;
          perUnit[spec.resource] = rowPointsPerUnit(group, row) / spec.unit;
        }
      }
      if (scoresGathering) days.push(day.day);
    }
    return { gatherDays: days, gatherPerUnit: perUnit };
  }, [event]);

  /** Days that score troops trained, so the training plan appears only there. */
  const troopDays = useMemo(() => {
    if (!event) return [] as number[];
    return event.days
      .filter(day => day.groups.some(g => g.rows.some(r => trainRowTier(r) !== null)))
      .map(day => day.day);
  }, [event]);

  const { perDay, total } = useMemo(() => {
    if (!event) return { perDay: {} as Record<number, number>, total: 0 };
    const scored = scoreEvent(event, quantities);
    const extra = derived?.extraPointsByDay ?? {};
    const perDay = { ...scored.perDay };
    for (const [day, points] of Object.entries(extra)) {
      perDay[Number(day)] = (perDay[Number(day)] ?? 0) + points;
    }
    const total = Object.values(perDay).reduce((s, n) => s + n, 0);
    return { perDay, total };
  }, [event, quantities, derived]);
  const day = event?.days.find(d => d.day === activeDay) ?? event?.days[0];
  const dayTotal =
    event && day
      ? scoreDay(event, day.day, quantities) + (derived?.extraPointsByDay[day.day] ?? 0)
      : 0;

  const ginaSummary = useMemo(() => {
    if (!inventory.useGina || !derived?.hunts) return null;
    const cycle = rallyCycle(inventory);
    const h = derived.hunts;
    return (
      `Gina rides 1 rally in every ${cycle}, cutting that march to ` +
      `${h.ginaPolarTerrorCost} stamina for a Polar Terror and ${h.ginaBeastCost} for a Beast. ` +
      `${h.discountedMarches} of the marches above get her discount, so lead each batch with hers.`
    );
  }, [inventory, derived]);

  // Which day pays for widgets, read off the event rather than hardcoded.
  const widgetScoring = useMemo(() => (event ? widgetDayOf(event) : null), [event]);
  const essenceScoring = useMemo(() => (event ? essenceDayOf(event) : null), [event]);
  // Read off the event's own charm group rather than assumed: the rate is 70
  // on most events and 1 on Hall of Chiefs, and nothing says it cannot change
  // again.
  // Read off the event's own pet group, for the same reason the charm rate is.
  const petScoring = useMemo(() => {
    if (!event || derived?.petDay == null) return 0;
    const day = event.days.find(d => d.day === derived.petDay);
    const group = day?.groups.find(g => g.rows.some(r => r.id.startsWith('advance-a-pet-at-lv-')));
    return group?.pointsPerSourceValue ?? 0;
  }, [event, derived?.petDay]);

  /*
   * The expert plan's two rates and its day.
   *
   * An expert event pays per BOOK SPENT and per MINUTE of learning speedup, so
   * both are read off the event's own rows. The day is wherever the books are
   * worth most, which is the same rule every other pooled plan follows.
   */
  const expertScoring = useMemo(() => {
    if (!event) return null;
    let best: { day: number; perBook: number; perMinute: number } | null = null;
    for (const d of event.days) {
      for (const g of d.groups) {
        const bookRow = g.rows.find(r => r.id === 'use-1-book-of-knowledge');
        if (!bookRow) continue;
        const perBook = rowPointsPerUnit(g, bookRow);
        const minuteRow = d.groups
          .flatMap(x => x.rows.map(r => ({ group: x, row: r })))
          .find(x => x.row.id === 'expert-skill-speedups-1-minute');
        const perMinute = minuteRow ? rowPointsPerUnit(minuteRow.group, minuteRow.row) : 0;
        if (!best || perBook > best.perBook) best = { day: d.day, perBook, perMinute };
      }
    }
    return best;
  }, [event]);

  const expertPlan = useMemo(
    () =>
      expertScoring
        ? planExpertsFor(
            inventory,
            expertScoring.perBook,
            expertScoring.perMinute,
            speedupMinutesFor(inventory, 'learning')
          )
        : null,
    [inventory, expertScoring]
  );

  const expertSigilSpend = useMemo(
    () => planSigilSpend(inventory, id => gateUnlocksASkill(inventory, id)),
    [inventory]
  );

  /** Where hero shards pay most, so the panel lands on that day alone. */
  const shardDay = useMemo(() => {
    if (!event) return null;
    let best: { day: number; rate: number } | null = null;
    for (const d of event.days) {
      for (const g of d.groups) {
        for (const r of g.rows) {
          if (!/^use-1-(rare|epic|mythic)-hero-shard$/.test(r.id)) continue;
          const rate = rowPointsPerUnit(g, r);
          if (!best || rate > best.rate) best = { day: d.day, rate };
        }
      }
    }
    return best?.day ?? null;
  }, [event]);

  const charmScoring = useMemo(() => {
    if (!event || derived?.charmDay == null) return 0;
    const day = event.days.find(d => d.day === derived.charmDay);
    const group = day?.groups.find(g => g.rows.some(r => r.id.startsWith('charm-lv-')));
    return group?.pointsPerSourceValue ?? 0;
  }, [event, derived?.charmDay]);
  const wheelDayNumbers = useMemo(
    () => (event ? wheelDaysOf(event).map(w => w.day) : []),
    [event]
  );

  const dayPlan = useMemo(
    () =>
      event && day && derived
        ? describeDayPlan(
            event,
            day.day,
            quantities,
            derived.derivedKeys,
            derived.hunts,
            plan.powerGained,
            ginaSummary,
            derived.holdBack,
            derived.troops,
            {
              constructionDay: inventory.presidentConstructionDay,
              researchDay: inventory.presidentResearchDay,
            },
            derived.dayNotes[day.day] ?? []
          )
        : null,
    [
      event,
      day,
      derived,
      quantities,
      plan.powerGained,
      ginaSummary,
      inventory.presidentConstructionDay,
      inventory.presidentResearchDay,
    ]
  );

  const selectEvent = (slug: string) => {
    setEventSlug(slug);
    setActiveDay(1);
  };







  return (
    <div className={classes.container}>
      <SEO
        title="Whiteout Survival Points Calculator"
        description="Work out your Hall of Chiefs score day by day, and see how much construction power your speedups and speed buffs actually buy."
      />

      {/* Above everything, because switching account swaps the whole inventory
          the panels below are built from. */}
      <AccountSwitcher
        accounts={accounts}
        activeId={activeAccountId}
        canAdd={canAddAccount}
        onSelect={selectAccount}
        onAdd={addAccount}
        onRename={renameAccount}
        onRemove={removeAccount}
      />

      <WhiteoutUpgradePlanner inventory={inventory} onChange={setInventory} accountId={activeAccountId} />

      <header className={classes.header}>
        <h1>Points calculator</h1>
        <label className={classes.eventPicker}>
          <span>Event</span>
          <select
            className={classes.select}
            value={eventSlug}
            onChange={e => selectEvent(e.target.value)}
          >
            {whiteoutEvents.map(e => (
              <option key={e.slug} value={e.slug}>
                {e.name}
                {e.eventId ? '' : ' (no table yet)'}
              </option>
            ))}
          </select>
        </label>
        <p className={classes.season}>
          {event
            ? event.season
            : `${whiteoutEvents.filter(e => e.eventId).length} of ${whiteoutEvents.length} events have a scoring table so far.`}
        </p>
      </header>

      {/* The engine's own reasoning about which day won a contested pool used to
          be listed here, along with the event's transcription caveats. Both were
          noise: a player wants to know what to do, and the plans now appear only
          on the day they apply to, which says the same thing by showing it. */}

      {!event && (
        <section className={classes.dayPanel}>
          <h2>No scoring table for {listing.name} yet</h2>
          <p className={classes.note}>
            All {whiteoutEvents.length} events from the wiki are listed above, but only the
            ones marked without a note have had their point values transcribed. Point values
            are the hard part: most event pages keep them inside images rather than text.
          </p>
          <p className={classes.note}>
            To add this one, put its point values into a table like the Hall of Chiefs one in{' '}
            <code>src/data/whiteoutHallOfChiefs.ts</code> and point{' '}
            <code>whiteoutEvents.ts</code> at it. The scoring engine needs no changes.
          </p>
          <p>
            <a href={listing.wikiUrl} target="_blank" rel="noopener noreferrer">
              Open {listing.name} on the wiki
            </a>
          </p>
        </section>
      )}

      {/* An event with one stage has nothing to switch between, and its day
          strip would be a single button repeating the total beside it. */}
      {event && day && (
        <div className={classes.summary}>
          <div className={classes.summaryTotal}>
            <span className={classes.summaryLabel}>Total score</span>
            <strong className={classes.summaryValue}>{fmt(total)}</strong>
          </div>
          {/* What the total is being measured against. A score on its own says
              nothing; a score against the targets it has and has not cleared
              is the whole reason for chasing it. */}
          {event.dailyMilestones?.points && (
            <ul className={classes.milestoneRow}>
              {event.dailyMilestones.points.map(target => {
                const done = total >= target;
                return (
                  <li
                    key={target}
                    className={`${classes.milestone} ${done ? classes.milestoneDone : ''}`}
                  >
                    <span className={classes.milestoneMark} aria-hidden="true">
                      {done ? '\u2713' : '\u00b7'}
                    </span>
                    {fmt(target)}
                  </li>
                );
              })}
            </ul>
          )}

          {event.days.length > 1 && (
          <ul className={classes.dayTabs}>
            {event.days.map(d => (
              <li key={d.day}>
                <button
                  type="button"
                  className={`${classes.dayTab} ${d.day === day.day ? classes.dayTabActive : ''}`}
                  onClick={() => setActiveDay(d.day)}
                  aria-pressed={d.day === day.day}
                >
                  <span className={classes.dayTabDay}>Day {d.day}</span>
                  <span className={classes.dayTabScore}>{fmt(perDay[d.day] ?? 0)}</span>
                </button>
              </li>
            ))}
          </ul>
          )}
        </div>
      )}

      {event?.rankingRewards && (
        <p className={classes.note}>
          {total >= event.rankingRewards.minimumPoints
            ? `Past ${fmt(event.rankingRewards.minimumPoints)} points, so this score is on the ladder. `
            : `The ladder pays nothing below ${fmt(event.rankingRewards.minimumPoints)} points, and this score is ${fmt(event.rankingRewards.minimumPoints - total)} short of it. `}
          {`Only the top ${event.rankingRewards.paidPlaces} are paid, in ${event.rankingRewards.bands.length} bands, and a band is a step change rather than a gradient.`}
        </p>
      )}

      {event && day && (
      <section className={classes.dayPanel}>
        <div className={classes.dayHeader}>
          <h2>
            {event.days.length > 1 ? `Day ${day.day}: ${day.label}` : day.label}
          </h2>
          <span className={classes.dayScore}>{fmt(dayTotal)} pts</span>
        </div>

        {/* The list of what to do on the day has gone: the plan below works out
            the path properly, and repeating a thinner version of it here only
            gave two places to disagree. What is kept is the part the plan does
            not cover, which is what NOT to spend today and why. */}
        {dayPlan && (dayPlan.warnings.length > 0 || dayPlan.notes.length > 0) && (
          <div className={classes.dayPlan}>
            <h3>Worth knowing about this day</h3>
            {dayPlan.warnings.map(w => (
              <p key={w} className={classes.warnLine}>
                {w}
              </p>
            ))}
            {dayPlan.notes.map(n => (
              <p key={n} className={classes.note}>
                {n}
              </p>
            ))}
          </div>
        )}

        {/* Event-wide decisions, not day advice. Collapsed, because they
            explain rather than instruct, and they are the same on every day. */}
        {derived && derived.notes.length > 0 && (
          <details className={classes.dayPlan}>
            <summary>Why some rows are empty</summary>
            {derived.notes.map(n => (
              <p key={n} className={classes.note}>
                {n}
              </p>
            ))}
          </details>
        )}

        {day.groups.map(group => {
          const active = group.rows.filter(r => (quantities[rowKey(day.day, group.id, r.id)] ?? 0) > 0);
          const idle = group.rows.length - active.length;
          return (
            <div key={group.id} className={classes.group}>
              <div className={classes.groupHeader}>
                <h3>{group.label}</h3>
                <span className={classes.groupScore}>
                  {fmt(scoreGroup(day.day, group, quantities))} pts
                </span>
              </div>
              {group.note && <p className={classes.note}>{group.note}</p>}

              {active.length > 0 ? (
                <div className={classes.rows}>
                  {/* Three bare numbers in a row meant nothing on their own.
                      One header per group is cheaper than a tooltip on each. */}
                  <div className={classes.rowHead}>
                    <span>What scores</span>
                    <span>Rate</span>
                    <span>Amount</span>
                    <span>Points</span>
                  </div>
                  {active.map(row => {
                    const qty = quantities[rowKey(day.day, group.id, row.id)] ?? 0;
                    const rate = rowPointsPerUnit(group, row);
                    return (
                      <div key={row.id} className={classes.row}>
                        <span className={classes.rowLabel}>
                          {/* Small here: a scoring row is a dense four column
                              grid, and a full size icon would set the row
                              height instead of the text. */}
                          <WhiteoutItemIcon src={iconForLabel(row.label)} size="sm" />
                          {row.label}
                        </span>
                        <span className={classes.rowRate}>{fmt(rate)}/ea</span>
                        <span className={classes.rowQty}>{fmt(qty)}</span>
                        <span className={classes.rowPoints}>{fmt(qty * rate)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={classes.note}>
                  Nothing in your inventory scores here yet.
                </p>
              )}

              {idle > 0 && (
                <details className={classes.rates}>
                  <summary>
                    {idle} more scoring {idle === 1 ? 'option' : 'options'}
                    {event.days.length > 1 ? ' on this day' : ' in this event'}
                  </summary>
                  <div className={classes.rows}>
                    <div className={classes.rowHead}>
                      <span>What scores</span>
                      <span>Rate</span>
                      <span>Amount</span>
                      <span>Points</span>
                    </div>
                    {group.rows
                      .filter(r => (quantities[rowKey(day.day, group.id, r.id)] ?? 0) <= 0)
                      .map(row => (
                        <div key={row.id} className={`${classes.row} ${classes.rowIdle}`}>
                          <span className={classes.rowLabel}>
                            <WhiteoutItemIcon src={iconForLabel(row.label)} size="sm" />
                            {row.label}
                          </span>
                          <span className={classes.rowRate}>
                            {fmt(rowPointsPerUnit(group, row))}/ea
                          </span>
                          <span className={classes.rowQty}>0</span>
                          <span className={classes.rowPoints}>0</span>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </section>
      )}

      {/* The plan belongs to the event, not to the inventory: what is worth
          building depends on what this event pays for. */}
      {event && derived && (
        <WhiteoutPlanOutput
          plan={plan}
          research={research}
          inventory={inventory}
          activeDay={day?.day ?? 1}
          singleStage={(event?.days.length ?? 0) === 1}
          buildingPowerPlan={derived.buildingPowerPlan}
          upgradeDay={derived.upgradeDay}
          wheel={derived.wheel}
          wheelDays={wheelDayNumbers}
          researchDay={
            derived.allocation.find(a => a.source === 'researchMinutes')?.day ?? null
          }
          gathering={derived.gathering}
          gatherDays={gatherDays}
          gatherPerUnit={gatherPerUnit}
          chiefGear={derived.chiefGear}
          chiefGearDay={derived.chiefGearDay}
          widgets={derived.widgets}
          widgetDay={widgetScoring?.day ?? null}
          pointsPerWidget={widgetScoring?.pointsPerWidget ?? 0}
          experts={expertPlan}
          expertDay={expertScoring?.day ?? null}
          sigilSpend={expertSigilSpend}
          shardDay={shardDay}
          refine={refine?.plan ?? null}
          refineDay={refine?.day ?? null}
          refineGain={refineGain}
          refinesDone={inventory.superRefinesDone}
          pets={derived.pets}
          petDay={derived.petDay}
          pointsPerPetScore={petScoring}
          charms={derived.charms}
          charmDay={derived.charmDay}
          pointsPerCharmScore={charmScoring}
          mastery={derived.mastery}
          essenceDay={essenceScoring?.day ?? null}
          pointsPerStone={essenceScoring?.pointsPerStone ?? 0}
          troops={derived.troops}
          troopDays={troopDays}
          preQueuedTroops={derived.preQueuedTroops}
          researchPending={researchPending}
        />
      )}

      <footer className={classes.footer}>
        <button type="button" className={classes.resetButton} onClick={reset}>
          Clear {activeAccountName}
        </button>
      </footer>
    </div>
  );
};
