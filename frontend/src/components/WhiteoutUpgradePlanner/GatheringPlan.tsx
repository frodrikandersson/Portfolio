import { GATHER_RESOURCES, GATHER_TILE_NAMES } from '../../data/whiteoutGatherTiles';
import type { GatherPlan } from '../../utils/whiteoutGathering';
import { formatFull } from '../../utils/whiteoutFormat';
import classes from './WhiteoutUpgradePlanner.module.css';

interface GatheringPlanProps {
  gathering: GatherPlan;
  /** Points per unit for each resource on the day being scored. */
  perUnit: Record<string, number>;
}

/** Minutes from reset as a clock time, marking the ones sent the day before. */
const clock = (minutes: number) => {
  const t = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const time = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  return minutes < 0 ? `${time} (day before)` : time;
};

const hm = (minutes: number) => {
  const m = Math.max(Math.round(minutes), 0);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
};

/**
 * The gathering day, march by march.
 *
 * The send times are the point of this: resources are credited when a march
 * gets home, not when it leaves, so every queue wants to be in flight at reset
 * and landing just after. Those first sends happen the evening before, which is
 * the part that is easy to miss and impossible to recover.
 */
export const GatheringPlan = ({ gathering, perUnit }: GatheringPlanProps) => {
  const preSent = gathering.trips.filter(t => t.preSent);
  const instant = gathering.trips.filter(t => t.instant);
  const recallAtEnd = gathering.trips.filter(t => t.recalledEarly && !t.preSent);
  const points = GATHER_RESOURCES.reduce(
    (sum, r) => sum + gathering.totals[r] * (perUnit[r] ?? 0),
    0
  );

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Gathering plan</h3>
        <span className={classes.limitChip}>{gathering.trips.length} marches</span>
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Points</dt>
          <dd>{formatFull(points)}</dd>
        </div>
        <div>
          <dt>Gathering</dt>
          <dd>{hm(gathering.gatheringMinutes)}</dd>
        </div>
        <div>
          <dt>Lost to travel</dt>
          <dd>{hm(gathering.travelMinutes)}</dd>
        </div>
        <div>
          <dt>Runs per queue</dt>
          <dd>{gathering.tripsPerQueue}</dd>
        </div>
      </dl>

      {gathering.burdenBearerAt.length > 0 && gathering.burdenBearerAt[0] < 0 && (
        <p className={classes.cardNote}>
          <strong>Press Burden Bearer at {clock(gathering.burdenBearerAt[0])}</strong>, once every
          march above is sitting on its tile. Nothing is arriving, so no charge is spent, but the
          cooldown starts: {hm(-gathering.burdenBearerAt[0])} of it is gone before the day opens,
          and that is what decides whether the second charge lands in time to be used.
        </p>
      )}

      {gathering.instantGathers > 0 && (
        <>
          <p className={classes.cardNote}>
            Burden Bearer finishes <strong>{gathering.instantGathers}</strong> run
            {gathering.instantGathers === 1 ? '' : 's'} the moment the march lands, worth{' '}
            {formatFull(Math.round(gathering.instantAmount))} gathered for the price of the walk.
            {gathering.chargesUnused > 0 && (
              <>
                {' '}
                {gathering.chargesUnused} charge
                {gathering.chargesUnused === 1 ? '' : 's'} came up too late in the day to spend.
              </>
            )}
          </p>
          {/* The times matter more than the count: the skill fires on whichever
              march lands next, so the player needs to know which arrival they
              are arming it for. */}
          <ul className={classes.usage}>
            {instant.map(t => (
              <li key={`instant-${t.queue}-${t.returnsAt}`}>
                <span>
                  Queue {t.queue + 1} lands at {t.spotLabel}
                </span>
                <span className={classes.num}>
                  {/* An instant run is travel out then straight back with
                      nothing in between, so the halfway point IS the arrival,
                      which is the moment the skill has to be armed for. */}
                  arrives {clock(t.sentAt + (t.returnsAt - t.sentAt) / 2)}, home{' '}
                  {clock(t.returnsAt)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className={classes.cardNote}>
        <strong>Send these the evening before.</strong> Resources count when a march reaches your
        city, not when it sets off, so a march landing just after reset puts a whole load into the
        day having spent none of it.
      </p>

      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Queue</th>
              <th>Send at</th>
              <th>Working</th>
              <th className={classes.num}>Gathers</th>
              <th>Home</th>
            </tr>
          </thead>
          <tbody>
            {preSent.map(t => (
              <tr key={`pre-${t.queue}`}>
                <td>{t.queue + 1}</td>
                <td>{clock(t.sentAt)}</td>
                <td>{t.spotLabel}</td>
                <td className={classes.num}>{hm(t.gatherMinutes)}</td>
                <td>{clock(t.returnsAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={classes.cardNote}>
        After those land, re-send each queue the moment it gets home. The last run of the day is
        worth starting even if it cannot fill: a march can be recalled early and keeps whatever it
        has gathered, so the tail of the day is not wasted.
      </p>

      {/* Those last runs do not come home by themselves. A tile march would sit
          there until the tile ran dry and a node march until the node fell, and
          either way the resources do not count until the troops are in the
          city, so the recall is an action the player has to take. */}
      {recallAtEnd.length > 0 && (
        <p className={classes.cardNote}>
          <strong>Recall manually just before reset.</strong> {recallAtEnd.length} march
          {recallAtEnd.length === 1 ? '' : 'es'} will still be out, carrying{' '}
          {formatFull(Math.round(recallAtEnd.reduce((sum, t) => sum + t.amount, 0)))} between them.
          Nothing counts until it is home, so send them back rather than letting the day end on
          them.
        </p>
      )}

      <ul className={classes.usage}>
        {GATHER_RESOURCES.filter(r => gathering.totals[r] > 0).map(r => (
          <li key={r}>
            <span>{GATHER_TILE_NAMES[r]}</span>
            <span className={classes.num}>
              {formatFull(gathering.totals[r])} gathered,{' '}
              {formatFull(gathering.totals[r] * (perUnit[r] ?? 0))} pts
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
