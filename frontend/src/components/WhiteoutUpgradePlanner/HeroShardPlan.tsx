import {
  HERO_RARITIES,
  HERO_RARITY_LABELS,
  shardCapacity,
  genericShards,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import { shardsRemaining } from '../../data/whiteoutHeroStars';
import { formatFull } from '../../utils/whiteoutFormat';
import classes from './WhiteoutUpgradePlanner.module.css';

interface HeroShardPlanProps {
  inventory: WhiteoutInventory;
  day: number | null;
}

/**
 * Where hero shards can actually go.
 *
 * Unlike the charm and pet plans there is nothing to optimise here: an event
 * pays a flat rate per shard of a given rarity, so which hero receives them
 * changes who gets stronger, not what the event pays. What DOES change the
 * score is how many have somewhere to go at all, and that is what this shows:
 * a hero at full stars takes none, and shards above what the roster can hold
 * score nothing however many are in the bag.
 *
 * The one case worth calling out is an empty roster. With no heroes entered the
 * engine assumes every shard is spendable, because no information is not the
 * same as a cap of zero, and that assumption is the only place the calculator
 * can flatter a bag. It says so rather than hiding it.
 */
export const HeroShardPlan = ({ inventory, day }: HeroShardPlanProps) => {
  const rows = HERO_RARITIES.map(rarity => ({
    rarity,
    capacity: shardCapacity(inventory, rarity),
    generic: genericShards(inventory, rarity),
    heroes: inventory.heroShards.filter(h => h.rarity === rarity),
  })).filter(r => r.capacity.held > 0 || r.heroes.length > 0);

  if (!rows.length) return null;

  const unknown = rows.filter(r => r.capacity.unknownRoster);
  const stranded = rows.reduce((t, r) => t + r.capacity.stranded, 0);

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Hero shard plan</h3>
        {stranded > 0 && (
          <span className={classes.limitChip}>
            {formatFull(stranded)} have nowhere to go
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        {rows.map(r => (
          <div key={r.rarity}>
            <dt>{HERO_RARITY_LABELS[r.rarity]}</dt>
            <dd>
              <span className={classes.left}>{formatFull(r.capacity.usable)}</span> usable of{' '}
              {formatFull(r.capacity.held)}
            </dd>
          </div>
        ))}
        {day !== null && (
          <div>
            <dt>Spend on</dt>
            <dd>Day {day}</dd>
          </div>
        )}
      </dl>

      {unknown.length > 0 && (
        <p className={classes.warnLine}>
          No {unknown.map(r => HERO_RARITY_LABELS[r.rarity].toLowerCase()).join(' or ')} heroes are
          listed on the Keys and shards card, so every shard of that rarity is being counted as
          spendable. Add the heroes you are actually ascending and this figure will drop to what
          they can take.
        </p>
      )}

      {rows.some(r => r.heroes.length > 0) && (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Hero</th>
                <th>Rarity</th>
                <th>At</th>
                <th className={classes.num}>Held</th>
                <th className={classes.num}>Room</th>
                <th className={classes.num}>Wasted</th>
              </tr>
            </thead>
            <tbody>
              {rows.flatMap(r =>
                r.heroes.map(hero => {
                  const room = shardsRemaining(hero.starLevel, hero.starTier, hero.owned);
                  const spare = Math.max(hero.count - room, 0);
                  return (
                    <tr key={hero.id}>
                      <td>{hero.name || 'Not picked'}</td>
                      <td>{HERO_RARITY_LABELS[r.rarity]}</td>
                      <td>
                        {hero.owned ? `${hero.starLevel}★ ${hero.starTier}/3` : 'Locked'}
                      </td>
                      <td className={classes.num}>{formatFull(hero.count)}</td>
                      <td className={`${classes.num} ${room > 0 ? classes.left : ''}`}>
                        {formatFull(room)}
                      </td>
                      <td className={`${classes.num} ${spare > 0 ? classes.spend : ''}`}>
                        {spare > 0 ? formatFull(spare) : '0'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {rows.some(r => r.generic > 0) && (
        <p className={classes.cardNote}>
          Generic shards go to any hero of their rarity, so they fill whatever room the named
          heroes above have left over. A hero at full stars takes none.
        </p>
      )}
    </section>
  );
};
