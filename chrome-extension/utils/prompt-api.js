/**
 * Chrome Built-in AI - Prompt API wrapper
 * Prioritize local Gemini Nano, fallback to cloud API if fails
 */

export class PromptAPIClient {
  constructor() {
    this.session = null;
    this.apiAvailable = false;
    this.backendUrl = 'http://localhost:5000'; // Development environment
  }

  // Check if Prompt API is available
  async checkAvailability() {
    try {
      if (!window.ai || !window.ai.languageModel) {
        console.warn('[PromptAPI] Not available in this browser');
        return false;
      }

      const capabilities = await window.ai.languageModel.capabilities();
      console.log('[PromptAPI] Capabilities:', capabilities);

      if (capabilities.available === 'no') {
        console.warn('[PromptAPI] Model not available');
        return false;
      }

      if (capabilities.available === 'after-download') {
        console.log('[PromptAPI] Model needs download, initiating...');
        // User needs to download the model first
        return 'downloading';
      }

      this.apiAvailable = true;
      return true;

    } catch (error) {
      console.error('[PromptAPI] Check failed:', error);
      return false;
    }
  }

  /**
   * Create AI session
   */
  async createSession(systemPrompt = null) {
    try {
      const defaultPrompt = `You are an authoritative German driving instructor and exam coach. 
Your role is to help students learn German driving rules, understand traffic scenarios, and prepare for their driving test.

Guidelines:
- Provide clear, concise answers based on official German traffic regulations
- Use examples and scenarios to illustrate complex rules
- If information is not in your knowledge, say so clearly
- Always prioritize safety and legal compliance
- Support both German and English languages`;

      const options = {
        temperature: 0.3,
        topK: 3,
      };

      if (systemPrompt) {
        options.systemPrompt = systemPrompt;
      } else {
        options.systemPrompt = defaultPrompt;
      }

      this.session = await window.ai.languageModel.create(options);
      console.log('[PromptAPI] Session created successfully');
      return this.session;

    } catch (error) {
      console.error('[PromptAPI] Session creation failed:', error);
      throw error;
    }
  }

  // Local AI query (Prompt API)
  async queryLocal(question, context = '') {
    const startTime = Date.now();

    try {
      // Ensure session exists
      if (!this.session) {
        await this.createSession();
      }

      // Build prompt
      let prompt = '';
      if (context) {
        prompt = `Context from Knowledge Base:\n${context}\n\n`;
      }
      prompt += `User Question: ${question}\n\nProvide a clear and helpful answer:`;

      // Call local model
      const response = await this.session.prompt(prompt);
      const latency = Date.now() - startTime;

      console.log(`[PromptAPI] ✅ Local AI response (${latency}ms)`);

      return {
        answer: response,
        source: 'chrome_builtin_ai',
        mode: 'local',
        privacy: '🔒 Private (Local Processing)',
        latency: latency,
        model: 'Gemini Nano'
      };

    } catch (error) {
      console.error('[PromptAPI] Local query failed:', error);
      throw error;
    }
  }

  /**
   * Fallback to cloud Gemini API
   */
  async queryCloud(question, context = '') {
    const startTime = Date.now();

    try {
      console.log('[CloudAPI] Falling back to cloud Gemini API...');

      const response = await fetch(`${this.backendUrl}/api/qa/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`Cloud API error: ${response.status}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      console.log(`[CloudAPI] ✅ Cloud response (${latency}ms)`);

      return {
        answer: data.answer.answer || data.answer,
        source: 'google_gemini_cloud',
        mode: 'cloud_fallback',
        privacy: '⚠️ Cloud API (Data sent to Google servers)',
        latency: latency,
        model: 'Gemini 2.5 Flash'
      };

    } catch (error) {
      console.error('[CloudAPI] Cloud query failed:', error);
      throw error;
    }
  }

  /**
   * Hybrid query: prioritize local, automatically fallback to cloud
   */
  async queryHybrid(question, context = '') {
    console.log('[HybridAPI] Starting hybrid query...');

    // Step 1: Check local API availability
    const available = await this.checkAvailability();

    // Step 2: Try local AI
    if (available === true) {
      try {
        const result = await this.queryLocal(question, context);
        return result;
      } catch (error) {
        console.warn('[HybridAPI] Local AI failed, falling back to cloud:', error);
      }
    } else {
      console.log('[HybridAPI] Local AI not available, using cloud directly');
    }

    // Step 3: Fallback to cloud
    return await this.queryCloud(question, context);
  }

  /**
   * Clean up session
   */
  async destroy() {
    if (this.session) {
      try {
        await this.session.destroy();
        console.log('[PromptAPI] Session destroyed');
      } catch (error) {
        console.error('[PromptAPI] Session destroy failed:', error);
      }
      this.session = null;
    }
  }
}

// Create global instance
export const promptAPI = new PromptAPIClient();

