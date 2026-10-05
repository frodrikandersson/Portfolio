// Working Overtime: two days, two rows, nothing else.
//
// The smallest event in the project by a distance. Speedups poured into
// construction or research, one point a minute, and that is the whole table.
// Nothing else scores: not training speedups, not learning, not the power the
// work produces.
//
// SOURCING, AND IT IS WEAKER THAN THE REST OF THIS FOLDER. Transcribed from
// whiteoutdata.com and mobi.gg, which agree with each other, rather than read
// off the game. Both describe the two rows as the complete list, and the event
// being this small makes that believable, but believable is not verified. The
// Hall of Chiefs table came from a community source too and turned out to be
// understating two of its rows by factors of 500 and 1,000.
//
// So: usable, and the first thing to check against the in-game Tips popup when
// this event next comes round.

import type { PointsEvent } from '../models/whiteoutInterface';

export const workingOvertime: PointsEvent = {
  id: 'working-overtime',
  name: 'Working Overtime',
  season: '2 days, one stage',
  source: 'community',
  sourceLabel: 'whiteoutdata.com and mobi.gg, which agree',
  sourceUrl: 'https://www.whiteoutsurvival.wiki/events/working-overtime-2/',
  dailyMilestones: {
    perDay: 4,
    // The two ends are published; the two in between are not, so they are left
    // out rather than guessed at a plausible-looking curve.
    points: null,
    note:
      'The published figures are only the ends of the track: the first target is 10 points and ' +
      'the last is 1,180. How many sit between them, and where, is not published, so nothing is ' +
      'planned against them. At one point a minute the top target is about 20 hours of speedups.',
  },
  caveats: [
    'Community-sourced and not yet checked against the game. Two sites give the same two rows and both call it the complete list, which is plausible for an event this small, but the Hall of Chiefs table came from a community source too and was wrong by a factor of 500 on one row.',
    'Only construction and research speedups score. Training and learning speedups pay nothing here, so the General pile is only worth pointing at one of the two that count.',
    'There is an Honor Ranking for the top 100, as with the other short events, but its point thresholds are not published.',
  ],
  days: [
    {
      day: 1,
      label: 'Every task, both days',
      groups: [
        {
          id: 'speedups',
          label: 'Speedups',
          note: 'Points per minute. Only these two pools count.',
          rows: [
            { id: 'construction-speedups-1-minute', label: 'Use 1m of Speedups for Construction', pointsPerUnit: 1 },
            { id: 'research-speedups-1-minute', label: 'Use 1m of Speedups for Research', pointsPerUnit: 1 },
          ],
        },
      ],
    },
  ],
};
