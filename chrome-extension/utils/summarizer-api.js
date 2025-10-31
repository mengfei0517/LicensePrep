/**
 * Chrome Built-in AI - Summarizer API wrapper
 * Used to optimize and simplify AI-generated answers
 */

export class SummarizerAPIClient {
  constructor() {
    this.summarizer = null;
  }
  
  // Check if Summarizer API is available
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

  // Create summarizer
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

  // Summarize text
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

  // Extract key points
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

  // Generate TL;DR
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

  // Clean up resources
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

// Create global instance
export const summarizerAPI = new SummarizerAPIClient();

