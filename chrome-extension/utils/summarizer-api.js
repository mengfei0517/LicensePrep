/**
 * Chrome Built-in AI - Summarizer API 封装
 * 用于优化和精简 AI 生成的答案
 */

export class SummarizerAPIClient {
  constructor() {
    this.summarizer = null;
  }

  /**
   * 检查 Summarizer API 是否可用
   */
  async checkAvailability() {
    try {
      if (!window.ai || !window.ai.summarizer) {
        console.warn('[SummarizerAPI] Not available in this browser');
        return false;
      }

      const capabilities = await window.ai.summarizer.capabilities();
      console.log('[SummarizerAPI] Capabilities:', capabilities);

      return capabilities.available !== 'no';

    } catch (error) {
      console.error('[SummarizerAPI] Check failed:', error);
      return false;
    }
  }

  /**
   * 创建摘要器
   */
  async createSummarizer(options = {}) {
    try {
      const defaultOptions = {
        type: 'key-points',  // 'tl;dr' | 'key-points' | 'teaser' | 'headline'
        format: 'markdown',
        length: 'medium'     // 'short' | 'medium' | 'long'
      };

      const config = { ...defaultOptions, ...options };

      this.summarizer = await window.ai.summarizer.create(config);
      console.log('[SummarizerAPI] Summarizer created:', config);

      return this.summarizer;

    } catch (error) {
      console.error('[SummarizerAPI] Creation failed:', error);
      throw error;
    }
  }

  /**
   * 总结文本
   */
  async summarize(text, type = 'key-points') {
    try {
      if (!this.summarizer) {
        await this.createSummarizer({ type });
      }

      const summary = await this.summarizer.summarize(text);
      console.log('[SummarizerAPI] ✅ Text summarized');

      return {
        summary: summary,
        originalLength: text.length,
        summaryLength: summary.length,
        compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%'
      };

    } catch (error) {
      console.error('[SummarizerAPI] Summarization failed:', error);
      throw error;
    }
  }

  /**
   * 提取关键点
   */
  async extractKeyPoints(text) {
    try {
      await this.createSummarizer({ type: 'key-points', format: 'markdown' });
      const result = await this.summarize(text, 'key-points');
      return result;
    } catch (error) {
      console.error('[SummarizerAPI] Key points extraction failed:', error);
      throw error;
    }
  }

  /**
   * 生成 TL;DR
   */
  async generateTLDR(text) {
    try {
      await this.createSummarizer({ type: 'tl;dr', length: 'short' });
      const result = await this.summarize(text, 'tl;dr');
      return result;
    } catch (error) {
      console.error('[SummarizerAPI] TL;DR generation failed:', error);
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async destroy() {
    if (this.summarizer) {
      try {
        await this.summarizer.destroy();
        console.log('[SummarizerAPI] Summarizer destroyed');
      } catch (error) {
        console.error('[SummarizerAPI] Destroy failed:', error);
      }
      this.summarizer = null;
    }
  }
}

// 创建全局实例
export const summarizerAPI = new SummarizerAPIClient();

