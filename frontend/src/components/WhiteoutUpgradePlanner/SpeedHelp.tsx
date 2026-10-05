import type { ReactNode } from 'react';
import {
  researchTreeSpeed,
  researchTreeSpeedMax,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import { HelpPopover } from './HelpPopover';
import classes from './WhiteoutUpgradePlanner.module.css';

/** Percentages, without a trailing .00 on the round ones. */
const pct = (n: number) => `${n.toFixed(2).replace(/\.00$/, '')}%`;

/*
 * Spans rather than p, ul and li on purpose. The whole panel lives inside the
 * field's own <label>, which may only hold phrasing content, so the roles carry
 * the structure and the stylesheet draws the bullets.
 */
const Line = ({ children }: { children: ReactNode }) => (
  <span className={classes.helpLine}>{children}</span>
);

const List = ({ children }: { children: ReactNode }) => (
  <span className={classes.helpList} role="list">
    {children}
  </span>
);

const Item = ({ children }: { children: ReactNode }) => (
  <span className={classes.helpItem} role="listitem">
    {children}
  </span>
);

/** The sources to leave out, which is the half people get wrong. */
const Omit = ({ children }: { children: ReactNode }) => (
  <span className={classes.helpWarn}>{children}</span>
);

interface TreeLineProps {
  inventory: WhiteoutInventory;
  /** The research stat, as the node data spells it. */
  stat: string;
  /** The node family, as the game's tree labels it. */
  node: string;
}

/**
 * What the player's own research tree is contributing, read from their levels.
 *
 * The tree is the biggest single piece of every speed total and the most
 * tedious to add up: Tooling Up alone is seven node families spread down the
 * Growth tree, each with its own levels. The Tech Research card already holds
 * all of it, so this says the figure outright rather than asking anyone to go
 * and count.
 */
const TreeLine = ({ inventory, stat, node }: TreeLineProps) => {
  const have = researchTreeSpeed(inventory, stat);
  const max = researchTreeSpeedMax(stat);
  return (
    <Item>
      <strong>Research Center, Growth tree, {node}.</strong>{' '}
      {have > 0 ? (
        <>
          Your levels in the Tech Research card come to <strong>{pct(have)}</strong> of a possible{' '}
          {pct(max)}.
        </>
      ) : (
        <>
          No {node} levels are filled in on the Tech Research card yet. Fill them in and the
          figure appears here.
        </>
      )}
    </Item>
  );
};

/**
 * The question marks beside the three speed percentage fields.
 *
 * Each field asks for a number the game adds up nowhere, and some sources have
 * to be left out because this form collects them separately. That is too much
 * for a hint and it is what turned this card into a wall of text, so it lives
 * behind a button instead.
 */
export const ConstructionSpeedHelp = ({ inventory }: { inventory: WhiteoutInventory }) => (
  <HelpPopover label="Construction speed buff">
    <Line>Add these up and type the total.</Line>
    <List>
      <TreeLine inventory={inventory} stat="construction-speed" node="Tooling Up" />
      <Item>
        <strong>Alliance, Technology, Adaptive Tools.</strong> 5% once it is fully researched.
      </Item>
      <Item>
        <strong>VIP</strong>, from VIP 4 up. The benefits list on the VIP screen prints your
        level&rsquo;s figure, and it counts only while VIP Time is running.
      </Item>
      <Item>
        <strong>Zinman, Bastionist.</strong> Up to 15% at skill level 5. His build cost skill is
        asked for in the Heroes card, this one is not, so it belongs here.
      </Item>
      <Item>
        <strong>Daybreak Island decorations</strong>, and any state buff your alliance holds.
        Each tooltip prints its own figure.
      </Item>
    </List>
    <Omit>
      Leave out Double Time and the Cave Hyena&rsquo;s Builder&rsquo;s Aide. Both reach only what
      you start in the next five minutes, so they are not part of your standing speed, and both
      have their own tick box below.
    </Omit>
  </HelpPopover>
);

export const TrainingSpeedHelp = ({ inventory }: { inventory: WhiteoutInventory }) => (
  <HelpPopover label="Troop Training speed">
    <Line>Add these up and type the total.</Line>
    <List>
      <TreeLine inventory={inventory} stat="training-speed" node="Trainer Tools" />
      <Item>
        <strong>Military Camp level.</strong> Every upgrade carries a little training speed, and
        the camp&rsquo;s own screen prints the current figure.
      </Item>
      <Item>
        <strong>Alliance, Technology</strong>, the training speed node under Development.
      </Item>
      <Item>
        <strong>Daybreak Island decorations.</strong> The Ski Resort reaches 15% and the Barbecue
        Stand 5%.
      </Item>
    </List>
    <Omit>
      Leave out Ling Xue, the Chief Order Advanced Training and whichever state appointment you
      hold. All three are asked for separately, in the Heroes card and further down this one.
    </Omit>
  </HelpPopover>
);

export const ResearchSpeedHelp = ({ inventory }: { inventory: WhiteoutInventory }) => (
  <HelpPopover label="Research speed">
    <Line>Add these up and type the total.</Line>
    <List>
      <TreeLine inventory={inventory} stat="research-speed" node="Tool Enhancement" />
      <Item>
        <strong>Alliance, Technology</strong>, the research speed node. 5% at level 1, 8% once it
        is finished.
      </Item>
      <Item>
        <strong>Agnes, Project Management.</strong> +5% at Lv 5. Only the hours she takes off a
        build are read from the Experts card, so her research speed belongs in this total.
      </Item>
      <Item>
        <strong>Daybreak Island decorations.</strong> Only a few carry Research Speed, so it is
        worth reading each tooltip.
      </Item>
    </List>
    <Omit>
      Leave out Jasser and whichever state appointment you hold, both asked for separately.
    </Omit>
  </HelpPopover>
);
