/**
 * Chrome Storage API wrapper
 * Used to store user data, notes, history records, etc.
 */

export class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  // Save data
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

  // Get data
  async get(key, defaultValue = null) {
    try {
      const result = await this.storage.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error('[Storage] Get failed:', error);
      return defaultValue;
    }
  }

  // Delete data
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

  // Clear all data
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

  // Save Q&A history
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

      history.unshift(entry); // The latest one is in front
      
      // Limit history record count (maximum 100)
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

  // Get Q&A history
  async getQAHistory(limit = 20) {
    try {
      const history = await this.get('qa_history', []);
      return history.slice(0, limit);
    } catch (error) {
      console.error('[Storage] Get QA history failed:', error);
      return [];
    }
  }

  // Save note
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

  // Get all notes
  async getNotes() {
    try {
      return await this.get('notes', []);
    } catch (error) {
      console.error('[Storage] Get notes failed:', error);
      return [];
    }
  }

  // Delete note
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

  // Save user settings
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

  // Get user settings
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

// Create global instance
export const storage = new StorageManager();

