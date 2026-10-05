import { whiteoutPets, PET_RARITY_LABELS } from '../../data/whiteoutPets';
import { petLevels, withPetLevel, type WhiteoutInventory } from '../../models/whiteoutInventory';
import { ConsumableFields } from './ConsumableFields';
import classes from './WhiteoutUpgradePlanner.module.css';
import { CollapsibleCard } from './CollapsibleCard';

interface PetsCardProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/**
 * Which pets you have, and what level each is at.
 *
 * Level 0 means not owned, which is the default: most accounts have a handful
 * of the fourteen rather than all of them, and a planner that assumed
 * otherwise would promise score from pets the player cannot touch.
 *
 * Only the advancement levels pay, every tenth level, so the dropdown offers
 * those plus the current level rather than every number from 1 to 100. A pet
 * sitting at Lv. 37 has paid food for seven levels and been given nothing for
 * them, which is worth seeing rather than hiding.
 */
export const PetsCard = ({ inventory, onChange }: PetsCardProps) => {
  const levels = petLevels(inventory);
  const owned = whiteoutPets.filter(p => (levels[p.id] ?? 0) > 0).length;

  const setLevel = (petId: string) => (value: number) =>
    onChange(withPetLevel(inventory, petId, value));

  return (
    <CollapsibleCard id="pets" title="Pets" className={`${classes.buildingsCard}`}>
      <ConsumableFields inventory={inventory} onChange={onChange} group="pet" heading />

      <div className={classes.toggleRow}>
        <span className={classes.fieldHint}>
          {owned} of {whiteoutPets.length} owned
        </span>
      </div>

      <div className={`${classes.fields} ${classes.gearSlots}`}>
        {whiteoutPets.map(pet => {
          const at = levels[pet.id] ?? 0;
          // The tens, plus wherever this pet actually sits if that is not one.
          const stops = [
            0,
            ...pet.advancementCosts.map(a => a.level).filter(l => l <= pet.maxLevel),
          ];
          if (at > 0 && !stops.includes(at)) stops.push(at);
          stops.sort((a, b) => a - b);

          return (
            <label key={pet.id} className={classes.field}>
              <span className={classes.fieldLabel}>
                {pet.name} <span className={classes.fieldHint}>{PET_RARITY_LABELS[pet.rarity]}</span>
              </span>
              <select
                className={`${classes.input} ${at <= 0 ? classes.inputEmpty : ''}`}
                value={at}
                onChange={e => setLevel(pet.id)(Number(e.target.value))}
              >
                {stops.map(level => (
                  <option key={level} value={level}>
                    {level === 0 ? 'Not owned' : `Lv. ${level}`}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </CollapsibleCard>
  );
};
