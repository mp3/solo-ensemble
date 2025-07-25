import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistorySize: number = 50) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  // Keep track of whether we're in the middle of an undo/redo operation
  const isUndoRedoRef = useRef(false);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    if (isUndoRedoRef.current) {
      // If we're in an undo/redo operation, just update the present
      setHistory(prev => ({
        ...prev,
        present: typeof newState === 'function' ? newState(prev.present) : newState
      }));
    } else {
      // Normal state update - add current state to past and clear future
      setHistory(prev => {
        const actualNewState = typeof newState === 'function' ? newState(prev.present) : newState;
        const newPast = [...prev.past, prev.present];
        
        // Limit history size
        if (newPast.length > maxHistorySize) {
          newPast.shift();
        }
        
        return {
          past: newPast,
          present: actualNewState,
          future: [] // Clear future on new action
        };
      });
    }
  }, [maxHistorySize]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      
      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      const newFuture = [prev.present, ...prev.future];
      
      isUndoRedoRef.current = true;
      setTimeout(() => { isUndoRedoRef.current = false; }, 0);
      
      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      
      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      const newPast = [...prev.past, prev.present];
      
      isUndoRedoRef.current = true;
      setTimeout(() => { isUndoRedoRef.current = false; }, 0);
      
      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, []);

  const reset = useCallback((newInitialState?: T) => {
    setHistory({
      past: [],
      present: newInitialState ?? initialState,
      future: []
    });
  }, [initialState]);

  const clearHistory = useCallback(() => {
    setHistory(prev => ({
      past: [],
      present: prev.present,
      future: []
    }));
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clearHistory,
    historyLength: history.past.length + history.future.length
  };
}