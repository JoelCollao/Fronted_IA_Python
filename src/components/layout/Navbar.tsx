import React, { useState } from 'react';
import { ActiveTool } from './MainLayout';
import { useMap } from '../../core/contexts/MapContext';
import './Navbar.css';

interface NavbarProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  showAttributeTable: boolean;
}

interface NavItem {
  id: ActiveTool;
  label: string;
  icon: string;
  description: string;
}

const navigationItems: NavItem[] = [
  {
    id: 'measurement',
    label: 'Medición',
    icon: '📏',
    description: 'Medir distancias y áreas'
  },
  {
    id: 'selection',
    label: 'Selección',
    icon: '🎯',
    description: 'Herramientas de selección espacial'
  },
  {
    id: 'draw',
    label: 'Dibujo',
    icon: '✏️',
    description: 'Dibujar geometrías'
  },
  {
    id: 'attributes',
    label: 'Atributos',
    icon: '📊',
    description: 'Tabla de atributos'
  },
  {
    id: 'bookmarks',
    label: 'Vistas',
    icon: '📌',
    description: 'Gestionar vistas guardadas'
  },
  {
    id: 'search',
    label: 'Búsqueda',
    icon: '🔍',
    description: 'Buscar ubicaciones'
  }
];

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTool, 
  onToolChange,
  showAttributeTable 
}) => {
  const { map, mapState } = useMap();
  const [showMapControls, setShowMapControls] = useState(false);

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  const handleZoomToExtent = () => {
    if (map) {
      map.setView([0, 0], 2);
    }
  };

  const handleFullExtent = () => {
    if (map) {
      map.fitWorld();
    }
  };

  return (
    <nav className="main-navbar">
      {/* Logo y título */}
      <div className="navbar-brand">
        <div className="navbar-logo">🗺️</div>
        <h1 className="navbar-title">App GIS - DevJoel</h1>
      </div>

      {/* Herramientas principales */}
      <div className="navbar-tools">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`navbar-tool ${
              (item.id === 'attributes' && showAttributeTable) || 
              (activeTool === item.id) ? 'active' : ''
            }`}
            onClick={() => onToolChange(item.id)}
            title={item.description}
          >
            <span className="tool-icon">{item.icon}</span>
            <span className="tool-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Controles del mapa */}
      <div className="navbar-map-controls">
        <div className="map-controls-group">
          <button
            className="control-btn"
            onClick={handleZoomIn}
            title="Acercar"
          >
            <span>➕</span>
          </button>
          <button
            className="control-btn"
            onClick={handleZoomOut}
            title="Alejar"
          >
            <span>➖</span>
          </button>
          <button
            className="control-btn"
            onClick={handleFullExtent}
            title="Extensión completa"
          >
            <span>🌍</span>
          </button>
        </div>

        {/* Indicador de zoom */}
        <div className="zoom-indicator">
          <span className="zoom-label">Zoom:</span>
          <span className="zoom-value">{mapState.zoom.toFixed(1)}</span>
        </div>
      </div>

      {/* Menú adicional */}
      <div className="navbar-menu">
        <button 
          className="menu-btn"
          onClick={() => setShowMapControls(!showMapControls)}
          title="Más opciones"
        >
          <span>⚙️</span>
        </button>

        {showMapControls && (
          <div className="dropdown-menu">
            <button className="dropdown-item">
              <span>🗺️</span>
              Cambiar mapa base
            </button>
            <button className="dropdown-item">
              <span>📤</span>
              Exportar mapa
            </button>
            <button className="dropdown-item">
              <span>🖨️</span>
              Imprimir
            </button>
            <button className="dropdown-item">
              <span>ℹ️</span>
              Ayuda
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
