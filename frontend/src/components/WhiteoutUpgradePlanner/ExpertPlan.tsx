import { formatFull } from '../../utils/whiteoutFormat';
import type { ExpertPlan as Plan } from '../../utils/whiteoutExpertPlanner';
import type { SigilSpend } from '../../utils/whiteoutExpertGates';
import classes from './WhiteoutUpgradePlanner.module.css';

interface ExpertPlanProps {
  plan: Plan;
  sigils: SigilSpend;
  day: number | null;
}

const hm = (minutes: number) => {
  const m = Math.max(Math.round(minutes), 0);
  const days = Math.floor(m / 1440);
  const hours = Math.floor((m % 1440) / 60);
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  const mins = m % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/**
 * Which expert skills to raise, and where the Sigils can actually go.
 *
 * The engine always refused to score books an expert could not take, and
 * always counted each expert's Sigils only against the gates they had left.
 * None of that was visible: the only sign was a number quietly smaller than
 * the bag, which reads exactly like the bag being scored in full. This panel
 * is that working, shown.
 *
 * An expert event pays per book spent and per minute of learning speedup, not
 * per point of skill gained, so the plan is about fitting the bag into the room
 * the experts have, not about which skill is nicest to own.
 */
export const ExpertPlan = ({ plan, sigils, day }: ExpertPlanProps) => {

  return (
    <section className={classes.result}>
      <div className={classes.resultHeader}>
        <h3>Expert plan</h3>
        {plan.booksStranded > 0 && (
          <span className={classes.limitChip}>
            {formatFull(plan.booksStranded)} books have nowhere to go
          </span>
        )}
      </div>

      <dl className={classes.stats}>
        <div>
          <dt>Points</dt>
          <dd>{formatFull(Math.round(plan.points))}</dd>
        </div>
        <div>
          <dt>Books of Knowledge</dt>
          <dd>
            <span className={classes.spend}>{formatFull(plan.booksSpent)}</span> used,{' '}
            <span className={classes.left}>{formatFull(plan.booksLeft)}</span> left
          </dd>
        </div>
        <div>
          <dt>Skill levels</dt>
          <dd>{plan.steps.length}</dd>
        </div>
        <div>
          <dt>Learning speedups</dt>
          <dd>
            <span className={classes.spend}>{hm(plan.minutesSped)}</span> used,{' '}
            <span className={classes.left}>{hm(plan.minutesLeft)}</span> left
          </dd>
        </div>
        {day !== null && (
          <div>
            <dt>Spend on</dt>
            <dd>Day {day}</dd>
          </div>
        )}
      </dl>

      {plan.noExperts ? (
        <p className={classes.cardNote}>
          No experts are ticked on the Experts card, so Books of Knowledge and Expert Sigils have
          nowhere to go and score nothing. Tick the ones you have recruited and set their skill
          levels.
        </p>
      ) : plan.steps.length === 0 ? (
        <p className={classes.cardNote}>
          Nothing to raise. Either every unlocked skill is at its cap, or there are not enough
          Books of Knowledge for the next level of any of them.
        </p>
      ) : (
        <>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Expert</th>
                  <th>Skill</th>
                  <th>Level</th>
                  <th className={classes.num}>Books</th>
                  <th className={classes.num}>Learning</th>
                </tr>
              </thead>
              <tbody>
                {plan.steps.map(step => (
                  <tr key={`${step.expertId}-${step.skillId}-${step.fromLevel}`}>
                    <td>{step.expertName}</td>
                    <td>{step.skillName}</td>
                    <td>
                      Lv {step.fromLevel} &rarr; {step.fromLevel + 1}
                      {!step.capKnown && <em className={classes.fieldHint}> cap unknown</em>}
                    </td>
                    <td className={classes.num}>{formatFull(step.books)}</td>
                    <td className={classes.num}>{hm(step.learningMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {plan.minutesNeeded > plan.minutesSped && (
            <p className={classes.cardNote}>
              Those levels take <strong>{hm(plan.minutesNeeded)}</strong> of learning in all, and
              the speedups cover <strong>{hm(plan.minutesSped)}</strong>. The rest runs on its own
              time: the levels still happen, the uncovered minutes just score nothing.
            </p>
          )}
        </>
      )}

      {plan.steps.length > 0 && (
        <p className={classes.warnLine}>
          <strong>One gate is still unmodelled.</strong> A skill also needs the expert&rsquo;s{' '}
          <em>Total Expert Skill</em>, the sum of their four skill levels, to reach a threshold,
          and nothing publishes those thresholds. The relationship ceiling below IS enforced.
          {plan.steps.some(x => !x.capKnown) && (
            <>
              {' '}
              Rows marked <em>cap unknown</em> are skills nobody has recorded a relationship
              ceiling for, so those may also be blocked.
            </>
          )}
        </p>
      )}

      {sigils.perExpert.length > 0 && (
        <>
          <h4 className={classes.groupHeading}>Expert Sigils</h4>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Expert</th>
                  <th>At</th>
                  <th className={classes.num}>Own sigils</th>
                  <th className={classes.num}>Gates passed</th>
                  <th className={classes.num}>Next gate</th>
                  <th className={classes.num}>Short by</th>
                </tr>
              </thead>
              <tbody>
                {sigils.perExpert.map(row => (
                  <tr key={row.expert.id}>
                    <td>{row.expert.name}</td>
                    <td>Lv {row.level}</td>
                    <td className={classes.num}>
                      {formatFull(row.own)}
                      {row.redeemed > 0 && (
                        <em className={classes.fieldHint}> +{formatFull(row.redeemed)} redeemed</em>
                      )}
                    </td>
                    <td className={`${classes.num} ${row.gates > 0 ? classes.left : ''}`}>
                      {row.gates}
                    </td>
                    <td className={classes.num}>
                      {row.nextGateCost === null ? 'Intimate' : formatFull(row.nextGateCost)}
                    </td>
                    <td className={`${classes.num} ${row.short > 0 ? classes.spend : ''}`}>
                      {row.short > 0 ? formatFull(row.short) : '0'}
                      {row.unlocks && (
                        <em className={classes.fieldHint}> unlocks a skill</em>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={classes.cardNote}>
            A gate takes an <strong>exact</strong> number of that expert&rsquo;s own Sigils and no
            part payment, so sigils short of the next gate buy nothing and score nothing.
            {sigils.commonsRedeemed > 0 ? (
              <>
                {' '}
                <strong>
                  Redeem {formatFull(sigils.commonsRedeemed)} of your{' '}
                  {formatFull(sigils.commonsHeld)} Common Expert Sigils
                </strong>{' '}
                to finish the gates above: a Common redeems into any one expert, and the split
                here is the one that passes the most gates.
              </>
            ) : sigils.commonsHeld > 0 ? (
              <>
                {' '}
                Your {formatFull(sigils.commonsHeld)} Common Expert Sigils are not enough to finish
                any gate on their own.
              </>
            ) : null}
            {sigils.stranded > 0 && (
              <>
                {' '}
                <strong>{formatFull(sigils.stranded)}</strong> sigils cannot be spent at all: they
                belong to experts you have not recruited, or sit short of the next gate.
              </>
            )}
          </p>
        </>
      )}

    </section>
  );
};
