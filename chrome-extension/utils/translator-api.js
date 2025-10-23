/**
 * Chrome Built-in AI - Translator API 封装
 * 支持语言检测和翻译
 */

export class TranslatorAPIClient {
  constructor() {
    this.detector = null;
    this.translator = null;
  }

  /**
   * Check if Translator API is available
   */
  async checkAvailability() {
    try {
      if (!window.translation) {
        console.warn('[TranslatorAPI] Not available in this browser');
        return false;
      }

      // Check language detector
      const detectorAvailable = await window.translation.canDetect();
      console.log('[TranslatorAPI] Detector available:', detectorAvailable);

      // Check translator (German <-> English)
      const canTranslateDeEn = await window.translation.canTranslate({
        sourceLanguage: 'de',
        targetLanguage: 'en'
      });
      const canTranslateEnDe = await window.translation.canTranslate({
        sourceLanguage: 'en',
        targetLanguage: 'de'
      });

      console.log('[TranslatorAPI] DE->EN available:', canTranslateDeEn);
      console.log('[TranslatorAPI] EN->DE available:', canTranslateEnDe);

      return {
        detector: detectorAvailable !== 'no',
        translator: canTranslateDeEn !== 'no' || canTranslateEnDe !== 'no'
      };

    } catch (error) {
      console.error('[TranslatorAPI] Check failed:', error);
      return { detector: false, translator: false };
    }
  }

  /**
   * Detect text language
   */
  async detectLanguage(text) {
    try {
      if (!this.detector) {
        this.detector = await window.translation.createDetector();
      }

      const results = await this.detector.detect(text);
      
      // Return the language with the highest confidence
      if (results && results.length > 0) {
        const topResult = results[0];
        console.log(`[TranslatorAPI] Detected language: ${topResult.detectedLanguage} (confidence: ${topResult.confidence})`);
        return topResult.detectedLanguage;
      }

      return 'unknown';

    } catch (error) {
      console.error('[TranslatorAPI] Language detection failed:', error);
      return 'unknown';
    }
  }

  /**
   * Translate text
   */
  async translate(text, targetLang = 'en', sourceLang = null) {
    try {
      // If no source language is specified, detect it first
      if (!sourceLang) {
        sourceLang = await this.detectLanguage(text);
      }

      // If source and target languages are the same, return immediately
      if (sourceLang === targetLang) {
        console.log('[TranslatorAPI] Source and target languages are the same');
        return {
          translatedText: text,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          sameLanguage: true
        };
      }

      // Create translator
      const translator = await window.translation.createTranslator({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      });

      // Execute translation
      const translatedText = await translator.translate(text);
      console.log(`[TranslatorAPI] Translated ${sourceLang} -> ${targetLang}`);

      return {
        translatedText: translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        sameLanguage: false
      };

    } catch (error) {
      console.error('[TranslatorAPI] Translation failed:', error);
      throw error;
    }
  }

  /**
   * Smart translation: automatically detect and translate to target language
   */
  async autoTranslate(text, preferredLang = 'en') {
    try {
      const availability = await this.checkAvailability();

      if (!availability.detector || !availability.translator) {
        console.warn('[TranslatorAPI] Translation features not available');
        return {
          success: false,
          error: 'Translation API not available',
          originalText: text
        };
      }

      const result = await this.translate(text, preferredLang);
      
      return {
        success: true,
        ...result
      };

    } catch (error) {
      console.error('[TranslatorAPI] Auto translation failed:', error);
      return {
        success: false,
        error: error.message,
        originalText: text
      };
    }
  }
}

// Create global instance
export const translatorAPI = new TranslatorAPIClient();

