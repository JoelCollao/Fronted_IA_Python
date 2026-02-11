import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { MapState, Coordinates } from '../types/gis.types';

interface MapContextType {
  map: LeafletMap | null;
  setMap: (map: LeafletMap | null) => void;
  mapState: MapState;
  updateMapState: (state: Partial<MapState>) => void;
  flyTo: (coords: Coordinates, zoom?: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMapInstance] = useState<LeafletMap | null>(null);
 const [mapState, setMapState] = useState<MapState>({
  center: [-12.0464, -77.0428],  // Lima, Perú
  zoom: 11,  // Zoom más cercano para ver Lima
  basemap: 'osm'
});

  const setMap = useCallback((mapInstance: LeafletMap | null) => {
    setMapInstance(mapInstance);
  }, []);

  const updateMapState = useCallback((state: Partial<MapState>) => {
    setMapState(prev => ({ ...prev, ...state }));
  }, []);

  const flyTo = useCallback((coords: Coordinates, zoom?: number) => {
    if (map) {
      map.flyTo([coords.lat, coords.lng], zoom || map.getZoom(), {
        duration: 1.5
      });
    }
  }, [map]);

  const fitBounds = useCallback((bounds: [[number, number], [number, number]]) => {
    if (map) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map]);

  return (
    <MapContext.Provider value={{
      map,
      setMap,
      mapState,
      updateMapState,
      flyTo,
      fitBounds
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within MapProvider');
  }
  return context;
};
