/**
 * Translation utility using MyMemory API (free, no authentication required)
 * Supports automatic language detection + translation to any supported language
 */

const MYMEMORY_API = "https://api.mymemory.translated.net/get";

// Common language codes supported by MyMemory
const supportedLanguages = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  hi: "Hindi",
  ar: "Arabic",
  pl: "Polish",
  tr: "Turkish",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  el: "Greek",
  cs: "Czech",
  hu: "Hungarian",
  ro: "Romanian",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
};

/**
 * Translate text using MyMemory API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'en', 'es', 'hi')
 * @param {string} sourceLang - Source language code (defaults to 'auto' for auto-detect)
 * @returns {Promise<object>} { success: boolean, translated?: string, error?: string, targetLang: string }
 */
export async function translateText(text, targetLang = "en", sourceLang = "auto") {
  try {
    if (!text || typeof text !== "string") {
      return { success: false, error: "Invalid text", targetLang };
    }
    
    if (!supportedLanguages[targetLang]) {
      return { success: false, error: `Unsupported language: ${targetLang}`, targetLang };
    }
    
    // Truncate very long text to avoid API issues
    const textToTranslate = text.substring(0, 500);
    
    // Build query string
    const langPair = sourceLang === "auto" ? `|${targetLang}` : `${sourceLang}|${targetLang}`;
    const params = new URLSearchParams({
      q: textToTranslate,
      langpair: langPair,
    });
    
    const url = `${MYMEMORY_API}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "YouTube2.0-App/1.0",
      },
    });
    
    if (!response.ok) {
      return { success: false, error: "Translation service error", targetLang };
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return {
        success: true,
        translated: data.responseData.translatedText,
        targetLang,
        detectedSourceLang: data.responseData.detectedLanguage?.toLowerCase() || sourceLang,
      };
    } else if (data.responseStatus === 400) {
      return { success: false, error: "Language pair not supported", targetLang };
    } else {
      return { success: false, error: data.responseDetails || "Translation failed", targetLang };
    }
  } catch (error) {
    console.error("Translation error:", error);
    return { success: false, error: error.message, targetLang };
  }
}

/**
 * Translate comment object (returns new object, doesn't modify original)
 * @param {object} comment - Comment object with 'text' property
 * @param {string} targetLang - Target language code
 * @returns {Promise<object>} Comment object with added 'translatedText' property
 */
export async function translateComment(comment, targetLang = "en") {
  if (!comment || !comment.text) {
    return { ...comment, translatedText: null, translationError: "Invalid comment" };
  }
  
  // Don't translate if target language matches source
  if (comment.language === targetLang) {
    return { ...comment, translatedText: comment.text, isSameLanguage: true };
  }
  
  const result = await translateText(comment.text, targetLang, comment.language || "auto");
  
  if (result.success) {
    return {
      ...comment,
      translatedText: result.translated,
      translatedLang: targetLang,
    };
  } else {
    return {
      ...comment,
      translatedText: null,
      translationError: result.error,
    };
  }
}

/**
 * Get supported languages list
 * @returns {object} Language code -> Language name mapping
 */
export function getSupportedLanguages() {
  return { ...supportedLanguages };
}

/**
 * Check if language is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if language is supported
 */
export function isLanguageSupported(langCode) {
  return langCode in supportedLanguages;
}

/**
 * Batch translate multiple texts (useful for translating multiple comments)
 * Note: Use with caution for rate limiting - MyMemory has free limits
 * @param {array} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<array>} Array of translation results
 */
export async function translateBatch(texts, targetLang = "en") {
  if (!Array.isArray(texts)) {
    return { success: false, error: "texts must be an array" };
  }
  
  // Limit to avoid rate limiting
  if (texts.length > 10) {
    return { success: false, error: "Batch limited to 10 texts" };
  }
  
  const results = await Promise.all(
    texts.map(text => translateText(text, targetLang))
  );
  
  return { success: true, results };
}

export default {
  translateText,
  translateComment,
  getSupportedLanguages,
  isLanguageSupported,
  translateBatch,
};
