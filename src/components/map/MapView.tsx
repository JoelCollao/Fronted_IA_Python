import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents, WMSTileLayer } from 'react-leaflet';
import { LatLng, Icon, Map as LeafletMap, geoJSON } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { currentEnvironment } from '@core/config/environment';
import { GIS_CONSTANTS } from '@core/constants/gis';
import { GeoUtils } from '@core/utils/geoUtils';
import { useMapState } from '@features/map/hooks/useMapState';
import { CoordinateDisplay } from './CoordinateDisplay';
import { LayerControl, LayerInfo } from './LayerControl';
import { MeasurementTools, MeasurementMode } from './MeasurementTools';

// Fix para iconos de Leaflet en React
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  geoJsonData?: any;
  wmsLayers?: Array<{
    url: string;
    layers: string;
    name: string;
    visible: boolean;
  }>;
  onFeatureClick?: (feature: any, latLng: LatLng) => void;
  className?: string;
}

// Componente para eventos del mapa
const MapEvents: React.FC<{
  onMouseMove: (latLng: LatLng) => void;
  onMeasurementClick: (latLng: LatLng) => void;
  measurementMode: MeasurementMode;
}> = ({ onMouseMove, onMeasurementClick, measurementMode }) => {
  useMapEvents({
    mousemove: (e) => onMouseMove(e.latlng),
    click: (e) => {
      if (measurementMode) {
        onMeasurementClick(e.latlng);
      }
    }
  });
  
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  geoJsonData,
  wmsLayers = [],
  onFeatureClick,
  className = ''
}) => {
  const { mapState, updateMousePosition, setSelectedFeature } = useMapState();
  const mapRef = useRef<LeafletMap | null>(null);
  
  // Estados para funcionalidades
  const [layers, setLayers] = useState<LayerInfo[]>([
    { id: 'osm', name: 'OpenStreetMap', visible: true, type: 'base' },
    ...wmsLayers.map(layer => ({
      id: layer.layers,
      name: layer.name,
      visible: layer.visible,
      type: 'wms' as const
    }))
  ]);
  
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(null);
  const [measurementPoints, setMeasurementPoints] = useState<LatLng[]>([]);
  const [measurements, setMeasurements] = useState<{
    distance?: number;
    area?: number;
  }>({});

  // Manejo de eventos del mapa
  const handleMouseMove = useCallback((latLng: LatLng) => {
    updateMousePosition(latLng);
  }, [updateMousePosition]);

  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ));
  }, []);

  const handleMeasurementClick = useCallback((latLng: LatLng) => {
    if (!measurementMode) return;

    const newPoints = [...measurementPoints, latLng];
    setMeasurementPoints(newPoints);

    if (measurementMode === 'distance' && newPoints.length >= 2) {
      const distance = newPoints.reduce((total, point, index) => {
        if (index === 0) return 0;
        return total + GeoUtils.calculateDistance(newPoints[index - 1], point);
      }, 0);
      
      setMeasurements({ distance });
    } else if (measurementMode === 'area' && newPoints.length >= 3) {
      const area = GeoUtils.calculateArea(newPoints);
      setMeasurements({ area });
    }
  }, [measurementMode, measurementPoints]);

  const handleMeasurementModeChange = useCallback((mode: MeasurementMode) => {
    setMeasurementMode(mode);
    setMeasurementPoints([]);
    setMeasurements({});
  }, []);

  const clearMeasurements = useCallback(() => {
    setMeasurementPoints([]);
    setMeasurements({});
    setMeasurementMode(null);
  }, []);

  // Manejo de clicks en features GeoJSON
  const handleGeoJSONClick = useCallback((feature: any, layer: any) => {
    const center = layer.getBounds().getCenter();
    setSelectedFeature(feature);
    onFeatureClick?.(feature, center);
  }, [setSelectedFeature, onFeatureClick]);

  // Estilo por defecto para GeoJSON
  const geoJsonStyle = useCallback((feature: any) => {
    const geometry = feature.geometry;
    
    if (geometry.type === 'Point') {
      return GIS_CONSTANTS.DEFAULT_STYLES.POINT;
    } else if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
      return GIS_CONSTANTS.DEFAULT_STYLES.LINE;
    } else {
      return GIS_CONSTANTS.DEFAULT_STYLES.POLYGON;
    }
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Mapa principal */}
      <MapContainer
        center={currentEnvironment.mapConfig.center}
        zoom={currentEnvironment.mapConfig.zoom}
        className="w-full h-full"
        ref={mapRef}
      >
        {/* Eventos del mapa */}
        <MapEvents
          onMouseMove={handleMouseMove}
          onMeasurementClick={handleMeasurementClick}
          measurementMode={measurementMode}
        />
        
        {/* Capa base */}
        {layers.find(l => l.id === 'osm')?.visible && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
        
        {/* Capas WMS */}
        {wmsLayers.map(wmsLayer => {
          const layerInfo = layers.find(l => l.id === wmsLayer.layers);
          return layerInfo?.visible ? (
            <WMSTileLayer
              key={wmsLayer.layers}
              url={wmsLayer.url}
              layers={wmsLayer.layers}
              format="image/png"
              transparent={true}
            />
          ) : null;
        })}
        
        {/* GeoJSON */}
        {geoJsonData && (
          <GeoJSON
            key={JSON.stringify(geoJsonData)}
            data={geoJsonData}
            style={geoJsonStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => handleGeoJSONClick(feature, layer)
              });
              
              // Popup con propiedades
              if (feature.properties) {
                const popupContent = Object.entries(feature.properties)
                  .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                  .join('<br/>');
                layer.bindPopup(popupContent);
              }
            }}
          />
        )}
        
        {/* Puntos de medición */}
        {measurementPoints.map((point, index) => (
          <Marker key={index} position={point}>
            <Popup>
              Punto de medición {index + 1}<br/>
              {GeoUtils.formatCoordinates(point.lat, point.lng)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Controles superpuestos */}
      <div className="absolute top-4 left-4 z-[1000] space-y-4">
        <LayerControl
          layers={layers}
          onLayerToggle={handleLayerToggle}
        />
        
        <MeasurementTools
          onModeChange={handleMeasurementModeChange}
          currentMode={measurementMode}
          measurements={measurements}
          onClear={clearMeasurements}
        />
      </div>

      {/* Display de coordenadas */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <CoordinateDisplay position={mapState.mousePosition} />
      </div>
    </div>
  );
};
