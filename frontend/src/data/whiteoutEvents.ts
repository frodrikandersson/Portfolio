// Catalogue of every event listed on whiteoutsurvival.wiki.
//
// 20 events, scraped from the rendered events index, less the ones with no
// spending table to transcribe. This is the pick list for the
// calculator. `eventId` is set only where a scoring table has actually been
// transcribed into this project; everything else is listed so it can be chosen and
// so it is obvious what is still missing.
//
// To add a table: build a PointsEvent (see whiteoutHallOfChiefs.ts), export it, and
// set `eventId` here to its id.

export interface WhiteoutEventListing {
  slug: string;
  name: string;
  wikiUrl: string;
  /** Id of a transcribed PointsEvent, or null when no table exists yet. */
  eventId: string | null;
}

export const whiteoutEvents: WhiteoutEventListing[] = [
  // Holiday events are not on the wiki index, but they are the main points events.
  { slug: 'holiday-event', name: 'Holiday Event', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/', eventId: 'holiday-event' },
  { slug: 'alliance-showdown', name: 'Alliance Showdown', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/alliance-showdown/', eventId: null },
  // Two runs with different task lists, so two rows. One row would have to pick
  // a side and would score the other run wrong without saying so.
  { slug: 'armament-competition', name: 'Armament Competition (Design Plan)', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/armament-competition/', eventId: 'armament-competition' },
  { slug: 'armament-competition-fire-crystal', name: 'Armament Competition (Fire Crystal)', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/armament-competition/', eventId: 'armament-competition-fire-crystal' },
  { slug: 'city-development', name: 'City Development', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/city-development/', eventId: null },
  { slug: 'defeat-nearby-beasts', name: 'Defeat Nearby Beasts', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/defeat-nearby-beasts/', eventId: null },
  { slug: 'frostdragon-tyrant', name: 'Frostdragon Tyrant', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/frostdragon-tyrant/', eventId: null },
  { slug: 'grow-your-heroes', name: 'Grow Your Heroes', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/grow-your-heroes/', eventId: null },
  { slug: 'hall-of-chief', name: 'Hall of Chief', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/hall-of-chief/', eventId: 'hall-of-chiefs' },
  { slug: 'hall-of-heroes', name: 'Hall of Heroes', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/hall-of-heroes/', eventId: null },
  { slug: 'hero-rally', name: 'Hero Rally', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/hero-rally/', eventId: null },
  { slug: 'king-of-icefield', name: 'King of Icefield', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/king-of-icefield/', eventId: 'king-of-icefield' },
  { slug: 'officer-project', name: 'Officer Project (Essence Stone)', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/officer-project/', eventId: 'officer-project-essence-stone' },
  { slug: 'officer-project-charm-design', name: 'Officer Project (Charm Design)', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/officer-project/', eventId: 'officer-project-charm-design' },
  { slug: 'plan-your-city', name: 'Plan your City', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/plan-your-city/', eventId: null },
  { slug: 'power-up', name: 'Power Up', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/power-up/', eventId: null },
  { slug: 'stand-of-arms', name: 'Stand of Arms', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/stand-of-arms/', eventId: null },
  { slug: 'svs-state-of-power', name: 'SVS State Of Power', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/svs-state-of-power/', eventId: 'svs-state-of-power' },
  { slug: 'trusted-chief', name: 'Trusted Chief', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/trusted-chief/', eventId: null },
  { slug: 'war-preparation', name: 'War Preparation', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/war-preparation/', eventId: null },
  { slug: 'working-overtime-2', name: 'Working Overtime', wikiUrl: 'https://www.whiteoutsurvival.wiki/events/working-overtime-2/', eventId: 'working-overtime' },
];
