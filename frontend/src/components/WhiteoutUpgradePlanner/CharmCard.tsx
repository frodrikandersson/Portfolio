import {
  CHARM_TYPES,
  CHARMS_PER_TYPE,
} from '../../data/whiteoutChiefCharms';
import {
  charmPositions,
  withCharmPosition,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import {
  CHARM_POSITION_LABELS,
  CHARM_STEP_COUNT,
} from '../../utils/whiteoutCharmPlanner';
import { ConsumableFields } from './ConsumableFields';
import classes from './WhiteoutUpgradePlanner.module.css';
import { CollapsibleCard } from './CollapsibleCard';

interface CharmCardProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/**
 * Where the eighteen Chief Charms currently sit.
 *
 * Three types of six, laid out in the three rows the game shows them in, so a
 * player reading off their own screen can go straight down the list. Each one
 * walks the same 75 step ladder independently, which is why this is eighteen
 * copies of one question rather than a single level.
 *
 * Positions are steps, not levels. From Lv. 4 a level is charged in
 * instalments that score on their own, so a charm genuinely can be parked at
 * Lv. 11.3, and a card that only offered whole levels would make such a player
 * enter something false.
 *
 * The materials are not repeated here. They are entered on the Consumables
 * card under Chief Charms and shown again in the plan, and a third copy in
 * between was just more to scroll past.
 */
export const CharmCard = ({ inventory, onChange }: CharmCardProps) => {
  const positions = charmPositions(inventory);

  const setSlot = (slot: number) => (value: number) =>
    onChange(withCharmPosition(inventory, slot, value));

  const setAll = (value: number) => {
    let next = inventory;
    for (let slot = 0; slot < positions.length; slot += 1) {
      next = withCharmPosition(next, slot, value);
    }
    onChange(next);
  };

  const started = positions.filter(p => p > 0).length;
  const atTop = positions.filter(p => p >= CHARM_STEP_COUNT).length;

  return (
    <CollapsibleCard id="charms" title="Chief Charms" className={`${classes.buildingsCard}`}>
      {/* Most accounts have all eighteen at or near the same level, so filling
          them one at a time is eighteen clicks to say one thing. */}
      <ConsumableFields inventory={inventory} onChange={onChange} group="charm" heading />

      <div className={classes.toggleRow}>
        <button type="button" className={classes.linkButton} onClick={() => setAll(0)}>
          Set all to Lv. 0
        </button>
        <span className={classes.fieldHint}>
          {started} of {positions.length} started
          {atTop > 0 ? `, ${atTop} finished` : ''}
        </span>
      </div>

      {CHARM_TYPES.map((type, typeIndex) => (
        <div key={type.id}>
          <p className={classes.fieldLabel}>
            {type.label} <span className={classes.fieldHint}>{type.troops}</span>
          </p>
          <div className={`${classes.fields} ${classes.gearSlots}`}>
            {Array.from({ length: CHARMS_PER_TYPE }, (_, i) => {
              const slot = typeIndex * CHARMS_PER_TYPE + i;
              return (
                <label key={slot} className={classes.field}>
                  <span className={classes.fieldLabel}>{type.label} {i + 1}</span>
                  <select
                    className={`${classes.input} ${positions[slot] <= 0 ? classes.inputEmpty : ''}`}
                    value={positions[slot]}
                    onChange={e => setSlot(slot)(Number(e.target.value))}
                  >
                    {CHARM_POSITION_LABELS.map((label, position) => (
                      <option key={position} value={position}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </CollapsibleCard>
  );
};
