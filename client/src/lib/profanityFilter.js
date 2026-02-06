/**
 * Profanity Filter Utility
 * Checks user input for foul/inappropriate language and blocks submission.
 *
 * - Catches exact words, common letter substitutions (l33tspeak), and
 *   repeated-character tricks (e.g. "fuuuck").
 * - Case-insensitive.
 * - Returns { clean: boolean, word?: string } so callers can show a message.
 */

// ── Blocked word list ──────────────────────────────────────────────────
// Only root forms — the regex builder handles plurals, -ing, -ed, -er, etc.
const BLOCKED_WORDS = [
  'fuck', 'shit', 'ass', 'asshole', 'bitch', 'bastard',
  'damn', 'dick', 'cock', 'pussy', 'cunt', 'slut',
  'whore', 'fag', 'faggot', 'nigger', 'nigga', 'retard',
  'twat', 'wank', 'prick', 'douche', 'jackass',
  'motherfucker', 'bullshit', 'horseshit', 'dipshit',
  'dumbass', 'fatass', 'badass', 'smartass', 'kickass',
  'piss', 'crap', 'stfu', 'gtfo', 'wtf', 'lmfao',
];

// ── Leet-speak substitution map ────────────────────────────────────────
const LEET_MAP = {
  a: '[a@4àáâãäå]',
  b: '[b8]',
  c: '[c(]',
  e: '[e3èéêë]',
  g: '[g9]',
  i: '[i1!|ìíîï]',
  l: '[l1|]',
  o: '[o0òóôõö]',
  s: '[s$5]',
  t: '[t7+]',
  u: '[uùúûü]',
  z: '[z2]',
};

/**
 * Build a regex pattern for a single word that accounts for:
 *  - leet-speak substitutions
 *  - repeated characters (e.g. "fuuuuck")
 *  - optional common suffixes
 */
function buildWordPattern(word) {
  const chars = word.split('').map(ch => {
    const sub = LEET_MAP[ch] || ch;
    // Allow the character to repeat (e.g. "shhhhit")
    return `${sub}+`;
  });
  // Optional suffixes: s, ed, er, ing, y, ies
  return chars.join('[\\s._-]*');
}

// Pre-compile all patterns into one big regex for performance
const BLOCKED_REGEX = new RegExp(
  '\\b(' + BLOCKED_WORDS.map(buildWordPattern).join('|') + ')\\b',
  'i'
);

/**
 * Check a single string for profanity.
 * @param {string} text - The text to check.
 * @returns {{ clean: boolean, word?: string }}
 */
export function checkProfanity(text) {
  if (!text || typeof text !== 'string') return { clean: true };

  const match = text.match(BLOCKED_REGEX);
  if (match) {
    return { clean: false, word: match[0] };
  }
  return { clean: true };
}

/**
 * Check multiple fields at once (e.g. an entire form).
 * @param {Record<string, string>} fields - { fieldName: value }
 * @returns {{ clean: boolean, field?: string, word?: string }}
 */
export function checkFormProfanity(fields) {
  for (const [field, value] of Object.entries(fields)) {
    if (!value || typeof value !== 'string') continue;
    const result = checkProfanity(value);
    if (!result.clean) {
      return { clean: false, field, word: result.word };
    }
  }
  return { clean: true };
}

/** User-friendly error message */
export function profanityErrorMessage(field) {
  const label = field
    ? field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Your input';
  return `${label} contains inappropriate language. Please remove it before submitting.`;
}
