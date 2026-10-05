export interface WhiteoutTool {
  id: string;
  tabId: string;
  tabTitle: string;
  componentName: string;
  title: string;
  blurb: string;
  icon: string;
  // Optional art under /public/whiteout/tools/. Tiles without one fall back to a
  // drawn frost placeholder, so a missing file never renders a broken image.
  image?: string;
  status: 'live' | 'planned';
}

export const whiteoutTools: WhiteoutTool[] = [
  {
    id: 'battle-sim',
    tabId: 'whiteout-battle-sim',
    tabTitle: 'BattleSimulator.tsx',
    componentName: 'WhiteoutBattleSimPage',
    title: 'Battle Simulator',
    blurb:
      'Line two rallies up and see how they actually trade. Troops, heroes, gear and every buff that quietly decides the fight before it starts.',
    icon: '\u2694\uFE0F',
    status: 'planned',
  },
  {
    id: 'calculator',
    tabId: 'whiteout-calculator',
    tabTitle: 'Calculator.tsx',
    componentName: 'WhiteoutCalculatorPage',
    title: 'Calculator',
    blurb:
      'Score a Hall of Chiefs run day by day, and see how much construction power your speedups and speed buff actually buy you.',
    icon: '\u{1F9EE}',
    status: 'live',
  },
  {
    id: 'wardrobe',
    tabId: 'whiteout-wardrobe',
    tabTitle: 'Wardrobe.tsx',
    componentName: 'WhiteoutWardrobePage',
    title: 'Wardrobe',
    blurb:
      'Every skin in one place: city, marching, avatar frames, nameplates, teleports, chat bubbles, chief profiles and name cards.',
    icon: '\u{1F9E5}',
    status: 'planned',
  },
];
