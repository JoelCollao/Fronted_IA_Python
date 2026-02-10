import React, { useState } from 'react';

export type MeasurementMode = 'distance' | 'area' | null;

interface MeasurementToolsProps {
  onModeChange: (mode: MeasurementMode) => void;
  currentMode: MeasurementMode;
  measurements: {
    distance?: number;
    area?: number;
  };
  onClear: () => void;
}

export const MeasurementTools: React.FC<MeasurementToolsProps> = ({
  onModeChange,
  currentMode,
  measurements,
  onClear
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Herramientas de Medición</h3>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={() => onModeChange(currentMode === 'distance' ? null : 'distance')}
            className={`px-3 py-2 rounded text-sm font-medium ${
              currentMode === 'distance'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📏 Distancia
          </button>
          
          <button
            onClick={() => onModeChange(currentMode === 'area' ? null : 'area')}
            className={`px-3 py-2 rounded text-sm font-medium ${
              currentMode === 'area'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📐 Área
          </button>
        </div>
        
        {(measurements.distance !== undefined || measurements.area !== undefined) && (
          <div className="border-t pt-3">
            <h4 className="font-medium text-gray-700 mb-2">Resultados:</h4>
            {measurements.distance !== undefined && (
              <p className="text-sm text-gray-600">
                Distancia: <span className="font-mono">{measurements.distance.toFixed(2)} km</span>
              </p>
            )}
            {measurements.area !== undefined && (
              <p className="text-sm text-gray-600">
                Área: <span className="font-mono">{measurements.area.toFixed(2)} km²</span>
              </p>
            )}
            
            <button
              onClick={onClear}
              className="mt-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
