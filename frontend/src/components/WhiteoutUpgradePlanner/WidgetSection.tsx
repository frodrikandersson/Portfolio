import { useState } from 'react';
import {
  WIDGET_GENERATIONS,
  WIDGET_MAX_LEVEL,
} from '../../data/whiteoutConsumables';
import {
  consumableCount,
  totalWidgets,
  widgetPlanFor,
  withWidgetLevel,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import { formatFull } from '../../utils/whiteoutFormat';
import { widgetChestIcon } from '../../data/whiteoutItemIcons';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';
import { WhiteoutHeroPortrait } from '../WhiteoutItemIcon/WhiteoutHeroPortrait';
import { consumableField } from './consumableField';
import classes from './WhiteoutUpgradePlanner.module.css';

interface WidgetSectionProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/**
 * Exclusive gear widgets, by generation and then by hero.
 *
 * Moved out of the old Consumables card and into Hero Gear, which is what
 * widgets are spent on. The block itself is unchanged.
 */
export const WidgetSection = ({ inventory, onChange }: WidgetSectionProps) => {
  const [gen, setGen] = useState(WIDGET_GENERATIONS[0]?.gen ?? 1);
  const generation = WIDGET_GENERATIONS.find(g => g.gen === gen) ?? WIDGET_GENERATIONS[0];
  const widgets = totalWidgets(inventory);
  const f = (id: string, label: string, hint?: string, note?: string) =>
    consumableField(inventory, onChange, id, label, hint, note);

  return (
      <div className={classes.widgetBlock}>
        <div className={classes.widgetHeader}>
          <span className={classes.groupHeading}>Exclusive gear widgets</span>
          <span className={classes.widgetTotal}>{formatFull(widgets)} widgets in total</span>
        </div>
        <div className={`${classes.troopTabs} ${classes.genTabs}`}>
          {WIDGET_GENERATIONS.map(entry => {
            const held =
              consumableCount(inventory, entry.chestId) +
              entry.heroes.reduce((sum, h) => sum + consumableCount(inventory, h.widgetId), 0);
            return (
              <button
                key={entry.gen}
                type="button"
                className={`${classes.troopTab} ${
                  entry.gen === generation.gen ? classes.troopTabActive : ''
                }`}
                onClick={() => setGen(entry.gen)}
              >
                <WhiteoutItemIcon src={widgetChestIcon(entry.gen)} />
                Gen {entry.gen}
                {held > 0 && <em className={classes.widgetBadge}>{formatFull(held)}</em>}
              </button>
            );
          })}
        </div>
        <div className={classes.itemGrid}>
          {f(
            generation.chestId,
            'Custom Hero Widget Chest',
            `gen ${generation.gen}`,
            `One widget for ${generation.heroes.map(h => h.name).join(', ')}.`
          )}
        </div>

        {generation.heroes.map(hero => {
          const plan = widgetPlanFor(inventory, hero.widgetId);
          return (
            <div key={hero.widgetId} className={classes.widgetHero}>
              {/* The portrait is the fast way to tell whose row this is. It
                  sits outside the field grid so the fields keep their own
                  column widths whether or not the art exists. */}
              <WhiteoutHeroPortrait name={hero.name} />
              <div className={classes.widgetHeroFields}>
              <div className={classes.itemGrid}>
                {f(
                  hero.widgetId,
                  `${hero.name} Widget`,
                  'hero only',
                  `Only fits ${hero.name}\u2019s exclusive gear.`
                )}
                <label className={classes.field}>
                  <span className={classes.fieldLabel}>
                    {hero.name} widget level
                    <em className={classes.fieldHint}>0 to {WIDGET_MAX_LEVEL}</em>
                  </span>
                  <select
                    className={classes.input}
                    value={plan.level}
                    onChange={e =>
                      onChange(withWidgetLevel(inventory, hero.widgetId, Number(e.target.value)))
                    }
                  >
                    {/* No cost in the label: it does not fit the closed select,
                        and the line underneath states it properly. */}
                    {Array.from({ length: WIDGET_MAX_LEVEL + 1 }, (_, i) => (
                      <option key={i} value={i}>
                        Lv {i}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className={classes.cardNote}>
                {plan.level >= WIDGET_MAX_LEVEL ? (
                  <>Maxed. Widgets held for {hero.name} have nowhere to go.</>
                ) : (
                  <>
                    Lv {plan.level} to {plan.level + 1} costs{' '}
                    <strong>{formatFull(plan.nextCost)}</strong> widgets. {hero.name} can draw on{' '}
                    {formatFull(plan.available)} (gen {generation.gen} chests plus their own).{' '}
                    {plan.canUpgrade ? (
                      <>
                        That is <strong>{plan.levelsAffordable} level
                        {plan.levelsAffordable === 1 ? '' : 's'}</strong>, up to Lv {plan.toLevel}.
                      </>
                    ) : (
                      <>
                        <strong>{formatFull(plan.shortBy)} short</strong>, so none of them buy
                        anything yet.
                      </>
                    )}{' '}
                    {formatFull(plan.toMax)} to reach Lv {WIDGET_MAX_LEVEL}.
                  </>
                )}
              </p>
              </div>
            </div>
          );
        })}
      </div>
  );
};
