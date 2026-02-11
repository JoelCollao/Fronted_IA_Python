import React, { useState } from 'react';
import { useMap } from '../../core/contexts/MapContext';
import { useSelection } from '../../core/contexts/SelectionContext';
import { useLayers } from '../../core/contexts/LayerContext';
import './SelectionTools.css';

interface SelectionToolsProps {
  onClose: () => void;
}

export const SelectionTools: React.FC<SelectionToolsProps> = ({ onClose }) => {
  const { map } = useMap();
  const { activeSelectionTool, setActiveSelectionTool, clearSelection, getSelectionCount } = useSelection();
  const { layers } = useLayers();

  const selectionCount = getSelectionCount();

  const handleToolSelect = (tool: 'click' | 'rectangle' | 'polygon') => {
    if (activeSelectionTool === tool) {
      setActiveSelectionTool(null);
    } else {
      setActiveSelectionTool(tool);
    }
  };

  return (
    <div className="floating-panel selection-tools">
      <div className="panel-header">
        <h3>🎯 Herramientas de Selección</h3>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="panel-content">
        <div className="tool-buttons">
          <button
            className={`tool-btn ${activeSelectionTool === 'click' ? 'active' : ''}`}
            onClick={() => handleToolSelect('click')}
          >
            👆 Selección por Click
          </button>
          <button
            className={`tool-btn ${activeSelectionTool === 'rectangle' ? 'active' : ''}`}
            onClick={() => handleToolSelect('rectangle')}
          >
            ▭ Selección por Rectángulo
          </button>
          <button
            className={`tool-btn ${activeSelectionTool === 'polygon' ? 'active' : ''}`}
            onClick={() => handleToolSelect('polygon')}
          >
            ▽ Selección por Polígono
          </button>
        </div>

        <div className="selection-info">
          <div className="info-row">
            <span>Elementos seleccionados:</span>
            <strong>{selectionCount}</strong>
          </div>
          <div className="info-row">
            <span>Capas activas:</span>
            <strong>{layers.filter(l => l.visible).length}</strong>
          </div>
        </div>

        <div className="selection-actions">
          <button
            className="tool-btn danger"
            onClick={() => clearSelection()}
            disabled={selectionCount === 0}
          >
            🗑️ Limpiar Selección
          </button>
        </div>

        {activeSelectionTool && (
          <div className="selection-instructions">
            <p>
              {activeSelectionTool === 'click' && 'Haz clic en elementos del mapa para seleccionarlos'}
              {activeSelectionTool === 'rectangle' && 'Arrastra para crear un rectángulo de selección'}
              {activeSelectionTool === 'polygon' && 'Haz clic para dibujar un polígono de selección'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
