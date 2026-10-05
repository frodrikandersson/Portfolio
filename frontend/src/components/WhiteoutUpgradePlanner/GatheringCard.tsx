import {
  GATHER_RESOURCES,
  GATHER_TILE_NAMES,
  ALLIANCE_NODE_NAME,
  BURDEN_BEARER_MAX_LEVEL,
  burdenBearerCooldown,
  GATHER_HEROES,
  MAX_GATHER_TILE_LEVEL,
  gatherSecondsAt,
  gatherHeroBonus,
} from '../../data/whiteoutGatherTiles';
import type { WhiteoutInventory } from '../../models/whiteoutInventory';
import { AmountInput } from './AmountInput';
import { DurationInput } from './DurationInput';
import classes from './WhiteoutUpgradePlanner.module.css';
import { CollapsibleCard } from './CollapsibleCard';

interface GatheringCardProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/**
 * Everything the gathering plan needs, and nothing it can work out for itself.
 *
 * All of it is readable off the tile confirmation screen or simply known, so
 * none of it is guessed on the player's behalf. Gathering speed in particular
 * changes the answer more than anything else here, and there is no way to infer
 * it from the rest.
 */
export const GatheringCard = ({ inventory, onChange }: GatheringCardProps) => {
  const set = <K extends keyof WhiteoutInventory>(key: K, value: WhiteoutInventory[K]) =>
    onChange({ ...inventory, [key]: value });

  const level = inventory.gatherTileLevel;
  // What a march with no hero should work. Every resource pays the same for the
  // same tile level, so the only thing between them is how fast you gather each,
  // which makes this derived rather than a question worth asking.
  const best = GATHER_RESOURCES.reduce((a, r) => {
    const here = gatherSecondsAt(level, r, inventory.gatherSpeedPercent[r] ?? 0);
    const there = gatherSecondsAt(level, a, inventory.gatherSpeedPercent[a] ?? 0);
    if (here === null) return a;
    if (there === null) return r;
    return here < there ? r : a;
  }, GATHER_RESOURCES[0]);
  const speed = inventory.gatherSpeedPercent[best] ?? 0;
  const heroesUsed = GATHER_RESOURCES.filter(r => (inventory.gatherHeroLevels[r] ?? 0) > 0).length;
  const queues = Math.max(Math.round(inventory.gatherMarchQueues), 0);

  return (
    <CollapsibleCard id="gathering" title="Gathering" className={`${classes.buildingsCard}`}>
      <div className={classes.itemGrid}>
        <AmountInput
          label="March queues"
          hint="marches at once"
          title="Simultaneous marches you can field. This is the biggest single lever on a gathering day."
          value={inventory.gatherMarchQueues}
          onChange={v => set('gatherMarchQueues', v)}
          plain
        />
        <AmountInput
          label="March to tiles"
          hint="min one way"
          title="Minutes one way to the tiles you usually work."
          value={inventory.gatherOneWayMinutes}
          onChange={v => set('gatherOneWayMinutes', v)}
          plain
        />
        <label className={classes.field}>
          <span className={classes.fieldLabel}>
            Tile level
            <em className={classes.fieldHint}>1 to {MAX_GATHER_TILE_LEVEL}</em>
          </span>
          <select
            className={classes.input}
            value={level}
            onChange={e => set('gatherTileLevel', Number(e.target.value))}
          >
            {Array.from({ length: MAX_GATHER_TILE_LEVEL }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Lv. {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={classes.widgetBlock}>
        <span className={classes.groupHeading}>Gathering speed, per resource</span>
        <div className={classes.itemGrid}>
          {GATHER_RESOURCES.map(resource => (
            <AmountInput
              key={resource}
              label={GATHER_TILE_NAMES[resource]}
              hint="%"
              title={`Gathering speed on ${resource}. Enter 345.5 for +345.5%.`}
              value={inventory.gatherSpeedPercent[resource] ?? 0}
              onChange={v =>
                set('gatherSpeedPercent', { ...inventory.gatherSpeedPercent, [resource]: v })
              }
              plain
            />
          ))}
        </div>
      </div>

      {speed <= 0 && (
        <p className={classes.cardNote}>
          Enter your gathering speed to get a plan. It is shown on the tile screen as
          &ldquo;Gathering speed: +X%&rdquo;.
        </p>
      )}

      <div className={classes.widgetBlock}>
        <span className={classes.groupHeading}>Gathering heroes</span>
        <p className={classes.cardNote}>
          Each one only speeds up its own resource, and can only ride one march at a time. With{' '}
          {queues || 'your'} queues and four heroes, {Math.max(queues - heroesUsed, 0)} march
          {Math.max(queues - heroesUsed, 0) === 1 ? '' : 'es'} go out without one.
        </p>
        <div className={classes.itemGrid}>
          {GATHER_RESOURCES.map(resource => (
            <label key={resource} className={classes.field}>
              <span className={classes.fieldLabel}>
                {GATHER_HEROES[resource].hero}
                <em className={classes.fieldHint}>{resource}</em>
              </span>
              <select
                className={classes.input}
                value={inventory.gatherHeroLevels[resource] ?? 0}
                onChange={e =>
                  set('gatherHeroLevels', {
                    ...inventory.gatherHeroLevels,
                    [resource]: Number(e.target.value),
                  })
                }
              >
                <option value={0}>Not used</option>
                {[1, 2, 3, 4, 5].map(lv => (
                  <option key={lv} value={lv}>
                    Lv {lv} &middot; +{gatherHeroBonus(lv)}%
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className={classes.widgetBlock}>
        <span className={classes.groupHeading}>Alliance gathering building</span>
        <div className={classes.itemGrid}>
          <DurationInput
            label="Placed before reset"
            value={inventory.allianceBuildingLeadMinutes}
            onChange={v => set('allianceBuildingLeadMinutes', v)}
          />
          <DurationInput
            label="Node lasts"
            value={inventory.allianceBuildingLifespanMinutes}
            onChange={v => set('allianceBuildingLifespanMinutes', v)}
          />
          <AmountInput
            label="March to building"
            hint="min one way"
            value={inventory.allianceBuildingOneWayMinutes}
            onChange={v => set('allianceBuildingOneWayMinutes', v)}
            plain
          />
        </div>
        <h4 className={classes.groupHeading}>Burden Bearer</h4>
        <p className={classes.cardNote}>
          The Musk Ox skill. It finishes the next ordinary tile a march reaches the instant it
          lands, so that march brings home a full tile for the price of the walk. It does not fire
          on the {ALLIANCE_NODE_NAME}.
        </p>
        <div className={classes.itemGrid}>
          <label className={classes.field}>
            <span className={classes.fieldLabel}>
              Musk Ox skill level
              <em className={classes.fieldHint}>0 if you have none</em>
            </span>
            <select
              className={classes.input}
              value={inventory.burdenBearerLevel}
              onChange={e => set('burdenBearerLevel', Number(e.target.value))}
            >
              <option value={0}>No Musk Ox</option>
              {Array.from({ length: BURDEN_BEARER_MAX_LEVEL }, (_, i) => {
                const cooldown = burdenBearerCooldown(i + 1) ?? 0;
                return (
                  <option key={i + 1} value={i + 1}>
                    Lv. {i + 1} &middot; {Math.round(cooldown / 60)}h cooldown
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        <p className={classes.cardNote}>
          The cooldown starts on the press, not on the use, so it is pressed the evening before
          once every march is already sitting on a tile. Hours of it are gone before the day even
          opens, which is often what turns one use into two. The plan below works out when to
          press and how many you get.
        </p>

        <label className={classes.toggle}>
          <input
            type="checkbox"
            checked={inventory.allianceNodeUseBoost}
            onChange={e => set('allianceNodeUseBoost', e.target.checked)}
          />
          <span className={classes.heroSkillName}>
            Gathering Speed Boost running during the node march
          </span>
        </label>
      </div>

      <div className={classes.widgetBlock}>
        <span className={classes.groupHeading}>Gathering Speed Boost</span>
        <div className={classes.itemGrid}>
          <label className={classes.field}>
            <span className={classes.fieldLabel}>
              Boost used
              <em className={classes.fieldHint}>item</em>
            </span>
            <select
              className={classes.input}
              value={inventory.gatherBoostMinutes}
              onChange={e => set('gatherBoostMinutes', Number(e.target.value))}
            >
              <option value={0}>None</option>
              <option value={8 * 60}>8 hours</option>
              <option value={24 * 60}>24 hours</option>
            </select>
          </label>
          <AmountInput
            label="Boost gives"
            hint="%"
            title="Extra gathering speed while it runs. The item gives 100."
            value={inventory.gatherBoostPercent}
            onChange={v => set('gatherBoostPercent', v)}
            plain
          />
        </div>
        <p className={classes.cardNote}>
          It stacks with everything else, so it is worth less the more gathering speed you already
          have: at +{speed || 0}% a further +{inventory.gatherBoostPercent}% cuts a gather by{' '}
          {speed > 0
            ? `${Math.round((1 - (1 + speed / 100) / (1 + (speed + inventory.gatherBoostPercent) / 100)) * 100)}%`
            : 'half'}
          , not by half.
        </p>
      </div>
    </CollapsibleCard>
  );
};
