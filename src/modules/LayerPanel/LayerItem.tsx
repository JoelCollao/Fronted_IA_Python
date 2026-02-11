import React, { useState } from 'react';
import { Layer } from '../../core/types/gis.types';
import { useLayers } from '../../core/contexts/LayerContext';
import { useMap } from '../../core/contexts/MapContext';

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  onActivate: () => void;
}

export const LayerItem: React.FC<LayerItemProps> = ({ layer, isActive, onActivate }) => {
  const { toggleLayerVisibility, setLayerOpacity, removeLayer, updateLayer } = useLayers();
  const { fitBounds } = useMap();
  const [showOptions, setShowOptions] = useState(false);

  const handleZoomTo = () => {
    if (layer.bounds) {
      fitBounds([
        [layer.bounds.getSouth(), layer.bounds.getWest()],
        [layer.bounds.getNorth(), layer.bounds.getEast()]
      ]);
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    setLayerOpacity(layer.id, opacity);
  };

  return (
    <div className={`layer-item ${isActive ? 'active' : ''}`} onClick={onActivate}>
      {/* Drag handle */}
      <div className="layer-drag-handle">
        <i className="icon-drag"></i>
      </div>

      {/* Visibility toggle */}
      <button
        className="layer-visibility"
        onClick={(e) => {
          e.stopPropagation();
          toggleLayerVisibility(layer.id);
        }}
        title={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
      >
        <i className={`icon-eye${layer.visible ? '' : '-off'}`}></i>
      </button>

      {/* Layer info */}
      <div className="layer-info">
        <div className="layer-name">{layer.name}</div>
        <div className="layer-meta">
          {layer.type} • {layer.metadata?.featureCount || 0} elementos
        </div>
      </div>

      {/* Actions */}
      <div className="layer-actions">
        <button
          className="btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          title="Opciones"
        >
          <i className="icon-more"></i>
        </button>
      </div>

      {/* Options panel */}
      {showOptions && (
        <div className="layer-options" onClick={(e) => e.stopPropagation()}>
          {/* Opacity control */}
          <div className="layer-option">
            <label>Opacidad: {Math.round(layer.opacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layer.opacity}
              onChange={handleOpacityChange}
            />
          </div>

          {/* Action buttons */}
          <div className="layer-option-buttons">
            <button
              className="btn-secondary"
              onClick={handleZoomTo}
              disabled={!layer.bounds}
            >
              <i className="icon-zoom"></i>
              Zoom a capa
            </button>
            <button
              className="btn-danger"
              onClick={() => removeLayer(layer.id)}
            >
              <i className="icon-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
