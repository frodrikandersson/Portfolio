import { useState } from 'react';
import {
  whiteoutResearch,
  RESEARCH_TREES,
  type ResearchTree,
  type ResearchNode,
} from '../../data/whiteoutResearch';
import {
  researchLevel,
  withResearchLevel,
  withTreeFilled,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import { formatFull } from '../../utils/whiteoutFormat';
import { formatDuration } from '../../utils/whiteoutScoring';
import classes from './WhiteoutUpgradePlanner.module.css';
import { CollapsibleCard } from './CollapsibleCard';

interface ResearchTreeCardProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/** Nodes grouped into the rows the game draws them in, computed once. */
const ROWS: Record<ResearchTree, ResearchNode[][]> = Object.fromEntries(
  RESEARCH_TREES.map(tree => {
    const byRow = new Map<number, ResearchNode[]>();
    for (const node of whiteoutResearch) {
      if (node.tree !== tree) continue;
      byRow.set(node.row, [...(byRow.get(node.row) ?? []), node]);
    }
    return [tree, [...byRow.keys()].sort((a, b) => a - b).map(r => byRow.get(r)!)];
  })
) as Record<ResearchTree, ResearchNode[][]>;

const TREE_TOTALS = Object.fromEntries(
  RESEARCH_TREES.map(tree => [
    tree,
    whiteoutResearch
      .filter(n => n.tree === tree)
      .reduce((sum, n) => sum + n.levels.length, 0),
  ])
) as Record<ResearchTree, number>;

/**
 * The Research Center tree, laid out the way the game lays it out.
 *
 * THIS REPLACED THREE DROPDOWNS. The card used to ask which TIER of each tree
 * you had finished, which cannot describe a real account: a node has its own
 * number of levels, three on most of Growth and six on the later Battle ones,
 * and every account is part way through several at once. "Finished through
 * tier V" told the optimiser that every level of every tier V node was done,
 * and there was no way at all to say 2/6.
 *
 * Rows come from the data's own `row` field, which matches the in-game layout
 * exactly: Weapons Prep alone, then the three tactics nodes beside each other,
 * then the three formations, and so on down. So this is not a hand-drawn
 * picture of the tree that can drift from it, it is the tree.
 *
 * Click a node to add a level. The minus in its corner appears once it has
 * one, so the common action is the whole tile and the rare one is deliberate.
 */
export const ResearchTreeCard = ({ inventory, onChange }: ResearchTreeCardProps) => {
  const [open, setOpen] = useState<ResearchTree | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  const levelOf = (node: ResearchNode) => researchLevel(inventory, node.key);

  const bump = (node: ResearchNode, by: number) => () =>
    onChange(withResearchLevel(inventory, node.key, levelOf(node) + by));

  return (
    <CollapsibleCard id="research" title="Research" className={`${classes.buildingsCard}`}>
      <p className={classes.cardNote}>
        191 nodes and 720 levels. Click a node to add a level, and use the minus in its corner to
        take one back. Hover a node for what the next level costs. Everything you enter here is
        treated as done, and the planner works out what to research next from what is left.
      </p>

      {RESEARCH_TREES.map(tree => {
        const done = whiteoutResearch
          .filter(n => n.tree === tree)
          .reduce((sum, n) => sum + researchLevel(inventory, n.key), 0);
        const total = TREE_TOTALS[tree];
        const isOpen = open === tree;

        return (
          <div key={tree} className={classes.treeBlock}>
            <div className={classes.treeHeader}>
              <button
                type="button"
                className={classes.treeToggle}
                onClick={() => setOpen(isOpen ? null : tree)}
                aria-expanded={isOpen}
              >
                <span className={classes.treeCaret}>{isOpen ? '▾' : '▸'}</span>
                {tree}
                <span className={classes.fieldHint}>
                  {formatFull(done)} of {formatFull(total)} levels
                </span>
              </button>
              <span className={classes.treeActions}>
                {/* Whether the planner is allowed to spend on this tree at
                    all, which is a separate question from what is done. */}
                <label className={classes.toggle} title={`Let the planner research ${tree}`}>
                  <input
                    type="checkbox"
                    checked={inventory.researchTrees.includes(tree)}
                    onChange={e =>
                      onChange({
                        ...inventory,
                        researchTrees: e.target.checked
                          ? [...inventory.researchTrees, tree]
                          : inventory.researchTrees.filter(t => t !== tree),
                      })
                    }
                  />
                  <span className={classes.fieldHint}>Plan</span>
                </label>
                <button
                  type="button"
                  className={classes.linkButton}
                  onClick={() => onChange(withTreeFilled(inventory, tree, true))}
                >
                  All
                </button>
                <button
                  type="button"
                  className={classes.linkButton}
                  onClick={() => onChange(withTreeFilled(inventory, tree, false))}
                >
                  None
                </button>
              </span>
            </div>

            {isOpen && (
              <div className={classes.tree}>
                {ROWS[tree].map((row, i) => (
                  <div key={i} className={classes.treeRow}>
                    {row.map(node => {
                      const at = levelOf(node);
                      const max = node.levels.length;
                      const next = node.levels[at];
                      const full = at >= max;
                      return (
                        <div
                          key={node.key}
                          className={`${classes.treeNode} ${full ? classes.treeNodeFull : ''} ${at > 0 ? classes.treeNodeStarted : ''}`}
                        >
                          <button
                            type="button"
                            className={classes.treeNodeBody}
                            onClick={bump(node, 1)}
                            disabled={full}
                            onMouseEnter={() => setDetail(node.key)}
                            onMouseLeave={() => setDetail(null)}
                            title={
                              next
                                ? `${node.name} to Lv.${next.level}: ` +
                                  `${formatFull(next.cost.meat)} meat, ${formatFull(next.cost.wood)} wood, ` +
                                  `${formatFull(next.cost.coal)} coal, ${formatFull(next.cost.iron)} iron, ` +
                                  `${formatFull(next.cost.steel)} steel, ${formatDuration(next.seconds)}, ` +
                                  `+${formatFull(next.power)} power`
                                : `${node.name} is finished`
                            }
                          >
                            <span className={classes.treeNodeName}>{node.name}</span>
                            <span className={classes.treeNodeLevel}>
                              {full ? 'MAX' : `${at}/${max}`}
                            </span>
                          </button>
                          {at > 0 && (
                            <button
                              type="button"
                              className={classes.treeMinus}
                              onClick={bump(node, -1)}
                              aria-label={`Remove a level from ${node.name}`}
                              title={`Remove a level from ${node.name}`}
                            >
                              &minus;
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {detail && (
        <p className={classes.cardNote}>
          {(() => {
            const node = whiteoutResearch.find(n => n.key === detail);
            if (!node) return null;
            const at = researchLevel(inventory, node.key);
            const next = node.levels[at];
            if (!next) return `${node.name} is finished.`;
            return (
              `${node.name} Lv.${next.level}: ${formatDuration(next.seconds)}, ` +
              `${formatFull(next.cost.steel)} steel, +${formatFull(next.power)} power.`
            );
          })()}
        </p>
      )}
    </CollapsibleCard>
  );
};
