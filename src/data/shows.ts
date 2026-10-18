import type { Show, Episode, Season, Act } from '../types';
import { episodeKey, seasonKey } from '../types';

// Young Sheldon episode titles (verified where possible; unverified use Episode N)
const youngSheldonTitles: Record<string, string[]> = {
  '1': [
    'Pilot',
    'Rockets, Communists, and the Dewey Decimal System',
    'Patents, Trademarks, and the Practice of Personal Hygiene',
    'A Therapist, a Comic Book, and a Breakfast Sausage',
    'A Solar Calculator, a Game Ball, and a Cheerleader\'s Bosom',
    'A Dog, a Squirrel, and a Fish Named Fish',
    'A Brisket, Voodoo, and a Cannonball',
    'Cape Canaveral, Schrödinger\'s Cat, and Cyndi Lauper\'s Hair',
    'Spock, Kirk, and Testicular Hernia',
    'An Eagle Feather, a String Bean, and an Eskimo',
    'Demons, Sunday School, and Prime Numbers',
    'A Computer, a Plastic Pony, and a Case of Beer',
    'A Sneeze, Detention, and Sissy Spacek',
    'Potato Salad, a Broomstick, and Dad\'s Whiskey',
    'Dolores, a Fox, and a Whistle',
    'Killer Asteroids, Oklahoma, and a Frizzy Hair Machine',
    'Jiu-Jitsu, Bubble Wrap, and Yoo-Hoo',
    'A Mother, a Child, and a Blue Man\'s Backside',
    'Gluons, Guacamole, and the Color Purple',
    'A Dog, a Squirrel, and a Fish Named Fish',
    'Summer Sausage, a Pocket Poncho, and Tony Danza',
    'Vanilla Ice Cream, Gentlemen Callers, and a Dinette Set',
  ],
  '2': [
    'A High-Pitched Buzz and Training Wheels',
    'A Rival Prodigy and Sir Isaac Neutron',
    'A Crisis of Faith and Octopus Aliens',
    'A Financial Secret and Fish Sauce',
    'A Research Study and Czechoslovakian Wedding Pastries',
    'Seven Deadly Sins and a Small Carl Sagan',
    'Carbon Dating and a Stuffed Raccoon',
    'An 8-Bit Princess and a Flat Tire Genius',
    'Family Dynamics and a Red Fiero',
    'A Stunted Childhood and a Can of Fancy Mixed Nuts',
    'A Race of Superhumans and a Letter to Albany',
    'A Tummy Ache and a Whale of a Metaphor',
    'A Nuclear Reactor and a Boy Called Lucky',
    'David, Goliath, and a Yoo-Hoo from the Backseat',
    'A Math Emergency and Perky Palms',
    'A Loaf of Bread and a Grand Old Flag',
    'Albert Einstein and the Story of Another Mary',
    'A Perfect Score and a Bunsen Burner Marshmallow',
    'A Political Campaign and a Candy Land Cheater',
    'A Proposal and a Popsicle Stick Cross',
    'A Broken Heart and a Crock Monster',
    'A Swedish Science Thing and the Equation for Toast',
  ],
  '3': [
    'Quirky Eggheads and Texas Snow Globes',
    'A Broom Closet and Satan\'s Plan for World Domination',
    'An Entrepreneurialist and a Swat on the Bottom',
    'Hobbitses, Physicses and a Ball with Zip',
    'A Pineapple and the Bosom of Male Friendship',
    'A Parasol and a Hell of an Arm',
    'Pongo Pygmaeus and a Culture that Encourages Spitting',
    'The Sin of Greed and a Chimichanga from Chi-Chi\'s',
    'Party Planning and a Seven-Course Meal',
    'Teenager Soup and a Little Ball of Fib',
    'A Live Chicken, a Fried Chicken and Holy Matrimony',
    'Body Glitter and a Mall Safety Kit',
    'Contracts, Rules and a Little Bit of Pig Brains',
    'A Slump, a Cross and Roadside Gravel',
    'A Boyfriend\'s Ex-Wife and a Good Luck Head Rub',
    'Pasadena',
    'An Academic Crime and a More Romantic Taco Bell',
    'A Couple Bruised Ribs and a Cereal Box Ghost Detector',
    'Contracts, Rules and a Little Bit of Pig Brains',
    'A Baby Tooth and the Egyptian God of Knowledge',
    'A Secret Letter and a Lowly Disc of Processed Meat',
  ],
  '4': [
    'Graduation',
    'A Docent, a Little Lady and a Bouncer Named Dalton',
    'Training Wheels and an Unleashed Chicken',
    'Bible Camp and a Chariot of Love',
    'A Musty Crypt and a Stick to Pee On',
    'Freshman Orientation and the Inventor of the Zipper',
    'A Philosophy Class and Worms That Can Chase You',
    'An Existential Crisis and a Bear That Makes Bubbles',
    'Crappy Frozen Ice Cream and an Organ Grinder\'s Monkey',
    'Cowboy Aerobics and 470 Greed',
    'A Pager, a Club and a Cranky Bag of Wrinkles',
    'A Box of Treasure and the Meemaw of Science',
    'The Geezer Bus and a New Model for Education',
    'Mitch\'s Son and the Unconditional Approval of a Government Agency',
    'A Virus, Heartbreak and a World of Possibilities',
    'A Second Prodigy and the Hottest Tips for Pouty Lips',
    'A Black Hole',
    'A Stuffed Teddy Bear and a Winner Drink',
  ],
  '5': [
    'One Bad Night and Chaos of Selfish Desires',
    'Snoopin\' Around and the Wonder Twins of Atheism',
    'Potential Energy and Hooch on a Park Bench',
    'Pish Posh and a Secret Back Room',
    'Stuffed Animals and a Sweet Southern Syzygy',
    'Money Laundering and a Cascade of Hormones',
    'An Introduction to Engineering and a Glob of Hair Gel',
    'The Grand Chancellor and a Den of Sin',
    'The Yips and an Oddly Hypnotic Bohemian',
    'An Expensive Glitch and a Goof-Off Room',
    'A Lock-In, a Weather Girl and a Disgusting Habit',
    'A Pink Cadillac and a Glorious Tribal Dance',
    'A Lot of Band-Aids and the Cooper Surrender',
    'A Free Scratcher and Feminine Wiles',
    'A Lobster, an Armadillo and a Way Bigger Number',
    'A Suitcase Full of Cash and a Yellow Clown Car',
    'An Italian Scrambler, a Ceiling Painting and a Mascot Named Steve',
    'Babies, Lies and a Resplendent Cannoli',
    'A God-Fearin\' Baptist and a Hot Trophy Husband',
    'Uncle Sheldon and a Hormonal Firecracker',
    'White Trash, Holy Rollers and Punching People',
    'A Clogged Pore, a Little Spanish and the Future',
  ],
  '6': [
    'Four Hundred Cartons of Undeclared Cigarettes and a Niblingo',
    'Future Worf and the First Far of Space',
    'Passion\'s Harvest and a Sheldocracy',
    'Blonde Ambition and the Concept of Zero',
    'A Resident Advisor and the Riviera of the South',
    'An Ugly Car, an Affair and Some Kickass Football',
    'A Tougher Nut and a Note on File',
    'Legalese and a Whole Hoo-Ha',
    'College Dropouts and the Medford Miracle',
    'Pancake Sunday and Textbook Flirting',
    'Ruthless, Toothless and a Week of Bed Rest',
    'A Baby Shower and a Testosterone-Rich Banter',
    'A Frat Party, a Sleepover and the Mother of All Blisters',
    'A Launch Party and a Whole Human Being',
    'Teen Angst and a Smart-Boy Walk of Shame',
    'A Stolen Truck and Going on the Lam',
    'A Roman God and a Legend of a Woman\'s Mind',
    'Little Green Men and a Fella\'s Marriage Proposal',
    'A New Weather Girl and a Stay-at-Home Coddler',
    'German for Beginners and a Crazy Old Man with a Bat',
    'A Solo Peanut, a Secret and a Sniff Test',
    'A Tornado, a 10-Hour Flight and a Great Big Dinosaur',
  ],
  '7': [
    'Half a Wiener Schnitzel and Underwear in a Tree',
    'A Roulette Wheel and a Piano Playing Dog',
    'A Strudel and a Hot American Boy Toy',
    'Ants on a Log and a Cheating Winker',
    'A Dog House, a Beaurocrats and a Favorite Lyric',
    'Baptists, Catholics, and an Attempted Drowning',
    'A Proper Wedding and Skeletons in the Closet',
    'Geology, a Facelift and a Squirrel',
    'Murder at the Ponderosa',
    'A Little Snip and Standing Up for Yourself',
    'Little Lambs and a Daddy\'s Girl',
    'A Frankenstein\'s Monster and a Crib Full of Rattlesnakes',
    'Wine, Whiskey and a Goat',
    'A Final Goodbye and an Igloo Boy',
  ],
};

const familyAlbumTitles = [
  '46 Linden Street',
  'The Blind Date',
  'The Executioner\'s Song',
  'A Piece of Cake',
  'The Right Chemistry',
  'A Piece of the Action',
  'Man\'s Best Friend',
  'A Place of Our Own',
  'You\'re Tops',
  'Guess Who\'s Coming?',
  'It\'s Up to You',
  'You\'re My Hero',
  'A Real Stewart',
  'Making a Difference',
  'Second Honeymoon',
  'Thanksgiving',
  'The New Boss',
  'Making Promises',
  'The Game',
  'Career Choices',
  'The Community Center',
  'The Morning After',
  'The Community of Nations',
  'Parting Friends',
  'The Real World',
  'Blending Generations',
];

const youngSheldonEpisodes: number[] = [22, 22, 21, 18, 22, 22, 14];

function buildYoungSheldon(): { show: Show; episodes: Episode[] } {
  const showId = 'young-sheldon';
  const seasons: Season[] = [];
  const episodes: Episode[] = [];

  youngSheldonEpisodes.forEach((count, idx) => {
    const sn = idx + 1;
    const seasonId = seasonKey(showId, sn);
    const episodeIds: string[] = [];
    for (let ep = 1; ep <= count; ep++) {
      const epId = episodeKey(showId, sn, ep);
      episodeIds.push(epId);
      const titles = youngSheldonTitles[String(sn)];
      const title = titles && titles[ep - 1] ? titles[ep - 1] : `Episode ${String(ep).padStart(2, '0')}`;
      episodes.push({
        id: epId,
        showId,
        seasonId,
        seasonNumber: sn,
        episodeNumber: ep,
        title,
        watched: false,
        watchedAt: null,
        trainingStatus: 'not_started',
      });
    }
    seasons.push({
      id: seasonId,
      showId,
      seasonNumber: sn,
      episodeCount: count,
      episodeIds,
    });
  });

  const show: Show = {
    id: showId,
    title: 'Young Sheldon',
    chineseTitle: '小谢尔顿',
    totalEpisodes: 141,
    seasons,
    lastWatchedEpisodeId: null,
    useActs: false,
    trainingFocus: 'listening',
  };
  return { show, episodes };
}

function buildFamilyAlbum(): { show: Show; episodes: Episode[] } {
  const showId = 'family-album-usa';
  const seasonId = seasonKey(showId, 1);
  const episodeIds: string[] = [];
  const episodes: Episode[] = [];

  for (let ep = 1; ep <= 26; ep++) {
    const epId = episodeKey(showId, 1, ep);
    episodeIds.push(epId);
    const title = familyAlbumTitles[ep - 1] || `Episode ${String(ep).padStart(2, '0')}`;
    const acts: Act[] = [1, 2, 3].map((n) => ({
      id: `${epId}-act${n}`,
      actNumber: n,
      watched: false,
    }));
    episodes.push({
      id: epId,
      showId,
      seasonId,
      seasonNumber: 1,
      episodeNumber: ep,
      title,
      watched: false,
      watchedAt: null,
      acts,
      trainingStatus: 'not_started',
    });
  }

  const season: Season = {
    id: seasonId,
    showId,
    seasonNumber: 1,
    episodeCount: 26,
    episodeIds,
  };

  const show: Show = {
    id: showId,
    title: 'Family Album, USA',
    chineseTitle: '走遍美国',
    totalEpisodes: 26,
    seasons: [season],
    lastWatchedEpisodeId: null,
    useActs: true,
    trainingFocus: 'speaking',
  };
  return { show, episodes };
}

export function createInitialData() {
  const ys = buildYoungSheldon();
  const fa = buildFamilyAlbum();
  const shows = [ys.show, fa.show];
  const episodes: Record<string, Episode> = {};
  [...ys.episodes, ...fa.episodes].forEach((e) => {
    episodes[e.id] = e;
  });
  return { shows, episodes };
}

export interface CustomShowInput {
  id: string;
  title: string;
  chineseTitle: string;
  seasonEpisodeCounts: number[]; // e.g. [22, 22, 21]
  useActs?: boolean;
  trainingFocus?: 'listening' | 'speaking';
}

export function buildCustomShow(input: CustomShowInput): { show: Show; episodes: Episode[] } {
  const showId = input.id;
  const seasons: Season[] = [];
  const episodes: Episode[] = [];
  const totalEpisodes = input.seasonEpisodeCounts.reduce((a, b) => a + b, 0);

  input.seasonEpisodeCounts.forEach((count, idx) => {
    const sn = idx + 1;
    const seasonId = seasonKey(showId, sn);
    const episodeIds: string[] = [];
    for (let ep = 1; ep <= count; ep++) {
      const epId = episodeKey(showId, sn, ep);
      episodeIds.push(epId);
      const base: Episode = {
        id: epId,
        showId,
        seasonId,
        seasonNumber: sn,
        episodeNumber: ep,
        title: `Episode ${String(ep).padStart(2, '0')}`,
        watched: false,
        watchedAt: null,
        trainingStatus: 'not_started',
      };
      if (input.useActs) {
        base.acts = [1, 2, 3].map((n) => ({
          id: `${epId}-act${n}`,
          actNumber: n,
          watched: false,
        }));
      }
      episodes.push(base);
    }
    seasons.push({
      id: seasonId,
      showId,
      seasonNumber: sn,
      episodeCount: count,
      episodeIds,
    });
  });

  const show: Show = {
    id: showId,
    title: input.title,
    chineseTitle: input.chineseTitle || input.title,
    totalEpisodes,
    seasons,
    lastWatchedEpisodeId: null,
    useActs: input.useActs || false,
    trainingFocus: input.trainingFocus || 'listening',
  };
  return { show, episodes };
}

// Generate a URL-safe slug from a title
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || `show-${Date.now()}`;
}
