// Comprehensive profanity list (can be expanded)
const profanityList = [
  "damn", "hell", "crap", "piss", "shit", "fuck", "ass", "bitch", "bastard",
  "arse", "bollocks", "bugger", "chav", "cunt", "dick", "dickhead", "wanker",
  "scunthorpe", "prick", "twat", "arsehole", "tosser", "numpty", "git",
  // Common variations
  "shitty", "fucks", "fucked", "fucker", "fucking", "asshole", "assholes"
];

// Language detection based on character ranges and common words
const languagePatterns = {
  hi: { words: ["aur", "kya", "hai", "nahi", "main", "hum", "tum", "wo", "ye", "yeh", "par", "ek", "do", "teen", "char"], script: /[\u0900-\u097F]/ },
  en: { words: ["the", "and", "is", "to", "of", "a", "in", "for", "you", "that", "this"], script: /[a-zA-Z]/ },
  es: { words: ["el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no"], script: /[a-zA-Z]/ },
  fr: { words: ["le", "de", "un", "et", "est", "une", "à", "la", "en", "que"], script: /[a-zA-Z]/ },
  pt: { words: ["o", "a", "de", "que", "é", "e", "um", "uma", "em", "para"], script: /[a-zA-Z]/ },
  ja: { script: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/ },
  zh: { script: /[\u4E00-\u9FFF]/ },
  ar: { script: /[\u0600-\u06FF]/ },
  ru: { script: /[\u0400-\u04FF]/ },
  ko: { script: /[\uAC00-\uD7AF]/ },
};

/**
 * Detect language of text using script detection and word matching
 * @param {string} text - Comment text
 * @returns {string} Language code (en, hi, es, etc.)
 */
export function detectLanguage(text) {
  const lowerText = text.toLowerCase();
  
  // Check script first (most reliable)
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.script && pattern.script.test(text)) {
      return lang;
    }
  }
  
  // If no script match, check common words
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.words) {
      const matchCount = pattern.words.filter(word => 
        lowerText.split(/\s+/).includes(word)
      ).length;
      if (matchCount >= 2) {
        return lang;
      }
    }
  }
  
  // Default to English
  return "en";
}

/**
 * Check if text contains profanity
 * @param {string} text - Comment text
 * @returns {boolean} True if profanity detected
 */
export function hasProfanity(text) {
  const lowerText = text.toLowerCase();
  
  // Remove common obfuscations
  const cleanedText = lowerText
    .replace(/[0@]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
  
  // Check for profanity with word boundaries
  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(cleanedText)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if text is likely spam
 * Checks for: excessive caps, excessive special chars, repeated patterns, spam keywords
 * @param {string} text - Comment text
 * @returns {object} { isSpam: boolean, reason?: string }
 */
export function isSpam(text) {
  if (!text || text.length < 3) {
    return { isSpam: false };
  }
  
  // 1. Check for excessive caps (>70% uppercase letters)
  const lettersOnly = text.match(/[a-zA-Z]/g) || [];
  if (lettersOnly.length > 5) {
    const capsRatio = lettersOnly.filter(c => c === c.toUpperCase()).length / lettersOnly.length;
    if (capsRatio > 0.7) {
      return { isSpam: true, reason: "EXCESSIVE_CAPS" };
    }
  }
  
  // 2. Check for excessive special characters (>40% special chars, not including spaces)
  const specialCharCount = (text.match(/[!@#$%^&*()_+=\-\[\]{};:'",.<>?/\\|`~]/g) || []).length;
  const nonSpaceCount = text.replace(/\s/g, "").length;
  if (nonSpaceCount > 0) {
    const specialRatio = specialCharCount / nonSpaceCount;
    if (specialRatio > 0.4) {
      return { isSpam: true, reason: "EXCESSIVE_SPECIAL_CHARS" };
    }
  }
  
  // 3. Check for repeated characters (like "aaaaaaa" or "!!!!!!!")
  if (/((.)\2{4,})/g.test(text)) {
    return { isSpam: true, reason: "REPEATED_CHARACTERS" };
  }
  
  // 4. Check for common spam keywords
  const spamKeywords = ["click here", "buy now", "limited offer", "free money", "earn cash", "get rich", "subscribe now"];
  const lowerText = text.toLowerCase();
  if (spamKeywords.some(keyword => lowerText.includes(keyword))) {
    return { isSpam: true, reason: "SPAM_KEYWORDS" };
  }
  
  // 5. Check for URL patterns (links in comments can be spam)
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
  if (urlPattern.test(text)) {
    return { isSpam: true, reason: "CONTAINS_LINK" };
  }
  
  return { isSpam: false };
}

/**
 * Check if text has excessive special characters (abuse pattern)
 * Different from spam check - this is more lenient for legitimate use
 * @param {string} text - Comment text
 * @returns {boolean} True if potential abuse pattern
 */
export function hasExcessiveSpecialChars(text) {
  const specialCharCount = (text.match(/[!@#$%^&*()_+=\-\[\]{};:'",.<>?/\\|`~]/g) || []).length;
  const nonSpaceCount = text.replace(/\s/g, "").length;
  
  // If >50% special chars, likely abuse/gibberish
  if (nonSpaceCount > 0 && (specialCharCount / nonSpaceCount) > 0.5) {
    return true;
  }
  
  return false;
}

/**
 * Comprehensive comment validation
 * @param {string} text - Comment text
 * @returns {object} { valid: boolean, reason?: string, language?: string }
 */
export function validateComment(text) {
  if (!text || typeof text !== "string") {
    return { valid: false, reason: "INVALID_TEXT" };
  }
  
  const trimmedText = text.trim();
  
  if (trimmedText.length === 0) {
    return { valid: false, reason: "EMPTY_COMMENT" };
  }
  
  if (trimmedText.length < 2) {
    return { valid: false, reason: "TOO_SHORT" };
  }
  
  if (trimmedText.length > 2000) {
    return { valid: false, reason: "TOO_LONG" };
  }
  
  // Check for profanity
  if (hasProfanity(trimmedText)) {
    return { valid: false, reason: "PROFANITY_DETECTED" };
  }
  
  // Check for spam
  const spamCheck = isSpam(trimmedText);
  if (spamCheck.isSpam) {
    return { valid: false, reason: spamCheck.reason };
  }
  
  // Detect language
  const language = detectLanguage(trimmedText);
  
  return { valid: true, language };
}

export default {
  detectLanguage,
  hasProfanity,
  isSpam,
  hasExcessiveSpecialChars,
  validateComment,
};
