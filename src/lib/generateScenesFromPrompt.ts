export type Scene = {
  visual: string;
  keywords: string;
  duration: number;
};

const STOPWORDS = new Set([
  'a','an','the','and','or','of','in','on','at','with','to','for','by','from','is','are','was','were','that','this','these','those','as','it','its','be','being','have','has','had','but','not','into','while','during','my','your','their','its'
]);

// Words to exclude from image search (descriptive, not searchable)
const EXCLUDE_WORDS = new Set([
  'cinematic', 'realistic', 'lighting', 'ultra', 'detailed', 'quality', 'smooth',
  'volumetric', 'motion', 'dynamic', 'dramatic', 'stunning', 'beautiful', 'amazing',
  'high', 'ray', 'trace', 'render', 'style', 'effect', 'texture', 'ambient'
]);

function extractKeywords(prompt: string): string[] {
  const words = (prompt || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    if (STOPWORDS.has(w) || EXCLUDE_WORDS.has(w)) continue;
    if (!seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
    if (out.length >= 6) break;
  }
  return out;
}

// Extract only 2-3 main keywords for image search
function extractSearchKeywords(prompt: string, actionWord: string | null, locationWord: string | null): string {
  const keywords = extractKeywords(prompt);
  const mainKeywords: string[] = [];
  
  if (locationWord) mainKeywords.push(locationWord);
  if (actionWord) {
    const actionBase = actionWord.replace(/ing$/, '');
    mainKeywords.push(actionBase);
  }
  
  // Add remaining keywords (max 3 total)
  for (const k of keywords) {
    if (!mainKeywords.includes(k) && mainKeywords.length < 3) {
      mainKeywords.push(k);
    }
  }
  
  return mainKeywords.slice(0, 3).join(' ') || 'technology';
}

function findAction(prompt: string): string | null {
  const m = prompt.match(/\b\w+ing(?: \w+){0,2}\b/i);
  return m ? m[0].toLowerCase() : null;
}

function findLocation(prompt: string): string | null {
  const m = prompt.match(/(?:in|on|at|inside|within|near) (?:a |an |the )?([\w\s]{1,50})/i);
  if (!m) return null;
  return m[1].split(/[.,;]\s*/)[0].trim().toLowerCase();
}

export function generateScenesFromPrompt(prompt: string): Scene[] {
  if (!prompt || typeof prompt !== 'string') return [];
  const normalized = prompt.trim();
  
  const action = findAction(normalized);
  const location = findLocation(normalized);
  
  // Generate search-friendly keywords (2-3 main terms)
  const searchKeywords = extractSearchKeywords(normalized, action, location);
  
  // Full keywords for visual descriptions
  const keywordsArr = extractKeywords(normalized);
  const subject = keywordsArr.slice(0, 3).join(' ') || normalized.toLowerCase();

  // Scene 1: main subject performing primary action or shown in setting
  const scene1Visual = action
    ? `${subject} ${action}`
    : location
    ? `${subject} in ${location}`
    : `${subject} in a realistic setting`;

  // Scene 2: interaction or close-up detail
  const actorHints = ['student', 'students', 'people', 'person', 'child', 'children', 'man', 'woman', 'group'];
  const actor = keywordsArr.find(k => actorHints.includes(k));
  const scene2Visual = actor
    ? `${actor} interacting with ${subject}`
    : action
    ? `close-up of ${subject} ${action}`
    : `close-up of ${subject} with natural detail`;

  // Scene 3: wide/environment shot
  const scene3Visual = location
    ? `wide view of ${subject} in ${location}`
    : `wide view showing ${subject} within its environment`;

  return [
    { visual: scene1Visual.toLowerCase(), keywords: searchKeywords, duration: 5 },
    { visual: scene2Visual.toLowerCase(), keywords: searchKeywords, duration: 5 },
    { visual: scene3Visual.toLowerCase(), keywords: searchKeywords, duration: 5 }
  ];
}

export default generateScenesFromPrompt;
