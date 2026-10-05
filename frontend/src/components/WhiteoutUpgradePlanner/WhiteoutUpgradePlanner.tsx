import { useMemo, useState } from 'react';
import {
  whiteoutBuildings,
  WHITEOUT_RESOURCES,
  RESOURCE_LABELS,
  type WhiteoutResource,
} from '../../data/whiteoutBuildings';
import { formatFull } from '../../utils/whiteoutFormat';
import {
  consumableCount,
  withConsumable,
  staminaBudget,
  CHIEF_STAMINA_VALUE,
  STAMINA_REGEN_CAP,
  INTEL_STAMINA_PER_MISSION,
  MAX_BEAST_LEVEL,
  GINA_REDUCTION_BY_LEVEL,
  ZINMAN_REDUCTION_BY_LEVEL,
  LING_XUE_BY_LEVEL,
  JASSER_BY_LEVEL,
  effectiveTrainingSpeed,
  effectiveResearchSpeed,
  shardCapacity,
  newHeroShardEntry,
  HERO_RARITIES,
  HERO_RARITY_LABELS,
  GENERAL_TARGETS,
  GENERAL_TARGET_LABELS,
  effectiveTrainingCapacity,
  effectiveConstructionSpeed,
  appointmentEffect,
  APPOINTMENTS,
  APPOINTMENT_MINUTES,
  DOUBLE_TIME_PERCENT,
  BUILDERS_AIDE_BY_LEVEL,
  ADVANCED_TRAINING_PERCENT,
  type Appointment,
  type GeneralSpeedupTarget,
  type HeroShardEntry,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import {
  clampLevels,
  levelCapRank,
  levelRank,
  tierLabel,
  parseLevel,
} from '../../utils/whiteoutLevels';
import {
  resourceIcon,
  speedupIcon,
  heroShardIcon,
  generalHeroShardIcon,
  recruitmentKeyIcon,
  buildingArt,
  CHIEF_STAMINA_ICON,
} from '../../data/whiteoutItemIcons';
import { WhiteoutArt } from '../WhiteoutItemIcon/WhiteoutArt';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';
import { AmountInput } from './AmountInput';
import {
  ConstructionSpeedHelp,
  TrainingSpeedHelp,
  ResearchSpeedHelp,
} from './SpeedHelp';
import { DurationInput } from './DurationInput';
import { GatheringCard } from './GatheringCard';
import { ExpertsCard } from './ExpertsCard';
import { ChiefGearCard } from './ChiefGearCard';
import { CharmCard } from './CharmCard';
import { PetsCard } from './PetsCard';
import { CollapsibleCard } from './CollapsibleCard';
import { consumableIcon } from '../../data/whiteoutItemIcons';
import { MAX_WEEKLY_REFINES } from '../../data/whiteoutCrystalLab';
import { CardContext } from './CardContext';
import { ResearchTreeCard } from './ResearchTreeCard';
import { HeroGearCard } from './HeroGearCard';
import { whiteoutHeroes, heroByName } from '../../data/whiteoutHeroes';
import {
  MAX_STARS,
  TIERS_PER_STAR,
  SHARDS_LOCKED_TO_MAX,
  shardsRemaining,
} from '../../data/whiteoutHeroStars';
import {
  TROOP_TYPES,
  TROOP_TYPE_LABELS,
  HELIOS_LEVELS,
  whiteoutTroops,
  tierIsEstimated,
  type TroopType,
} from '../../data/whiteoutTroops';
import classes from './WhiteoutUpgradePlanner.module.css';

const NOT_BUILT = '';

/** Every event the calculator knows runs seven days or fewer. */
const DAY_CHOICES = [1, 2, 3, 4, 5, 6, 7];

interface WhiteoutUpgradePlannerProps {
  inventory: WhiteoutInventory;
  onChange: (next: WhiteoutInventory) => void;
  /**
   * Which saved account this is, so the cards remember their own open and
   * closed state per account rather than sharing one set across all of them.
   */
  accountId: string;
}

type NumericKey = {
  [K in keyof WhiteoutInventory]: WhiteoutInventory[K] extends number ? K : never;
}[keyof WhiteoutInventory];

interface HeroSkillProps {
  label: string;
  skill: string;
  enabled: boolean;
  level: number;
  /** Bonus per level, as a fraction. Index 0 is level 1. */
  table: number[];
  /** Overrides the default percentage label, for skills measured in hours. */
  formatBonus?: (index: number) => string;
  onToggle: (value: boolean) => void;
  onLevel: (value: number) => void;
}

const HeroSkill = ({
  label,
  skill,
  enabled,
  level,
  table,
  formatBonus,
  onToggle,
  onLevel,
}: HeroSkillProps) => (
  <div className={classes.heroSkill}>
    <label className={classes.toggle}>
      <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)} />
      <span className={classes.heroSkillName}>{label}</span>
    </label>
    {enabled ? (
      <select
        className={classes.heroSkillLevel}
        value={level}
        onChange={e => onLevel(Number(e.target.value) || 1)}
        aria-label={`${label} skill level`}
      >
        {table.map((r, i) => (
          <option key={i} value={i + 1}>
            Lv {i + 1} &middot; {formatBonus ? formatBonus(i) : `${Math.round(r * 100)}%`}
          </option>
        ))}
      </select>
    ) : (
      <span className={classes.heroSkillIdle}>{skill}</span>
    )}
  </div>
);

export const WhiteoutUpgradePlanner = ({
  inventory,
  onChange,
  accountId,
}: WhiteoutUpgradePlannerProps) => {
  const [troopTab, setTroopTab] = useState<TroopType>('infantry');
  const budget = staminaBudget(inventory);

  // Highest rank each building may hold, given where the Furnace and, for the
  // Command Center, the Embassy currently are.
  const caps = useMemo(() => {
    const out: Record<string, number> = {};
    for (const b of whiteoutBuildings) out[b.slug] = levelCapRank(b.slug, inventory.buildingLevels);
    return out;
  }, [inventory.buildingLevels]);

  // A plain sentence saying what the cap currently is, so a locked option has a
  // visible reason rather than just refusing to be picked.
  const gateSummary = (() => {
    const furnace = parseLevel(inventory.buildingLevels['furnace']);
    if (!furnace) return 'Set the Furnace first and the rest will cap themselves.';
    const embassy = parseLevel(inventory.buildingLevels['embassy']);
    const base = `Furnace Lv ${inventory.buildingLevels['furnace']} caps everything else at Lv ${tierLabel(furnace.tier)}.`;
    if (!embassy) return base;
    return `${base} Embassy Lv ${inventory.buildingLevels['embassy']} caps the Command Center at Lv ${tierLabel(Math.min(embassy.tier, furnace.tier))}.`;
  })();

  const set = (key: NumericKey) => (value: number) => onChange({ ...inventory, [key]: value });

  const setResource = (key: WhiteoutResource) => (value: number) =>
    onChange({ ...inventory, resources: { ...inventory.resources, [key]: value } });

  const addHero = () =>
    onChange({ ...inventory, heroShards: [...inventory.heroShards, newHeroShardEntry()] });

  const updateHero = (id: string, patch: Partial<HeroShardEntry>) =>
    onChange({
      ...inventory,
      heroShards: inventory.heroShards.map(h => (h.id === id ? { ...h, ...patch } : h)),
    });

  const setOwned = (type: TroopType, tier: number, value: number) =>
    onChange({
      ...inventory,
      troopsOwned: {
        ...inventory.troopsOwned,
        [type]: { ...inventory.troopsOwned[type], [tier]: value },
      },
    });

  const setMaxTier = (type: TroopType, tier: number) =>
    onChange({ ...inventory, maxTier: { ...inventory.maxTier, [type]: tier } });

  /** Tiers the open troop tab has unlocked, which is all it can hold or train. */
  const unlockedTiers = whiteoutTroops[troopTab].filter(
    r => r.tier <= (inventory.maxTier[troopTab] ?? 10)
  );

  const setHelios = (type: TroopType, level: number) =>
    onChange({ ...inventory, heliosLevels: { ...inventory.heliosLevels, [type]: level } });

  const removeHero = (id: string) =>
    onChange({ ...inventory, heroShards: inventory.heroShards.filter(h => h.id !== id) });

  /** Heroes already on the list, so no row offers one of them a second time. */
  const takenHeroNames = new Set(inventory.heroShards.map(h => h.name).filter(Boolean));

  return (
    <section className={classes.panel}>
      <header className={classes.panelHeader}>
        <div>
          <p className={classes.panelLabel}>What you have</p>
          <h2>Your inventory</h2>
          <p className={classes.lede}>
            Everything you own, entered once. Nothing here is a result: the plan for the event you
            pick is worked out further down. Type shorthand if you like: 1b, 2.5m, 300k.
          </p>
        </div>
      </header>

      {/* One place to say which account these cards belong to and what is in
          it, rather than fifteen pairs of props to say the same. */}
      <CardContext.Provider value={{ accountId, inventory }}>
      <div className={classes.grid}>
        <CollapsibleCard id="resources" title="Resources">
          {/* Gems sit INSIDE the same grid as the rest, not in a second one
              below it. Their own container gave them different row spacing
              and a different column width, so the last row did not line up
              with the eight above it. */}
          <div className={classes.fields}>
            {WHITEOUT_RESOURCES.map(r => (
              <AmountInput
                key={r}
                label={RESOURCE_LABELS[r]}
                icon={resourceIcon(r)}
                reserveIcon
                value={inventory.resources[r] ?? 0}
                onChange={setResource(r)}
              />
            ))}
            {/* Gems are a resource like any other: the wheel and the shops
                both spend them. */}
            <AmountInput
              label="Gems"
              icon={consumableIcon('gems')}
              reserveIcon
              value={consumableCount(inventory, 'gems')}
              onChange={value => onChange(withConsumable(inventory, 'gems', value))}
            />
          </div>
        </CollapsibleCard>

        <CollapsibleCard id="crystal-lab" title="Crystal Laboratory">
          <p className={classes.cardNote}>
            Super Refinement costs more the more you run: the first twenty are 20 Fire Crystals
            each, the last twenty 160. Resets Mondays.
          </p>
          <div className={classes.fields}>
            <AmountInput
              label="Super Refinements this week"
              hint={`of ${MAX_WEEKLY_REFINES}`}
              title="How many Super Refinements you have already run since Monday. This decides which tier the next one falls in, and so what it costs."
              reserveIcon
              value={inventory.superRefinesDone}
              onChange={set('superRefinesDone')}
              plain
            />
          </div>
        </CollapsibleCard>

        <CollapsibleCard id="keys-and-shards" title="Keys and shards">
          <div className={classes.fields}>
            <AmountInput label="Gold Keys" hint="Epic" icon={recruitmentKeyIcon('gold')} value={inventory.goldKeys} onChange={set('goldKeys')} />
            <AmountInput label="Platinum Keys" hint="Advanced" icon={recruitmentKeyIcon('platinum')} value={inventory.platinumKeys} onChange={set('platinumKeys')} />
            <AmountInput label="Rare Shards" icon={generalHeroShardIcon('rare')} value={inventory.rareShards} onChange={set('rareShards')} />
            <AmountInput label="Epic Shards" icon={generalHeroShardIcon('epic')} value={inventory.epicShards} onChange={set('epicShards')} />
            <AmountInput label="Mythic Shards" icon={generalHeroShardIcon('mythic')} value={inventory.mythicShards} onChange={set('mythicShards')} />
          </div>

          <div className={classes.heroList}>
            {inventory.heroShards.map(hero => (
              <div key={hero.id} className={classes.heroRow}>
                {/* The art belongs with the name it illustrates, not in a
                    column of its own: on its own it read as an orphan tile.
                    Reserved so a hero with no art yet keeps the names aligned. */}
                <div className={classes.heroHead}>
                  <WhiteoutItemIcon src={heroShardIcon(hero.name)} size="sm" reserve />
                <select
                  className={`${classes.input} ${classes.heroName}`}
                  value={hero.name}
                  onChange={e => {
                    const picked = heroByName.get(e.target.value);
                    updateHero(hero.id, {
                      name: e.target.value,
                      // Rarity comes from the roster, so it is never chosen by hand.
                      rarity: picked ? picked.rarity : hero.rarity,
                    });
                  }}
                  aria-label="Hero"
                >
                  <option value="">Pick a hero</option>
                  {HERO_RARITIES.slice().reverse().map(r => {
                    // A hero already on the list is dropped from every other
                    // row's options, so the same one cannot be added twice and
                    // have its shards counted twice. This row keeps its own
                    // pick, otherwise the select would have no matching option
                    // and would show blank.
                    const choices = whiteoutHeroes.filter(
                      h => h.rarity === r && (h.name === hero.name || !takenHeroNames.has(h.name))
                    );
                    if (!choices.length) return null;
                    return (
                      <optgroup key={r} label={HERO_RARITY_LABELS[r]}>
                        {choices.map(h => (
                          <option key={h.name} value={h.name}>
                            {h.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                </div>

                <div className={classes.heroStats}>
                <select
                  className={`${classes.input} ${classes.heroStars}`}
                  value={hero.owned ? String(hero.starLevel) : 'locked'}
                  onChange={e =>
                    updateHero(
                      hero.id,
                      e.target.value === 'locked'
                        ? { owned: false, starLevel: 0, starTier: 0 }
                        : { owned: true, starLevel: Number(e.target.value), starTier: 0 }
                    )
                  }
                  aria-label="Star level"
                >
                  <option value="locked">Locked</option>
                  {Array.from({ length: MAX_STARS + 1 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} star{i === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
                <select
                  className={`${classes.input} ${classes.heroTier}`}
                  value={hero.starTier}
                  disabled={!hero.owned || hero.starLevel >= MAX_STARS}
                  onChange={e => updateHero(hero.id, { starTier: Number(e.target.value) })}
                  aria-label="Tier progress"
                >
                  {Array.from({ length: TIERS_PER_STAR }, (_, i) => (
                    <option key={i} value={i}>
                      {i}/{TIERS_PER_STAR} tiers
                    </option>
                  ))}
                </select>
                <input
                  className={`${classes.input} ${classes.heroCount}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  autoComplete="off"
                  value={hero.count || ''}
                  onChange={e => {
                    const n = Number(e.target.value.replace(/[,\s]/g, ''));
                    updateHero(hero.id, { count: Number.isFinite(n) && n > 0 ? n : 0 });
                  }}
                  aria-label="Shard count"
                />
                <button
                  type="button"
                  className={classes.heroRemove}
                  onClick={() => removeHero(hero.id)}
                  aria-label={`Remove ${hero.name || 'hero'}`}
                >
                  &times;
                </button>
                </div>
                <span className={classes.heroCeiling}>
                  {(() => {
                    const room = shardsRemaining(hero.starLevel, hero.starTier, hero.owned);
                    if (room <= 0) return 'Maxed, shards wasted';
                    const spare = Math.max(0, hero.count - room);
                    return spare > 0
                      ? `Can use ${formatFull(room)}, ${formatFull(spare)} wasted`
                      : `Room for ${formatFull(room)} more`;
                  })()}
                </span>
              </div>
            ))}
          </div>

          <button type="button" className={classes.addHero} onClick={addHero}>
            + Add Hero
          </button>

          {/* Holding shards is not the same as being able to spend them: they
              only score if a hero of that rarity still has room for them. */}
          {HERO_RARITIES.map(rarity => {
            const cap = shardCapacity(inventory, rarity);
            if (cap.held <= 0) return null;
            const label = HERO_RARITY_LABELS[rarity];
            return (
              <p key={rarity} className={classes.cardNote}>
                <strong>{label}:</strong> {formatFull(cap.held)} held,{' '}
                {formatFull(cap.usable)} spendable
                {cap.stranded > 0 && (
                  <>
                    {' '}
                    &middot;{' '}
                    <strong>
                      {formatFull(cap.stranded)} have nowhere to go, so they score nothing
                    </strong>
                  </>
                )}
                {cap.unknownRoster ? (
                  <>
                    {' '}
                    &middot; no {label.toLowerCase()} hero listed, so this is taken at face value.
                    Add the heroes you are working on to find out how many you can really use.
                  </>
                ) : (
                  '.'
                )}
              </p>
            );
          })}

          {inventory.heroShards.length > 0 && (
            <p className={classes.cardNote}>
              A hero takes {SHARDS_LOCKED_TO_MAX.toLocaleString()} shards in total from locked to
              five stars. Each hero&rsquo;s room is claimed once: their own shards go in first, and
              only what is left over is open to the generic pile.
            </p>
          )}
        </CollapsibleCard>

        <CollapsibleCard id="speedups" title="Speedups">
          <div className={classes.fields}>
            <DurationInput label="General" icon={speedupIcon('general')} value={inventory.generalSpeedupMinutes} onChange={set('generalSpeedupMinutes')} />
            <label className={classes.field}>
              <span className={classes.fieldLabel}>
                Spend General on
                <em className={classes.fieldHint}>one pool only</em>
              </span>
              <select
                className={classes.input}
                value={inventory.generalSpeedupTarget}
                onChange={e =>
                  onChange({
                    ...inventory,
                    generalSpeedupTarget: e.target.value as GeneralSpeedupTarget,
                  })
                }
              >
                {GENERAL_TARGETS.map(target => (
                  <option key={target} value={target}>
                    {GENERAL_TARGET_LABELS[target]}
                  </option>
                ))}
              </select>
            </label>
            <DurationInput label="Troop Training" icon={speedupIcon('training')} value={inventory.trainingSpeedupMinutes} onChange={set('trainingSpeedupMinutes')} />
            <DurationInput label="Construction" icon={speedupIcon('construction')} value={inventory.constructionSpeedupMinutes} onChange={set('constructionSpeedupMinutes')} />
            <DurationInput label="Research" icon={speedupIcon('research')} value={inventory.researchSpeedupMinutes} onChange={set('researchSpeedupMinutes')} />
            <DurationInput label="Learning" icon={speedupIcon('learning')} value={inventory.expertSpeedupMinutes} onChange={set('expertSpeedupMinutes')} />
          </div>

          <div className={classes.fields}>
            {/* Each of these asks for a single number the game adds up nowhere,
                so the help panel names every source and, just as importantly,
                the ones to leave out because they are collected separately. */}
            <AmountInput label="Construction speed buff" hint="%" value={inventory.constructionBuffPercent} onChange={set('constructionBuffPercent')} plain help={<ConstructionSpeedHelp inventory={inventory} />} />
            <AmountInput label="Troop Training speed" hint="%" value={inventory.trainingSpeedPercent} onChange={set('trainingSpeedPercent')} plain help={<TrainingSpeedHelp inventory={inventory} />} />
            <AmountInput label="Research speed" hint="%" value={inventory.researchSpeedPercent} onChange={set('researchSpeedPercent')} plain help={<ResearchSpeedHelp inventory={inventory} />} />
          </div>
          <div className={classes.widgetBlock}>
            {/* Not headed "Chief Order" any more: Builder's Aide is a pet skill,
                not an order. What the two share is the shape, five minutes on a
                23 hour cooldown, which is the only reason either one counts. */}
            <span className={classes.groupHeading}>Five minute buffs</span>
            <div className={classes.heroSkills}>
              <label className={classes.toggle}>
                <input
                  type="checkbox"
                  checked={inventory.useDoubleTime}
                  onChange={e => onChange({ ...inventory, useDoubleTime: e.target.checked })}
                />
                <span className={classes.heroSkillName}>
                  Double Time
                  <em className={classes.fieldHint}>
                    {' '}
                    Chief Order, +{DOUBLE_TIME_PERCENT}% construction, 23h cooldown
                  </em>
                </span>
              </label>
              <label className={classes.toggle}>
                <input
                  type="checkbox"
                  checked={inventory.useBuildersAide}
                  onChange={e => onChange({ ...inventory, useBuildersAide: e.target.checked })}
                />
                <span className={classes.heroSkillName}>
                  Builder&rsquo;s Aide
                  <em className={classes.fieldHint}>
                    {' '}
                    Cave Hyena, up to +{BUILDERS_AIDE_BY_LEVEL[BUILDERS_AIDE_BY_LEVEL.length - 1]}%
                    construction, 23h cooldown
                  </em>
                </span>
              </label>
              {inventory.useBuildersAide && (
                <label className={classes.inlineSelect}>
                  <span>Builder&rsquo;s Aide level</span>
                  <select
                    value={inventory.buildersAideLevel}
                    onChange={e =>
                      onChange({ ...inventory, buildersAideLevel: Number(e.target.value) || 1 })
                    }
                  >
                    {BUILDERS_AIDE_BY_LEVEL.map((percent, i) => (
                      <option key={i} value={i + 1}>
                        Lv {i + 1} &middot; +{percent}%
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <p className={classes.cardNote}>
              Both only reach upgrades started within five minutes, so use them just before
              starting the plan below. Speedups poured in while they are up finish those builds
              at the raised rate, which is what makes five minutes worth planning around. You are
              building at <strong>{effectiveConstructionSpeed(inventory)}%</strong>.
            </p>
          </div>

          <p className={classes.cardNote}>
            The President&rsquo;s buff is usually up for part of the event only. Say which days
            and the plan will say when to spend. Leave unset if you do not know.
          </p>
          <div className={classes.fields}>
            <label className={classes.field}>
              <span className={classes.fieldLabel}>
                President Construction buff
                <em className={classes.fieldHint}>day</em>
              </span>
              <select
                className={classes.input}
                value={inventory.presidentConstructionDay}
                onChange={e =>
                  onChange({ ...inventory, presidentConstructionDay: Number(e.target.value) })
                }
              >
                <option value={0}>Not set</option>
                {DAY_CHOICES.map(d => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </label>
            <label className={classes.field}>
              <span className={classes.fieldLabel}>
                President Research buff
                <em className={classes.fieldHint}>day</em>
              </span>
              <select
                className={classes.input}
                value={inventory.presidentResearchDay}
                onChange={e =>
                  onChange({ ...inventory, presidentResearchDay: Number(e.target.value) })
                }
              >
                <option value={0}>Not set</option>
                {DAY_CHOICES.map(d => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CollapsibleCard>

        <CollapsibleCard id="heroes" title="Heroes">
          <div className={classes.heroSkills}>
            <HeroSkill
              label="Zinman"
              skill="Build cost"
              enabled={inventory.useZinman}
              level={inventory.zinmanSkillLevel}
              table={ZINMAN_REDUCTION_BY_LEVEL}
              onToggle={v => onChange({ ...inventory, useZinman: v })}
              onLevel={v => onChange({ ...inventory, zinmanSkillLevel: v })}
            />
            <HeroSkill
              label="Ling Xue"
              skill="Total Control, training speed"
              enabled={inventory.useLingXue}
              level={inventory.lingXueLevel}
              table={LING_XUE_BY_LEVEL}
              onToggle={v => onChange({ ...inventory, useLingXue: v })}
              onLevel={v => onChange({ ...inventory, lingXueLevel: v })}
            />
            <HeroSkill
              label="Jasser"
              skill="Enlightened Warfare, research speed"
              enabled={inventory.useJasser}
              level={inventory.jasserLevel}
              table={JASSER_BY_LEVEL}
              onToggle={v => onChange({ ...inventory, useJasser: v })}
              onLevel={v => onChange({ ...inventory, jasserLevel: v })}
            />
          </div>
          <p className={classes.cardNote}>
            Zinman cuts build cost on meat, wood, coal and iron. Ling Xue and Jasser add to the
            speed totals above, so with them on you are at{' '}
            {Math.round(effectiveTrainingSpeed(inventory))}% training and{' '}
            {Math.round(effectiveResearchSpeed(inventory))}% research speed.
          </p>
        </CollapsibleCard>

        <CollapsibleCard id="stamina" title="Stamina and rallies">
          <div className={classes.fields}>
            {/* Both fields take the canister: in game it stands for the meter
                and for the item that tops it up, which is why they share a
                name. The rest of the card reserves the icon's space so the
                labels stay in one column. */}
            <AmountInput label="Stamina" icon={CHIEF_STAMINA_ICON} value={inventory.stamina} onChange={set('stamina')} />
            <AmountInput label="Chief Stamina" icon={CHIEF_STAMINA_ICON} hint={`${CHIEF_STAMINA_VALUE} each`} value={inventory.chiefStaminaItems} onChange={set('chiefStaminaItems')} />
            <AmountInput
              label="Intel skipped"
              hint={`of ${budget.intelAvailablePerDay}/day`}
              title={`Intel missions left unrun each day. It banks far less than ${INTEL_STAMINA_PER_MISSION} a mission: a meter sitting at ${STAMINA_REGEN_CAP} earns nothing, so most of what you save is regen you then throw away.`}
              reserveIcon
              value={inventory.intelMissionsSkippedPerDay}
              onChange={set('intelMissionsSkippedPerDay')}
              plain
            />
            <AmountInput label="Rallies at a time" reserveIcon value={inventory.ralliesAtATime} onChange={set('ralliesAtATime')} plain />
            <AmountInput label="Polar Terror march" reserveIcon hint="min" value={inventory.polarTerrorMarchMinutes} onChange={set('polarTerrorMarchMinutes')} plain />
            <AmountInput label="Beast march" reserveIcon hint="min" value={inventory.beastMarchMinutes} onChange={set('beastMarchMinutes')} plain />
            <AmountInput
              label="Beast level"
              hint={`max ${MAX_BEAST_LEVEL}`}
              title="The highest beast level you actually hunt. Events that pay by level band score at that band, and since every band costs the same stamina, a lower level is purely a lower rate."
              reserveIcon
              value={inventory.huntBeastLevel}
              onChange={set('huntBeastLevel')}
              plain
            />
          </div>

          <p className={classes.cardNote}>
            March times are the full round trip, including the rally wait. The defaults are
            averages: replace them with your own.
          </p>

          <div className={classes.toggleRow}>
            <label className={classes.toggle}>
              <input
                type="checkbox"
                checked={inventory.useGina}
                onChange={e => onChange({ ...inventory, useGina: e.target.checked })}
              />
              <span>Use Gina</span>
            </label>
            {inventory.useGina && (
              <label className={classes.inlineSelect}>
                <span>Endurance Training</span>
                <select
                  value={inventory.ginaSkillLevel}
                  onChange={e => onChange({ ...inventory, ginaSkillLevel: Number(e.target.value) || 1 })}
                >
                  {GINA_REDUCTION_BY_LEVEL.map((r, i) => (
                    <option key={i} value={i + 1}>
                      Lv {i + 1} &middot; {Math.round(r * 100)}%
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

        </CollapsibleCard>

        <GatheringCard inventory={inventory} onChange={onChange} />

        <ExpertsCard inventory={inventory} onChange={onChange} />

        <HeroGearCard inventory={inventory} onChange={onChange} />

        <ChiefGearCard inventory={inventory} onChange={onChange} />

        <CharmCard inventory={inventory} onChange={onChange} />

        <PetsCard inventory={inventory} onChange={onChange} />

        <ResearchTreeCard inventory={inventory} onChange={onChange} />

        <CollapsibleCard id="troops" title="Troops" className={`${classes.buildingsCard}`}>
          <div className={classes.troopTabs}>
            {TROOP_TYPES.map(t => (
              <button
                key={t}
                type="button"
                className={`${classes.troopTab} ${t === troopTab ? classes.troopTabActive : ''}`}
                onClick={() => setTroopTab(t)}
                aria-pressed={t === troopTab}
              >
                {TROOP_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div className={classes.troopTop}>
            <label className={classes.field}>
              <span className={classes.fieldLabel}>Highest tier unlocked</span>
              <select
                className={classes.input}
                value={inventory.maxTier[troopTab] ?? 10}
                onChange={e => setMaxTier(troopTab, Number(e.target.value))}
              >
                {whiteoutTroops[troopTab].map(r => (
                  <option key={r.tier} value={r.tier}>
                    T{r.tier}
                  </option>
                ))}
              </select>
            </label>
            <label className={classes.field}>
              <span className={classes.fieldLabel}>
                Helios Training
                <em className={classes.fieldHint}>T11 cost</em>
              </span>
              <select
                className={classes.input}
                value={inventory.heliosLevels[troopTab] ?? 0}
                onChange={e => setHelios(troopTab, Number(e.target.value))}
              >
                <option value={0}>None</option>
                {Array.from({ length: HELIOS_LEVELS }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Lv {i + 1} &middot; {(i + 1) * 5}%
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={classes.widgetBlock}>
            <span className={classes.groupHeading}>Training capacity</span>
            <p className={classes.cardNote}>
              Capacity decides a troop day, not the speedup pile: a batch queued beforehand
              lands on the day having spent nothing.
            </p>
            <div className={classes.itemGrid}>
              <AmountInput
                label={`${TROOP_TYPE_LABELS[troopTab]} camp capacity`}
                hint="troops per batch"
                title="Troops this camp can hold in one training batch, before any buff."
                value={inventory.trainingCapacity[troopTab] ?? 0}
                onChange={v =>
                  onChange({
                    ...inventory,
                    trainingCapacity: { ...inventory.trainingCapacity, [troopTab]: v },
                  })
                }
              />
            </div>
            <div className={classes.heroSkills}>
              <label className={classes.toggle}>
                <input
                  type="checkbox"
                  checked={inventory.useTrainingCapacityEnhance}
                  onChange={e =>
                    onChange({ ...inventory, useTrainingCapacityEnhance: e.target.checked })
                  }
                />
                <span className={classes.heroSkillName}>
                  Training Capacity Enhance
                  <em className={classes.fieldHint}> 2h, triples capacity</em>
                </span>
              </label>
              <label className={classes.toggle}>
                <input
                  type="checkbox"
                  checked={inventory.useAdvancedTraining}
                  onChange={e => onChange({ ...inventory, useAdvancedTraining: e.target.checked })}
                />
                <span className={classes.heroSkillName}>
                  Chief Order Advanced Training
                  <em className={classes.fieldHint}> 2h, +{ADVANCED_TRAINING_PERCENT}% speed, 2 day cooldown</em>
                </span>
              </label>
            </div>
            <div className={classes.itemGrid}>
              <label className={classes.field}>
                <span className={classes.fieldLabel}>
                  Appointment when you queue
                  <em className={classes.fieldHint}>{APPOINTMENT_MINUTES} min slot</em>
                </span>
                <select
                  className={classes.input}
                  value={inventory.appointmentWhenQueueing}
                  onChange={e =>
                    onChange({
                      ...inventory,
                      appointmentWhenQueueing: e.target.value as Appointment,
                    })
                  }
                >
                  {APPOINTMENTS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className={classes.cardNote}>
              {appointmentEffect(inventory.appointmentWhenQueueing).note} Both halves count.
              Three batches fit in one {APPOINTMENT_MINUTES} minute slot, so one slot a day is
              enough.
            </p>

            {effectiveTrainingCapacity(inventory, troopTab) > 0 && (
              <p className={classes.cardNote}>
                That queues <strong>{formatFull(effectiveTrainingCapacity(inventory, troopTab))}</strong>{' '}
                {TROOP_TYPE_LABELS[troopTab].toLowerCase()} at T{inventory.maxTier[troopTab] ?? 10}{' '}
                to land on the scoring day, resources permitting.
              </p>
            )}
          </div>

          {tierIsEstimated(troopTab, inventory.maxTier[troopTab] ?? 10) && (
            <p className={classes.warnLine}>
              T12 training costs are worked out from the published promotion cost, not read off
              the game, so the T12 part of any plan is an estimate. Your own training screen
              prints the real figure.
            </p>
          )}

          <p className={classes.cardNote}>
            How many {TROOP_TYPE_LABELS[troopTab].toLowerCase()} you already hold, by tier. These
            are what can be promoted; promoting scores only the difference between tiers, so it
            competes with training fresh rather than always winning.
          </p>

          <div className={classes.buildings}>
            {/* Only the tiers this camp can actually field. A player on T10 has
                no way to hold a T11, so asking was asking for a number that is
                always zero. */}
            {unlockedTiers.map(r => (
              <AmountInput
                key={r.tier}
                label={`T${r.tier}`}
                value={inventory.troopsOwned[troopTab]?.[r.tier] ?? 0}
                onChange={v => setOwned(troopTab, r.tier, v)}
              />
            ))}
          </div>
        </CollapsibleCard>

        <CollapsibleCard id="buildings" title="Building levels" className={`${classes.buildingsCard}`}>
          <p className={classes.cardNote}>
            Nothing may pass the Furnace, and the Command Center may not pass the Embassy,
            counted in whole levels. Levels above the cap show as locked.
            {gateSummary && <> {gateSummary}</>}
          </p>
          <div className={classes.buildings}>
            {whiteoutBuildings.map(b => (
              <label key={b.slug} className={classes.field}>
                {/* The art is what a player actually recognises; the name below
                    it is the caption. A building with no art yet just shows the
                    caption, which is why this is a sibling rather than a
                    background on the label. */}
                <WhiteoutArt src={buildingArt(b.slug)} alt={b.name} variant="building" reserve />
                <span className={classes.fieldLabel}>{b.name}</span>
                <select
                  className={`${classes.input} ${
                    (inventory.buildingLevels[b.slug] ?? NOT_BUILT) === NOT_BUILT
                      ? classes.inputEmpty
                      : ''
                  }`}
                  value={inventory.buildingLevels[b.slug] ?? NOT_BUILT}
                  onChange={e =>
                    onChange({
                      ...inventory,
                      buildingLevels: clampLevels(whiteoutBuildings, {
                        ...inventory.buildingLevels,
                        [b.slug]: e.target.value,
                      }),
                    })
                  }
                >
                  <option value={NOT_BUILT}>Not built</option>
                  {b.levels.map(l => {
                    const blocked = levelRank(l.level) > caps[b.slug];
                    return (
                      <option key={l.level} value={l.level} disabled={blocked}>
                        Lv {l.level}
                        {blocked ? ' (locked)' : ''}
                      </option>
                    );
                  })}
                </select>
              </label>
            ))}
          </div>
        </CollapsibleCard>
      </div>
      </CardContext.Provider>

    </section>
  );
};
