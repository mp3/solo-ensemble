import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onRecord?: () => void;
  onPlay?: () => void;
  onStop?: () => void;
  onClear?: () => void;
  onMetronome?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const SHORTCUTS = {
  'r': 'record',
  ' ': 'play', // Spacebar
  's': 'stop',
  'c': 'clear',
  'm': 'metronome',
  'e': 'export',
  'z': 'undo',
  'y': 'redo'
} as const;

export const useKeyboardShortcuts = (handlers: ShortcutHandlers, enabled: boolean = true) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    // Check for modifier keys
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    let action: string | null = null;

    if (isCtrlOrCmd && !isShift) {
      // Ctrl/Cmd shortcuts
      if (event.key === 'z' && handlers.onUndo) {
        event.preventDefault();
        handlers.onUndo();
        return;
      }
      if ((event.key === 'y' || (event.key === 'z' && isShift)) && handlers.onRedo) {
        event.preventDefault();
        handlers.onRedo();
        return;
      }
      if (event.key === 'e' && handlers.onExport) {
        event.preventDefault();
        handlers.onExport();
        return;
      }
    }

    // Single key shortcuts
    const key = event.key.toLowerCase();
    if (key in SHORTCUTS && !isCtrlOrCmd && !isShift) {
      action = SHORTCUTS[key as keyof typeof SHORTCUTS];
      event.preventDefault();
    }

    // Execute action
    switch (action) {
      case 'record':
        handlers.onRecord?.();
        break;
      case 'play':
        handlers.onPlay?.();
        break;
      case 'stop':
        handlers.onStop?.();
        break;
      case 'clear':
        handlers.onClear?.();
        break;
      case 'metronome':
        handlers.onMetronome?.();
        break;
      case 'export':
        handlers.onExport?.();
        break;
    }
  }, [handlers]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, enabled]);

  return {
    shortcuts: [
      { key: 'R', action: 'Record' },
      { key: 'Space', action: 'Play/Pause' },
      { key: 'S', action: 'Stop' },
      { key: 'C', action: 'Clear' },
      { key: 'M', action: 'Metronome' },
      { key: 'Ctrl+E', action: 'Export' },
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'Ctrl+Y', action: 'Redo' }
    ]
  };
};