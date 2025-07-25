const STORAGE_KEY = 'solo-ensemble-settings';

export interface SavedSettings {
  key: string;
  scale: 'major' | 'minor';
  voicing: 'triad' | 'satb' | 'close' | 'open';
  bpm: number;
  voiceVolumes: {
    soprano: number;
    alto: number;
    tenor: number;
    bass: number;
  };
  useFormants: boolean;
  vowel: string;
}

export const saveSettings = (settings: SavedSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadSettings = (): SavedSettings | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as SavedSettings;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return null;
};

export const clearSettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear settings:', error);
  }
};