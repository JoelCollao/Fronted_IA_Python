import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from '../../core/contexts/MapContext';
import './MapContainer.css';

// Fix para iconos de Leaflet - Usando URLs directas en lugar de require()
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapContainerProps {
  className?: string;
  style?: React.CSSProperties;
}

export const MapContainer: React.FC<MapContainerProps> = ({ className, style }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { setMap, mapState, updateMapState } = useMap();
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inicializar mapa
    const map = L.map(mapRef.current, {
      center: mapState.center as [number, number],
      zoom: mapState.zoom,
      zoomControl: false, // Lo añadiremos en una posición personalizada
    });

    // Añadir capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Añadir control de zoom personalizado
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Guardar referencia del mapa
    mapInstanceRef.current = map;
    setMap(map);

    // Event listeners
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      updateMapState({
        center: [center.lat, center.lng],
        zoom: zoom,
      });
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, [setMap, updateMapState]); // ✅ SOLO estas dos dependencias

  return (
    <div
      ref={mapRef}
      className={`map-container ${className || ''}`}
      style={{ height: '100%', width: '100%', ...style }}
    />
  );
};
