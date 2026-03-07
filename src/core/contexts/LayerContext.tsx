import React, { createContext, useContext, useState, useCallback } from 'react';
import { Layer, GeoJSONFeatureCollection } from '../types/gis.types';

interface LayerContextType {
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  setActiveLayer: (layerId: string | null) => void;
  getLayer: (layerId: string) => Layer | undefined;
  clearLayers: () => void;
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  const addLayer = useCallback((layer: Layer) => {
    setLayers(prev => {
      // Evitar duplicados
      if (prev.some(l => l.id === layer.id)) {
        console.warn(`Layer with id ${layer.id} already exists`);
        return prev;
      }
      return [...prev, layer];
    });
  }, []);

  const removeLayer = useCallback(
    (layerId: string) => {
      setLayers(prev => prev.filter(l => l.id !== layerId));
      if (activeLayerId === layerId) {
        setActiveLayerId(null);
      }
    },
    [activeLayerId]
  );

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(layer => (layer.id === layerId ? { ...layer, ...updates } : layer)));
  }, []);

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers(prev =>
      prev.map(layer => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer))
    );
  }, []);

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => (layer.id === layerId ? { ...layer, opacity } : layer)));
  }, []);

  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    setLayers(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      // Actualizar zIndex
      return result.map((layer, index) => ({
        ...layer,
        zIndex: result.length - index,
      }));
    });
  }, []);

  const setActiveLayer = useCallback((layerId: string | null) => {
    setActiveLayerId(layerId);
  }, []);

  const getLayer = useCallback(
    (layerId: string) => {
      return layers.find(l => l.id === layerId);
    },
    [layers]
  );

  const clearLayers = useCallback(() => {
    setLayers([]);
    setActiveLayerId(null);
  }, []);

  return (
    <LayerContext.Provider
      value={{
        layers,
        activeLayerId,
        addLayer,
        removeLayer,
        updateLayer,
        toggleLayerVisibility,
        setLayerOpacity,
        reorderLayers,
        setActiveLayer,
        getLayer,
        clearLayers,
      }}
    >
      {children}
    </LayerContext.Provider>
  );
};

export const useLayers = () => {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayers must be used within LayerProvider');
  }
  return context;
};
