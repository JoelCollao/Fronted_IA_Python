import React, { useState } from 'react';
import { MapProvider } from './core/contexts/MapContext';
import { LayerProvider } from './core/contexts/LayerContext';
import { SelectionProvider } from './core/contexts/SelectionContext';
import { Navbar } from './components/layout/Navbar';
import { MapContainer } from './components/map/MapContainer';
import './App.css';

export type ActiveTool = 
  | 'none'
  | 'measurement'
  | 'selection'
  | 'draw'
  | 'attributes'
  | 'bookmarks'
  | 'search';

// LayerPanel simple (mantenemos este por ahora)
const SimpleLayerPanel: React.FC = () => {
  return (
    <div style={{
      width: '300px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e0e0e0',
      padding: '15px',
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ marginBottom: '15px', color: '#333' }}>Capas</h4>
      <div style={{ color: '#666' }}>
        <p>• Panel de capas funcionando</p>
        <p>• Mapa centrado en Lima</p>
        <p>• Navbar original restaurado</p>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [showAttributeTable, setShowAttributeTable] = useState(false);

  const handleToolChange = (tool: ActiveTool) => {
    if (tool === 'attributes') {
      setShowAttributeTable(!showAttributeTable);
      return;
    }
    setActiveTool(activeTool === tool ? 'none' : tool);
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5'
    }}>
      <Navbar 
        activeTool={activeTool}
        onToolChange={handleToolChange}
        showAttributeTable={showAttributeTable}
      />
      
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        <SimpleLayerPanel />
        
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <MapContainer />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <MapProvider>
      <LayerProvider>
        <SelectionProvider>
          <MainLayout />
        </SelectionProvider>
      </LayerProvider>
    </MapProvider>
  );
}

export default App;