import React, { createContext, useContext, useState, useCallback } from 'react';
import { SelectionResult, GeoJSONFeature } from '../types/gis.types';

interface SelectionContextType {
  selections: Map<string, GeoJSONFeature[]>;
  activeSelectionTool: 'click' | 'rectangle' | 'polygon' | null;
  setActiveSelectionTool: (tool: 'click' | 'rectangle' | 'polygon' | null) => void;
  addSelection: (layerId: string, features: GeoJSONFeature[]) => void;
  clearSelection: (layerId?: string) => void;
  getSelection: (layerId: string) => GeoJSONFeature[];
  hasSelection: (layerId: string) => boolean;
  getSelectionCount: () => number;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<Map<string, GeoJSONFeature[]>>(new Map());
  const [activeSelectionTool, setActiveTool] = useState<'click' | 'rectangle' | 'polygon' | null>(
    null
  );

  const setActiveSelectionTool = useCallback((tool: 'click' | 'rectangle' | 'polygon' | null) => {
    setActiveTool(tool);
  }, []);

  const addSelection = useCallback((layerId: string, features: GeoJSONFeature[]) => {
    setSelections(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(layerId) || [];
      newMap.set(layerId, [...existing, ...features]);
      return newMap;
    });
  }, []);

  const clearSelection = useCallback((layerId?: string) => {
    if (layerId) {
      setSelections(prev => {
        const newMap = new Map(prev);
        newMap.delete(layerId);
        return newMap;
      });
    } else {
      setSelections(new Map());
    }
  }, []);

  const getSelection = useCallback(
    (layerId: string) => {
      return selections.get(layerId) || [];
    },
    [selections]
  );

  const hasSelection = useCallback(
    (layerId: string) => {
      return (selections.get(layerId)?.length || 0) > 0;
    },
    [selections]
  );

  const getSelectionCount = useCallback(() => {
    let count = 0;
    selections.forEach(features => {
      count += features.length;
    });
    return count;
  }, [selections]);

  return (
    <SelectionContext.Provider
      value={{
        selections,
        activeSelectionTool,
        setActiveSelectionTool,
        addSelection,
        clearSelection,
        getSelection,
        hasSelection,
        getSelectionCount,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
};
