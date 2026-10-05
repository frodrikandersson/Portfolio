import { useState } from 'react';
import {
  GEAR_CLASSES,
  GEAR_SLOTS,
  GEAR_CLASS_LABELS,
  GEAR_SLOT_LABELS,
  GEAR_TIER_LABELS,
  MYTHIC_MAX_LEVEL,
  MASTERY_FORGING,
  MITHRIL_IS_SPENT_AT,
  LEGENDARY_BREAKTHROUGHS,
  mythicEnhanceCost,
  masteryCost,
  mithrilRemainingForPiece,
  type GearClass,
  type GearTier,
} from '../../data/whiteoutHeroGear';
import { gearPiece, withGearPiece, type WhiteoutInventory } from '../../models/whiteoutInventory';
import { formatFull } from '../../utils/whiteoutFormat';
import { ConsumableFields } from './ConsumableFields';
import { WidgetSection } from './WidgetSection';
import classes from './WhiteoutUpgradePlanner.module.css';
import { CollapsibleCard } from './CollapsibleCard';

interface HeroGearCardProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/** Keeps a typed level inside the ladder, and a cleared field at 0 rather than NaN. */
const clampLevel = (value: number, max: number) =>
  Number.isFinite(value) ? Math.min(Math.max(Math.round(value), 0), max) : 0;

/** The next breakthrough above a level, and what it costs in Mithril. */
const nextBreakthrough = (level: number) => {
  const at = MITHRIL_IS_SPENT_AT.find(l => l > level);
  return at === undefined ? null : { level: at, mithril: LEGENDARY_BREAKTHROUGHS[at].mithril };
};

/**
 * Where the twelve hero gear pieces stand.
 *
 * Two things make this awkward to ask for, and the layout is built around
 * both. There are twelve pieces, so it is a grid of one class per column
 * rather than a list nobody would scroll. And each piece carries two separate
 * ladders that the game shows on the same icon: the Enhancement bar, and the
 * Mastery Forging number in the corner. They are labelled apart and kept on
 * their own rows so the two cannot be mixed up while typing.
 */
export const HeroGearCard = ({ inventory, onChange }: HeroGearCardProps) => {
  const [open, setOpen] = useState<GearClass>('infantry');

  const pieces = GEAR_SLOTS.map(slot => {
    const id = `${open}-${slot}`;
    return { slot, id, state: gearPiece(inventory, id) };
  });

  const set = (id: string, patch: Parameters<typeof withGearPiece>[2]) =>
    onChange(withGearPiece(inventory, id, patch));

  // What this class still has to pay to finish its four pieces.
  const remaining = pieces.reduce(
    (sum, p) => {
      const xp = p.state.tier === 'mythic'
        ? mythicEnhanceCost(p.state.enhanceLevel, MYTHIC_MAX_LEVEL)
        : 0;
      const mastery = masteryCost(
        { level: p.state.masteryLevel, stage: p.state.masteryStage },
        { level: MASTERY_FORGING.maxLevel, stage: 4 }
      );
      return {
        xp: sum.xp + xp,
        stones: sum.stones + mastery.stones,
        gear: sum.gear + mastery.mythicGear,
        mithril: sum.mithril + mithrilRemainingForPiece(p.state),
      };
    },
    { xp: 0, stones: 0, gear: 0, mithril: 0 }
  );

  return (
    <CollapsibleCard id="hero-gear" title="Hero Gear" className={`${classes.buildingsCard} ${classes.gearCard}`}>
      <div className={`${classes.troopTabs} ${classes.genTabs}`}>
        {GEAR_CLASSES.map(cls => (
          <button
            key={cls}
            type="button"
            className={`${classes.troopTab} ${cls === open ? classes.troopTabActive : ''}`}
            onClick={() => setOpen(cls)}
          >
            {GEAR_CLASS_LABELS[cls]}
          </button>
        ))}
      </div>

      <div className={classes.gearGrid}>
        {pieces.map(({ slot, id, state }) => {
          const next = state.tier === 'legendary' ? nextBreakthrough(state.enhanceLevel) : null;
          const staged = state.masteryLevel >= MASTERY_FORGING.stagesFromLevel;
          return (
            <div key={id} className={classes.gearPiece}>
              <div className={classes.gearPieceHead}>
                <span className={classes.gearSlotName}>{GEAR_SLOT_LABELS[slot]}</span>
                <select
                  className={classes.input}
                  aria-label={`${GEAR_SLOT_LABELS[slot]} quality`}
                  value={state.tier}
                  onChange={e => set(id, { tier: e.target.value as GearTier })}
                >
                  {(Object.keys(GEAR_TIER_LABELS) as GearTier[]).map(t => (
                    <option key={t} value={t}>
                      {GEAR_TIER_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <label className={classes.field}>
                <span className={classes.fieldLabel}>
                  Enhancement
                  <em className={classes.fieldHint}>the bar, 0 to {MYTHIC_MAX_LEVEL}</em>
                </span>
                <input
                  className={classes.input}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MYTHIC_MAX_LEVEL}
                  value={state.enhanceLevel}
                  aria-label={`${GEAR_SLOT_LABELS[slot]} enhancement level`}
                  onChange={e =>
                    set(id, { enhanceLevel: clampLevel(Number(e.target.value), MYTHIC_MAX_LEVEL) })
                  }
                />
              </label>

              <label className={classes.field}>
                <span className={classes.fieldLabel}>
                  Mastery
                  <em className={classes.fieldHint}>on the icon</em>
                </span>
                <span className={classes.gearMastery}>
                  <select
                    className={classes.input}
                    aria-label={`${GEAR_SLOT_LABELS[slot]} mastery level`}
                    value={state.masteryLevel}
                    onChange={e => set(id, { masteryLevel: Number(e.target.value) })}
                  >
                    {Array.from({ length: MASTERY_FORGING.maxLevel + 1 }, (_, i) => (
                      <option key={i} value={i}>
                        Lv {i}
                      </option>
                    ))}
                  </select>
                  {/* Stages only exist from the level the game added them, so
                      the picker is hidden below that rather than offering
                      choices the game does not have. */}
                  {staged && (
                    <select
                      className={classes.input}
                      aria-label={`${GEAR_SLOT_LABELS[slot]} mastery stage`}
                      value={state.masteryStage}
                      onChange={e => set(id, { masteryStage: Number(e.target.value) })}
                    >
                      {Array.from({ length: MASTERY_FORGING.stagesPerLevel }, (_, i) => (
                        <option key={i} value={i}>
                          Stage {i}
                        </option>
                      ))}
                    </select>
                  )}
                </span>
              </label>

              <p className={classes.gearPieceNote}>
                {state.tier === 'mythic' && state.enhanceLevel >= MYTHIC_MAX_LEVEL ? (
                  <>
                    Ready to break through, once Mastery reaches{' '}
                    {MASTERY_FORGING.masteryNeededToBreakThrough}.
                  </>
                ) : state.tier === 'mythic' ? (
                  <>
                    {formatFull(mythicEnhanceCost(state.enhanceLevel, MYTHIC_MAX_LEVEL))} XP to Lv{' '}
                    {MYTHIC_MAX_LEVEL}
                  </>
                ) : next ? (
                  <>
                    Next Mithril at Lv {next.level}, costing {next.mithril}
                  </>
                ) : (
                  <>Finished: no Mithril left to spend on this one</>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <p className={classes.cardNote}>
        {GEAR_CLASS_LABELS[open]} still needs{' '}
        <strong>{formatFull(remaining.xp)}</strong> Enhancement XP,{' '}
        <strong>{formatFull(remaining.stones)}</strong> Essence Stones and{' '}
        <strong>{formatFull(remaining.gear)}</strong> spare Mythic pieces to finish all four.
        Mithril is the only part of this that any event pays for, and it is only ever spent at the
        Legendary breakthroughs: Lv {MITHRIL_IS_SPENT_AT.join(', Lv ')}.
      </p>

    
      <ConsumableFields inventory={inventory} onChange={onChange} group="hero-gear" heading />

      <WidgetSection inventory={inventory} onChange={onChange} />
    </CollapsibleCard>
  );
};
