import { WhiteoutComingSoon } from '../WhiteoutComingSoon/WhiteoutComingSoon';

export const WhiteoutBattleSim = () => {
  return (
    <WhiteoutComingSoon
      title="Battle Simulator"
      blurb="Line two rallies up and see how they actually trade, with every buff that quietly decides the fight before it starts."
      planned={[
        'Full rally simulation: both sides, troop by troop',
        'Heroes, hero gear, pets and expedition skills',
        'Research, chief gear and charms',
        'Expert buffs, presidential skills and fortress bonuses',
        'Save your setup as a named preset and compare loadouts side by side',
      ]}
    />
  );
};
