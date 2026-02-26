const ADJECTIVES = [
  'Swift',
  'Clever',
  'Bold',
  'Bright',
  'Quick',
  'Calm',
  'Wise',
  'Lucky',
  'Happy',
  'Brave',
  'Noble',
  'Keen',
  'Gentle',
  'Witty',
  'Jolly',
  'Merry',
  'Eager',
  'Lively',
  'Snappy',
  'Zesty',
];

const ANIMALS = [
  'Panda',
  'Fox',
  'Eagle',
  'Owl',
  'Wolf',
  'Bear',
  'Tiger',
  'Hawk',
  'Dolphin',
  'Falcon',
  'Otter',
  'Raven',
  'Lynx',
  'Badger',
  'Heron',
  'Moose',
  'Koala',
  'Puma',
  'Seal',
  'Crane',
];

/**
 * Generates a fun pseudonymous name like "SwiftPanda42"
 * Format: {Adjective}{Animal}{Number}
 */
export function generatePseudonym(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adjective}${animal}${number}`;
}
