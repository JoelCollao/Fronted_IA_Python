import React from 'react';
import { MapContainer as LeafletMap } from './MapContainer';

interface MapViewProps {
  geoJsonData?: any;
  wmsLayers?: Array<{ url: string; layers: string; name: string; visible: boolean }>;
  onFeatureClick?: (feature: any, latLng: any) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({ className }) => {
  return (
    <div className={className}>
      <LeafletMap />
    </div>
  );
};
