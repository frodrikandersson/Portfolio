import { WhiteoutArt } from '../WhiteoutItemIcon/WhiteoutArt';
import { expertPortrait } from '../../data/whiteoutItemIcons';
import { useState } from 'react';
import {
  whiteoutExperts,
  EXPERT_MAX_LEVEL,
  booksRemaining,
  learningMinutesRemaining,
  statusName,
  talentLevelForStatus,
  EXPERT_STATUSES,
  gatesReachable,
  gatesAssumed,
  nextGate,
  sigilsRemaining,
  affinityRemaining,
  STATUS_DEFENCE_PERCENT,
  statusIndex,
  type ExpertDefinition,
} from '../../data/whiteoutExperts';
import {
  expertProgress,
  withExpertProgress,
  expertSkillLevel,
  expertGaps,
  consumableCount,
  totalGiftAffinity,
  unspendableBooks,
  gatesPaidFor,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import { formatFull } from '../../utils/whiteoutFormat';
import { formatDuration } from '../../utils/whiteoutScoring';
import { ConsumableFields } from './ConsumableFields';
import { SigilSection } from './SigilSection';
import classes from './WhiteoutUpgradePlanner.module.css';
import { CollapsibleCard } from './CollapsibleCard';

interface ExpertsCardProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

const clamp = (value: number, max: number) =>
  Number.isFinite(value) ? Math.min(Math.max(Math.round(value), 0), max) : 0;

interface ExpertRowProps {
  expert: ExpertDefinition;
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

const ExpertRow = ({ expert, inventory, onChange }: ExpertRowProps) => {
  const [open, setOpen] = useState(false);
  const progress = expertProgress(inventory, expert.id);
  const level = Math.max(progress.affinityLevel, 0);
  const set = (patch: Parameters<typeof withExpertProgress>[2]) =>
    onChange(withExpertProgress(inventory, expert.id, patch));

  const paid = gatesPaidFor(inventory, expert.id);
  const gate = nextGate(expert, level, paid);
  // A gate is paid in that expert's own Sigils, but Common Sigils stand in for
  // any of them, so both count towards it.
  const sigilsOnHand =
    consumableCount(inventory, `sigil-${expert.id}`) +
    consumableCount(inventory, 'common-expert-sigil');

  return (
    <div className={classes.researchTree}>
      {/* The portrait, the tick box and the focus line read as one heading,
          so they share a row. The art is what makes an expert recognisable
          at a glance in a grid of ten near-identical cards. */}
      <div className={classes.expertHead}>
        <WhiteoutArt
          src={expertPortrait(expert.id)}
          alt={expert.name}
          variant="expert"
          reserve
        />
        <div className={classes.expertHeadText}>
          <label className={classes.toggle}>
            <input
              type="checkbox"
              checked={progress.unlocked}
              onChange={e =>
                set({
                  unlocked: e.target.checked,
                  // Recruiting puts an expert at Lv 1, so the unlock is no longer
                  // outstanding the moment the box is ticked.
                  affinityLevel: e.target.checked ? Math.max(level, 1) : 0,
                })
              }
            />
            <span className={classes.heroSkillName}>{expert.name}</span>
          </label>
          <p className={classes.expertFocus}>
            Gen {expert.generation} &middot; {expert.focus}
            {expert.estimated && <em className={classes.expertEstimated}> costs estimated</em>}
          </p>
        </div>
      </div>

      {progress.unlocked && (
        <>
          <label className={classes.inlineSelect}>
            <span>Relationship</span>
            <input
              className={classes.input}
              type="number"
              min={1}
              max={EXPERT_MAX_LEVEL}
              value={level || 1}
              onChange={e => {
                const next = Math.max(clamp(Number(e.target.value), EXPERT_MAX_LEVEL), 1);
                // Lowering the level has to pull the status down with it,
                // otherwise a typo leaves a status the level cannot support.
                set({
                  affinityLevel: next,
                  // Keep the status inside what the new level allows, at both
                  // ends: moving up to Lv 80 means the 70 gate is behind you.
                  gatesPaid: Math.min(
                    Math.max(paid, gatesAssumed(next)),
                    gatesReachable(next)
                  ),
                });
              }}
            />
          </label>
          {/*
            THE STATUS IS ITS OWN FACT, not floor(level / 10).
            Reaching Lv 70 does not make an expert Close 1: the gate at 70 is
            paid in sigils, and until it is they sit at Lv 70 AND Casual 3.
            Deriving one from the other had the planner offering skill levels
            that need a status the player had not bought yet.
          */}
          <label className={classes.inlineSelect}>
            <span>Status</span>
            <select
              value={paid}
              onChange={e => set({ gatesPaid: Number(e.target.value) })}
            >
              {/* Only the statuses this level can be in. Below a gate it is
                  one; standing on one it is two, which is the whole choice. */}
              {EXPERT_STATUSES.slice(gatesAssumed(level), gatesReachable(level) + 1).map(
                (name, i) => (
                  <option key={name} value={gatesAssumed(level) + i}>
                    {name}
                  </option>
                )
              )}
            </select>
          </label>
          <p className={classes.expertStatus}>
            <strong>{statusName(paid)}</strong>, so {expert.skills.find(s => s.isTalent)?.name} sits
            at Lv {talentLevelForStatus(paid)} and the status adds{' '}
            {STATUS_DEFENCE_PERCENT[statusIndex(paid)].toFixed(2)}% Troops&rsquo; Defense.
          </p>

          {gate ? (
            <p className={classes.cardNote}>
              Next gate at Lv {gate.atLevel}: {formatFull(gate.affinity)} affinity to get there,
              then <strong>{formatFull(gate.sigils)} Sigils</strong> to pass it. You hold{' '}
              {formatFull(sigilsOnHand)}
              {sigilsOnHand < gate.sigils && (
                <>
                  , <strong>{formatFull(gate.sigils - sigilsOnHand)} short</strong>
                </>
              )}
              .
            </p>
          ) : (
            <p className={classes.cardNote}>Intimate, the top of the track. Nothing left to pay.</p>
          )}

          <button type="button" className={classes.linkButton} onClick={() => setOpen(v => !v)}>
            {open ? 'Hide skills' : 'Skills'}
          </button>

          {open && (
            <div className={classes.expertSkills}>
              {expert.skills.map(skill => {
                const skillLevel = expertSkillLevel(inventory, expert.id, skill.id);
                // The talent is not bought: it follows the relationship level.
                if (skill.isTalent) {
                  return (
                    <p key={skill.id} className={classes.cardNote} title={skill.description}>
                      <strong>{skill.name}</strong> Lv {talentLevelForStatus(paid)} of{' '}
                      {skill.maxLevel}, a talent. It rises with the relationship rather than with
                      books, so it costs nothing to raise.
                    </p>
                  );
                }
                return (
                  <label key={skill.id} className={classes.inlineSelect} title={skill.description}>
                    <span>{skill.name}</span>
                    <select
                      value={skillLevel}
                      onChange={e =>
                        set({
                          skillLevels: {
                            ...progress.skillLevels,
                            [skill.id]: clamp(Number(e.target.value), skill.maxLevel),
                          },
                        })
                      }
                    >
                      {Array.from({ length: skill.maxLevel + 1 }, (_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? 'Not learnt' : `Lv ${i}`}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
              <p className={classes.cardNote}>
                {formatFull(
                  expert.skills.reduce(
                    (total, skill) =>
                      total + booksRemaining(skill, expertSkillLevel(inventory, expert.id, skill.id)),
                    0
                  )
                )}{' '}
                Books of Knowledge and{' '}
                {formatDuration(
                  expert.skills.reduce(
                    (total, skill) =>
                      total +
                      learningMinutesRemaining(
                        skill,
                        expertSkillLevel(inventory, expert.id, skill.id)
                      ),
                    0
                  ) * 60
                )}{' '}
                of learning left on {expert.name}.
              </p>
            </div>
          )}

          <p className={classes.cardNote}>
            {formatFull(affinityRemaining(expert, level))} affinity and{' '}
            {formatFull(sigilsRemaining(expert, paid))} Sigils to Intimate.
          </p>
        </>
      )}
    </div>
  );
};

/**
 * Expert progress, which is what decides whether the gifts, Sigils and Books in
 * the backpack have anywhere to go.
 *
 * Only unlocked experts are asked about in detail, because an expert the player
 * has not recruited cannot absorb anything, and a form that asked about a
 * hundred levels and fifty skill levels up front would never get filled in.
 */
export const ExpertsCard = ({ inventory, onChange }: ExpertsCardProps) => {
  const gaps = expertGaps(inventory);
  const affinityHeld = totalGiftAffinity(inventory);
  const affinityRoom = gaps.reduce((total, gap) => total + gap.affinity, 0);
  const bookRoom = gaps.reduce((total, gap) => total + gap.books, 0);
  const booksHeld = consumableCount(inventory, 'book-of-knowledge');
  const learning = gaps.reduce((total, gap) => total + gap.learningMinutes, 0);
  const wastedBooks = unspendableBooks(inventory);

  return (
    <CollapsibleCard id="experts" title="Experts" className={`${classes.buildingsCard}`}>
      <div className={`${classes.researchGrid} ${classes.expertGrid}`}>
        {whiteoutExperts.map(expert => (
          <ExpertRow key={expert.id} expert={expert} inventory={inventory} onChange={onChange} />
        ))}
      </div>

      {gaps.length > 0 && (
        <p className={classes.cardNote}>
          Across the {gaps.length} expert{gaps.length === 1 ? '' : 's'} you have, there is room for{' '}
          {formatFull(affinityRoom)} affinity and {formatFull(bookRoom)} Books of Knowledge, plus{' '}
          {formatDuration(learning * 60)} of learning time. You are holding{' '}
          {formatFull(affinityHeld)} affinity in gifts and {formatFull(booksHeld)} books.
          {wastedBooks > 0 && (
            <>
              {' '}
              <strong>
                {formatFull(wastedBooks)} of those books have nowhere to go, so an event scoring book
                spend will not pay out for them.
              </strong>
            </>
          )}
        </p>
      )}
      {gaps.length === 0 && (
        <p className={classes.cardNote}>
          Nothing ticked yet, so gifts, Sigils and Books of Knowledge in the backpack count as
          unspendable.
        </p>
      )}
    
      <ConsumableFields inventory={inventory} onChange={onChange} group="expert" heading />

      <SigilSection inventory={inventory} onChange={onChange} />
    </CollapsibleCard>
  );
};
