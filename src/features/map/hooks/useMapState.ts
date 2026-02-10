import { useState, useCallback } from 'react';
import { LatLng, Map as LeafletMap } from 'leaflet';

export interface MapState {
  center: LatLng | null;
  zoom: number;
  mousePosition: LatLng | null;
  isLoading: boolean;
  selectedFeature: any | null;
}

export interface UseMapStateReturn {
  mapState: MapState;
  updateCenter: (center: LatLng) => void;
  updateZoom: (zoom: number) => void;
  updateMousePosition: (position: LatLng | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedFeature: (feature: any | null) => void;
  resetMapState: () => void;
}

const initialState: MapState = {
  center: null,
  zoom: 10,
  mousePosition: null,
  isLoading: false,
  selectedFeature: null
};

export const useMapState = (): UseMapStateReturn => {
  const [mapState, setMapState] = useState<MapState>(initialState);

  const updateCenter = useCallback((center: LatLng) => {
    setMapState(prev => ({ ...prev, center }));
  }, []);

  const updateZoom = useCallback((zoom: number) => {
    setMapState(prev => ({ ...prev, zoom }));
  }, []);

  const updateMousePosition = useCallback((mousePosition: LatLng | null) => {
    setMapState(prev => ({ ...prev, mousePosition }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setMapState(prev => ({ ...prev, isLoading }));
  }, []);

  const setSelectedFeature = useCallback((selectedFeature: any | null) => {
    setMapState(prev => ({ ...prev, selectedFeature }));
  }, []);

  const resetMapState = useCallback(() => {
    setMapState(initialState);
  }, []);

  return {
    mapState,
    updateCenter,
    updateZoom,
    updateMousePosition,
    setLoading,
    setSelectedFeature,
    resetMapState
  };
};
