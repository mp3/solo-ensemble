import React from 'react';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded transition-all ${
          canUndo
            ? 'bg-gray-600 hover:bg-gray-500 text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded transition-all ${
          canRedo
            ? 'bg-gray-600 hover:bg-gray-500 text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Y)"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
          />
        </svg>
      </button>
    </div>
  );
};