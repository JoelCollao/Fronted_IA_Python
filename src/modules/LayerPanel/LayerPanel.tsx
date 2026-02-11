import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useLayers } from '../../core/contexts/LayerContext';
import { useMap } from '../../core/contexts/MapContext';
import { LayerItem } from './LayerItem';
import { LayerUploader } from './LayerUploader';
import './LayerPanel.css';

export const LayerPanel: React.FC = () => {
  const { layers, reorderLayers, activeLayerId, setActiveLayer } = useLayers();
  const { map } = useMap();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderLayers(result.source.index, result.destination.index);
  };

  return (
    <div className={`layer-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Header */}
      <div className="layer-panel-header">
        <h3>
          <i className="icon-layers"></i>
          Capas
        </h3>
        <div className="layer-panel-actions">
          <button 
            className="btn-icon"
            onClick={() => setShowUploader(!showUploader)}
            title="Agregar capa"
          >
            <i className="icon-plus"></i>
          </button>
          <button 
            className="btn-icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            <i className={`icon-chevron-${isExpanded ? 'left' : 'right'}`}></i>
          </button>
        </div>
      </div>

      {/* Uploader */}
      {showUploader && isExpanded && (
        <LayerUploader onClose={() => setShowUploader(false)} />
      )}

      {/* Lista de capas */}
      {isExpanded && (
        <div className="layer-panel-content">
          {layers.length === 0 ? (
            <div className="layer-panel-empty">
              <p>No hay capas activas</p>
              <button 
                className="btn-primary"
                onClick={() => setShowUploader(true)}
              >
                Agregar primera capa
              </button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="layers">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="layer-list"
                  >
                    {layers.map((layer, index) => (
                      <Draggable
                        key={layer.id}
                        draggableId={layer.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'dragging' : ''}
                          >
                            <LayerItem
                              layer={layer}
                              isActive={layer.id === activeLayerId}
                              onActivate={() => setActiveLayer(layer.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      )}
    </div>
  );
};
