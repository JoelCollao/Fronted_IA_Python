import React from 'react';
import { LatLng } from 'leaflet';
import { GeoUtils } from '@core/utils/geoUtils';

interface CoordinateDisplayProps {
  position: LatLng | null;
  format?: 'decimal' | 'dms';
}

export const CoordinateDisplay: React.FC<CoordinateDisplayProps> = ({ 
  position, 
  format = 'decimal' 
}) => {
  if (!position) {
    return (
      <div className="bg-white px-3 py-1 rounded shadow text-sm">
        Mueva el cursor sobre el mapa
      </div>
    );
  }

  const displayText = format === 'decimal' 
    ? GeoUtils.formatCoordinates(position.lat, position.lng)
    : `${GeoUtils.toDMS(position.lat, true)}, ${GeoUtils.toDMS(position.lng, false)}`;

  return (
    <div className="bg-white px-3 py-1 rounded shadow text-sm font-mono">
      {displayText}
    </div>
  );
};
