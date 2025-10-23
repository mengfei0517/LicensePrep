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
   * 检查 Translator API 是否可用
   */
  async checkAvailability() {
    try {
      if (!window.translation) {
        console.warn('[TranslatorAPI] Not available in this browser');
        return false;
      }

      // 检查语言检测器
      const detectorAvailable = await window.translation.canDetect();
      console.log('[TranslatorAPI] Detector available:', detectorAvailable);

      // 检查翻译器（德语 <-> 英语）
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
   * 检测文本语言
   */
  async detectLanguage(text) {
    try {
      if (!this.detector) {
        this.detector = await window.translation.createDetector();
      }

      const results = await this.detector.detect(text);
      
      // 返回置信度最高的语言
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
   * 翻译文本
   */
  async translate(text, targetLang = 'en', sourceLang = null) {
    try {
      // 如果没有指定源语言，先检测
      if (!sourceLang) {
        sourceLang = await this.detectLanguage(text);
      }

      // 如果源语言和目标语言相同，直接返回
      if (sourceLang === targetLang) {
        console.log('[TranslatorAPI] Source and target languages are the same');
        return {
          translatedText: text,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          sameLanguage: true
        };
      }

      // 创建翻译器
      const translator = await window.translation.createTranslator({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      });

      // 执行翻译
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
   * 智能翻译：自动检测并翻译到目标语言
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

// 创建全局实例
export const translatorAPI = new TranslatorAPIClient();

