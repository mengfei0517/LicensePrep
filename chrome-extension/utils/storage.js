/**
 * Chrome Storage API 封装
 * 用于存储用户数据、笔记、历史记录等
 */

export class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  /**
   * 保存数据
   */
  async set(key, value) {
    try {
      await this.storage.set({ [key]: value });
      console.log(`[Storage] Saved: ${key}`);
      return true;
    } catch (error) {
      console.error('[Storage] Save failed:', error);
      return false;
    }
  }

  /**
   * 获取数据
   */
  async get(key, defaultValue = null) {
    try {
      const result = await this.storage.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error('[Storage] Get failed:', error);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   */
  async remove(key) {
    try {
      await this.storage.remove(key);
      console.log(`[Storage] Removed: ${key}`);
      return true;
    } catch (error) {
      console.error('[Storage] Remove failed:', error);
      return false;
    }
  }

  /**
   * 清空所有数据
   */
  async clear() {
    try {
      await this.storage.clear();
      console.log('[Storage] Cleared all data');
      return true;
    } catch (error) {
      console.error('[Storage] Clear failed:', error);
      return false;
    }
  }

  /**
   * 保存 Q&A 历史
   */
  async saveQAHistory(question, answer, metadata = {}) {
    try {
      const history = await this.get('qa_history', []);
      
      const entry = {
        id: Date.now(),
        question: question,
        answer: answer,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      history.unshift(entry); // 最新的在前面
      
      // 限制历史记录数量（最多100条）
      if (history.length > 100) {
        history.pop();
      }

      await this.set('qa_history', history);
      console.log('[Storage] QA history saved');
      return entry;

    } catch (error) {
      console.error('[Storage] Save QA history failed:', error);
      return null;
    }
  }

  /**
   * 获取 Q&A 历史
   */
  async getQAHistory(limit = 20) {
    try {
      const history = await this.get('qa_history', []);
      return history.slice(0, limit);
    } catch (error) {
      console.error('[Storage] Get QA history failed:', error);
      return [];
    }
  }

  /**
   * 保存笔记
   */
  async saveNote(note) {
    try {
      const notes = await this.get('notes', []);
      
      const newNote = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...note
      };

      notes.unshift(newNote);

      await this.set('notes', notes);
      console.log('[Storage] Note saved');
      return newNote;

    } catch (error) {
      console.error('[Storage] Save note failed:', error);
      return null;
    }
  }

  /**
   * 获取所有笔记
   */
  async getNotes() {
    try {
      return await this.get('notes', []);
    } catch (error) {
      console.error('[Storage] Get notes failed:', error);
      return [];
    }
  }

  /**
   * 删除笔记
   */
  async deleteNote(noteId) {
    try {
      const notes = await this.get('notes', []);
      const filtered = notes.filter(note => note.id !== noteId);
      await this.set('notes', filtered);
      console.log('[Storage] Note deleted');
      return true;
    } catch (error) {
      console.error('[Storage] Delete note failed:', error);
      return false;
    }
  }

  /**
   * 保存用户设置
   */
  async saveSettings(settings) {
    try {
      const currentSettings = await this.get('settings', {});
      const updated = { ...currentSettings, ...settings };
      await this.set('settings', updated);
      console.log('[Storage] Settings saved');
      return updated;
    } catch (error) {
      console.error('[Storage] Save settings failed:', error);
      return null;
    }
  }

  /**
   * 获取用户设置
   */
  async getSettings() {
    try {
      return await this.get('settings', {
        preferredLanguage: 'en',
        autoTranslate: false,
        useSummarizer: true,
        theme: 'light'
      });
    } catch (error) {
      console.error('[Storage] Get settings failed:', error);
      return {};
    }
  }
}

// 创建全局实例
export const storage = new StorageManager();

