import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { LayerPanel } from '../../modules/LayerPanel/LayerPanel';
import { MapContainer } from '../map/MapContainer';
import { AttributeTable } from '../../modules/AttributeTable/AttributeTable';
import { MeasurementTools } from '../../modules/MeasurementTools/MeasurementTools';
import { SelectionTools } from '../../modules/SelectionTools/SelectionTools';
import { BookmarksPanel } from '../../modules/Bookmarks/BookmarksPanel';
import { SearchPanel } from '../../modules/Search/SearchPanel';
import './MainLayout.css';

export type ActiveTool =
  | 'none'
  | 'measurement'
  | 'selection'
  | 'draw'
  | 'attributes'
  | 'bookmarks'
  | 'search';

export const MainLayout: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [showAttributeTable, setShowAttributeTable] = useState(false);

  const handleToolChange = (tool: ActiveTool) => {
    // Si es tabla de atributos, toggle en la parte inferior
    if (tool === 'attributes') {
      setShowAttributeTable(!showAttributeTable);
      return;
    }

    // Para otras herramientas, toggle normal
    setActiveTool(activeTool === tool ? 'none' : tool);
  };

  return (
    <div className="main-layout">
      {/* Navbar Superior */}
      <Navbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        showAttributeTable={showAttributeTable}
      />

      {/* Contenedor principal */}
      <div className="layout-content">
        {/* Panel lateral izquierdo - TOC */}
        <LayerPanel />

        {/* Área del mapa y herramientas */}
        <div className="map-area">
          {/* Mapa base */}
          <MapContainer />

          {/* Herramientas flotantes según tool activo */}
          {activeTool === 'measurement' && (
            <MeasurementTools onClose={() => setActiveTool('none')} />
          )}

          {activeTool === 'selection' && <SelectionTools onClose={() => setActiveTool('none')} />}

          {activeTool === 'bookmarks' && <BookmarksPanel onClose={() => setActiveTool('none')} />}

          {activeTool === 'search' && <SearchPanel onClose={() => setActiveTool('none')} />}

          {/* Tabla de atributos en la parte inferior */}
          {showAttributeTable && (
            <div className="bottom-panel">
              <AttributeTable onClose={() => setShowAttributeTable(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
