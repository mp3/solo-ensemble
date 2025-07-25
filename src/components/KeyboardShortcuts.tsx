import React, { useState } from 'react';

interface Shortcut {
  key: string;
  action: string;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ shortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-surface hover:bg-gray-700 text-text p-3 rounded-full shadow-lg transition-all"
        title="Keyboard shortcuts"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 bg-surface p-4 rounded-lg shadow-xl">
          <h3 className="text-text font-medium mb-3">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-background rounded text-xs font-mono text-primary">
                  {shortcut.key}
                </kbd>
                <span className="text-sm text-text-secondary">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};