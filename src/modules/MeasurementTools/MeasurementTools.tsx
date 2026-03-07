import React, { useState, useEffect } from 'react';
import { useMap } from '../../core/contexts/MapContext';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MeasurementTools.css';

interface MeasurementToolsProps {
  onClose: () => void;
}

type MeasurementMode = 'distance' | 'area' | null;

export const MeasurementTools: React.FC<MeasurementToolsProps> = ({ onClose }) => {
  const { map } = useMap();
  const [mode, setMode] = useState<MeasurementMode>(null);
  const [result, setResult] = useState<string>('');
  const [drawnItems] = useState(new L.FeatureGroup());

  useEffect(() => {
    if (!map) return;

    map.addLayer(drawnItems);

    return () => {
      map.removeLayer(drawnItems);
      drawnItems.clearLayers();
    };
  }, [map, drawnItems]);

  const startMeasurement = (measureMode: MeasurementMode) => {
    if (!map) return;

    // Limpiar mediciones anteriores
    drawnItems.clearLayers();
    setResult('');
    setMode(measureMode);

    if (measureMode === 'distance') {
      const polyline = new L.Polyline([], {
        color: '#1976d2',
        weight: 3,
        opacity: 0.8,
      });

      drawnItems.addLayer(polyline);

      const points: L.LatLng[] = [];

      const handleClick = (e: L.LeafletMouseEvent) => {
        points.push(e.latlng);
        polyline.addLatLng(e.latlng);

        if (points.length > 1) {
          let totalDistance = 0;
          for (let i = 0; i < points.length - 1; i++) {
            totalDistance += points[i].distanceTo(points[i + 1]);
          }

          const km = (totalDistance / 1000).toFixed(2);
          const m = totalDistance.toFixed(2);
          setResult(`Distancia: ${totalDistance > 1000 ? km + ' km' : m + ' m'}`);
        }
      };

      map.on('click', handleClick);
      map.once('dblclick', () => {
        map.off('click', handleClick);
      });
    } else if (measureMode === 'area') {
      const polygon = new L.Polygon([], {
        color: '#1976d2',
        fillColor: '#1976d2',
        fillOpacity: 0.2,
        weight: 3,
      });

      drawnItems.addLayer(polygon);

      const points: L.LatLng[] = [];

      const handleClick = (e: L.LeafletMouseEvent) => {
        points.push(e.latlng);
        polygon.addLatLng(e.latlng);

        if (points.length > 2) {
          const area = L.GeometryUtil.geodesicArea(points);
          const km2 = (area / 1000000).toFixed(2);
          const m2 = area.toFixed(2);
          const ha = (area / 10000).toFixed(2);

          if (area > 1000000) {
            setResult(`Área: ${km2} km²`);
          } else if (area > 10000) {
            setResult(`Área: ${ha} ha`);
          } else {
            setResult(`Área: ${m2} m²`);
          }
        }
      };

      map.on('click', handleClick);
      map.once('dblclick', () => {
        map.off('click', handleClick);
      });
    }
  };

  const clearMeasurements = () => {
    drawnItems.clearLayers();
    setResult('');
    setMode(null);
  };

  return (
    <div className="floating-panel measurement-tools">
      <div className="panel-header">
        <h3>🔧 Herramientas de Medición</h3>
        <button className="btn-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="panel-content">
        <div className="tool-buttons">
          <button
            className={`tool-btn ${mode === 'distance' ? 'active' : ''}`}
            onClick={() => startMeasurement('distance')}
          >
            📏 Medir Distancia
          </button>
          <button
            className={`tool-btn ${mode === 'area' ? 'active' : ''}`}
            onClick={() => startMeasurement('area')}
          >
            📐 Medir Área
          </button>
          <button className="tool-btn danger" onClick={clearMeasurements}>
            🗑️ Limpiar
          </button>
        </div>

        {result && (
          <div className="measurement-result">
            <strong>Resultado:</strong>
            <p>{result}</p>
          </div>
        )}

        {mode && (
          <div className="measurement-instructions">
            <p>
              {mode === 'distance'
                ? 'Haz clic en el mapa para añadir puntos. Doble clic para finalizar.'
                : 'Haz clic para dibujar un polígono. Doble clic para finalizar.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
