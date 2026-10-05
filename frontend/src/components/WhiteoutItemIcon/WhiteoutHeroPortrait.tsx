import { heroPortrait } from '../../data/whiteoutItemIcons';
import { WhiteoutArt } from './WhiteoutArt';

interface WhiteoutHeroPortraitProps {
  /** Hero name as the roster spells it. */
  name: string;
}

/**
 * The hero's art, beside the fields about their widget.
 *
 * Unlike the item icons this is NOT decorative: it is the only thing on the row
 * that says whose fields these are, so it keeps a real alt. The missing-file
 * handling lives in WhiteoutArt, which the building art shares.
 */
export const WhiteoutHeroPortrait = ({ name }: WhiteoutHeroPortraitProps) => (
  <WhiteoutArt src={heroPortrait(name)} alt={name} variant="portrait" />
);
