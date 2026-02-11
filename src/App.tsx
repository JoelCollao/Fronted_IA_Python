import React, { useState, useRef, useEffect } from 'react';
import { MapProvider } from './core/contexts/MapContext';
import { LayerProvider } from './core/contexts/LayerContext';
import { SelectionProvider } from './core/contexts/SelectionContext';
import { Navbar } from './components/layout/Navbar';
import { LayerPanel } from './modules/LayerPanel/LayerPanel';
import { MapContainer } from './components/map/MapContainer';
import { useMap } from './core/contexts/MapContext';
import L from 'leaflet';
import './App.css';

export type ActiveTool = 
  | 'none'
  | 'measurement'
  | 'selection'
  | 'draw'
  | 'attributes'
  | 'bookmarks'
  | 'search';

// Herramientas de medición funcionales
const FunctionalMeasurementTools: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const { map } = useMap();
  const [mode, setMode] = useState('');
  const [result, setResult] = useState('');
  const [isActive, setIsActive] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const polygonsRef = useRef<L.Polygon[]>([]);
  const currentPathRef = useRef<L.LatLng[]>([]);

  const clearMeasurements = () => {
    if (!map) return;
    
    markersRef.current.forEach(marker => map.removeLayer(marker));
    polylinesRef.current.forEach(polyline => map.removeLayer(polyline));
    polygonsRef.current.forEach(polygon => map.removeLayer(polygon));
    
    markersRef.current = [];
    polylinesRef.current = [];
    polygonsRef.current = [];
    currentPathRef.current = [];
    setResult('');
    setIsActive(false);
  };

  const handleMeasureDistance = () => {
    if (!map) return;
    clearMeasurements();
    setMode('distancia');
    setResult('Haz clic en el mapa para empezar a medir distancia...');
    setIsActive(true);

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      currentPathRef.current.push(e.latlng);

      // Agregar marcador
      const marker = L.marker([lat, lng]).addTo(map);
      markersRef.current.push(marker);

      if (currentPathRef.current.length > 1) {
        // Crear línea
        const polyline = L.polyline(currentPathRef.current, {
          color: 'red',
          weight: 3
        }).addTo(map);
        polylinesRef.current.push(polyline);

        // Calcular distancia total
        let totalDistance = 0;
        for (let i = 1; i < currentPathRef.current.length; i++) {
          totalDistance += currentPathRef.current[i-1].distanceTo(currentPathRef.current[i]);
        }

        const distance = totalDistance > 1000 
          ? `${(totalDistance / 1000).toFixed(2)} km`
          : `${totalDistance.toFixed(2)} m`;
        
        setResult(`Distancia total: ${distance}. Doble clic para terminar.`);
      }
    };

    const onDoubleClick = () => {
      setResult(`Medición finalizada: ${result.split(':')[1] || 'N/A'}`);
      setIsActive(false);
      map.off('click', onMapClick);
      map.off('dblclick', onDoubleClick);
    };

    map.on('click', onMapClick);
    map.on('dblclick', onDoubleClick);
  };

  const handleMeasureArea = () => {
    if (!map) return;
    clearMeasurements();
    setMode('área');
    setResult('Haz clic en el mapa para delimitar un área...');
    setIsActive(true);

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      currentPathRef.current.push(e.latlng);

      // Agregar marcador
      const marker = L.marker([lat, lng]).addTo(map);
      markersRef.current.push(marker);

      if (currentPathRef.current.length > 2) {
        // Crear polígono temporal
        polygonsRef.current.forEach(p => map.removeLayer(p));
        polygonsRef.current = [];

        const polygon = L.polygon(currentPathRef.current, {
          color: 'blue',
          weight: 2,
          fillOpacity: 0.1
        }).addTo(map);
        polygonsRef.current.push(polygon);

        // Calcular área
        const area = L.GeometryUtil.geodesicArea(currentPathRef.current);
        const areaText = area > 10000 
          ? `${(area / 10000).toFixed(2)} hectáreas`
          : `${area.toFixed(2)} m²`;
        
        setResult(`Área: ${areaText}. Doble clic para terminar.`);
      }
    };

    const onDoubleClick = () => {
      if (currentPathRef.current.length > 2) {
        // Crear polígono final
        polygonsRef.current.forEach(p => map.removeLayer(p));
        const finalPolygon = L.polygon(currentPathRef.current, {
          color: 'blue',
          weight: 3,
          fillOpacity: 0.2
        }).addTo(map);
        polygonsRef.current = [finalPolygon];
        
        const area = L.GeometryUtil.geodesicArea(currentPathRef.current);
        const areaText = area > 10000 
          ? `${(area / 10000).toFixed(2)} hectáreas`
          : `${area.toFixed(2)} m²`;
        
        setResult(`Medición finalizada - Área: ${areaText}`);
      }
      setIsActive(false);
      map.off('click', onMapClick);
      map.off('dblclick', onDoubleClick);
    };

    map.on('click', onMapClick);
    map.on('dblclick', onDoubleClick);
  };

  useEffect(() => {
    return () => {
      if (map) {
        map.off('click');
        map.off('dblclick');
      }
      clearMeasurements();
    };
  }, [map]);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 500,
      minWidth: '280px',
      color: '#333'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>📏 Herramientas de Medición</h4>
        <button onClick={() => {
          clearMeasurements();
          onClose();
        }} style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          fontSize: '18px',
          color: '#666'
        }}>×</button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleMeasureDistance}
          disabled={isActive && mode !== 'distancia'}
          style={{ 
            margin: '5px', 
            padding: '10px 15px', 
            border: '1px solid #007cba', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: (isActive && mode === 'distancia') ? '#007cba' : 'white',
            color: (isActive && mode === 'distancia') ? 'white' : '#007cba',
            opacity: (isActive && mode !== 'distancia') ? 0.5 : 1
          }}
        >
          📐 Medir Distancia
        </button>
        <button 
          onClick={handleMeasureArea}
          disabled={isActive && mode !== 'área'}
          style={{ 
            margin: '5px', 
            padding: '10px 15px', 
            border: '1px solid #007cba', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: (isActive && mode === 'área') ? '#007cba' : 'white',
            color: (isActive && mode === 'área') ? 'white' : '#007cba',
            opacity: (isActive && mode !== 'área') ? 0.5 : 1
          }}
        >
          📐 Medir Área
        </button>
        <button 
          onClick={clearMeasurements}
          style={{ 
            margin: '5px', 
            padding: '10px 15px', 
            border: '1px solid #dc3545', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: 'white',
            color: '#dc3545'
          }}
        >
          🗑️ Limpiar
        </button>
      </div>
      
      {result && (
        <div style={{
          padding: '10px',
          backgroundColor: isActive ? '#fff3cd' : '#d1ecf1',
          borderRadius: '4px',
          color: '#333',
          fontSize: '14px',
          border: `1px solid ${isActive ? '#ffeaa7' : '#bee5eb'}`
        }}>
          <strong>Estado:</strong> {result}
        </div>
      )}
    </div>
  );
};

// Herramientas de selección FUNCIONALES
const FunctionalSelectionTools: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const { map } = useMap();
  const { layers } = useLayers();
  const [mode, setMode] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(false);
  const selectionLayerRef = useRef<L.LayerGroup | null>(null);

  const clearSelections = () => {
    if (selectionLayerRef.current && map) {
      map.removeLayer(selectionLayerRef.current);
      selectionLayerRef.current = null;
    }
    setSelectedFeatures([]);
    setIsActive(false);
  };

  const handleClickSelection = () => {
    if (!map) return;
    clearSelections();
    setMode('clic');
    setIsActive(true);

    // Crear capa para mostrar selecciones
    selectionLayerRef.current = L.layerGroup().addTo(map);

    const onMapClick = (e: L.LeafletMouseEvent) => {
      console.log('Clic en:', e.latlng);
      
      // Buscar features en las capas cargadas
      const clickedFeatures: any[] = [];
      
      layers.forEach(layer => {
        if (layer.data?.features) {
          layer.data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Point') {
              const [lng, lat] = feature.geometry.coordinates;
              const distance = e.latlng.distanceTo([lat, lng]);
              
              // Si está cerca del clic (dentro de 100 metros)
              if (distance < 100) {
                clickedFeatures.push({
                  ...feature,
                  layerName: layer.name,
                  distance: distance
                });
              }
            }
          });
        }
      });

      if (clickedFeatures.length > 0) {
        // Agregar marcador de selección
        const selectionMarker = L.circleMarker(e.latlng, {
          radius: 8,
          fillColor: '#ffff00',
          color: '#ff8800',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.7
        }).bindPopup(`
          <div style="color: #333;">
            <h4 style="color: #ff8800;">🎯 Elementos Seleccionados</h4>
            ${clickedFeatures.map(f => `
              <div style="margin: 5px 0; padding: 5px; background: #f9f9f9; border-radius: 3px;">
                <strong>${f.properties.name || 'Sin nombre'}</strong><br/>
                <small>Capa: ${f.layerName}</small><br/>
                <small>Distancia: ${f.distance.toFixed(1)}m</small>
              </div>
            `).join('')}
          </div>
        `);
        
        selectionLayerRef.current?.addLayer(selectionMarker);
        setSelectedFeatures(prev => [...prev, ...clickedFeatures]);
        
        selectionMarker.openPopup();
      }
    };

    map.on('click', onMapClick);

    // Cleanup cuando se desactiva
    const cleanup = () => {
      map.off('click', onMapClick);
      setIsActive(false);
    };

    // Auto cleanup en 30 segundos
    setTimeout(cleanup, 30000);
  };

  const handleRectSelection = () => {
    if (!map) return;
    clearSelections();
    setMode('rectangular');
    setIsActive(true);

    // Crear capa para selección rectangular
    selectionLayerRef.current = L.layerGroup().addTo(map);
    
    let startPoint: L.LatLng | null = null;
    let selectionRect: L.Rectangle | null = null;

    const onMouseDown = (e: L.LeafletMouseEvent) => {
      startPoint = e.latlng;
    };

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      if (!startPoint) return;
      
      if (selectionRect) {
        selectionLayerRef.current?.removeLayer(selectionRect);
      }
      
      const bounds = L.latLngBounds(startPoint, e.latlng);
      selectionRect = L.rectangle(bounds, {
        color: '#ff8800',
        weight: 2,
        fillOpacity: 0.1
      });
      
      selectionLayerRef.current?.addLayer(selectionRect);
    };

    const onMouseUp = (e: L.LeafletMouseEvent) => {
      if (!startPoint) return;
      
      const bounds = L.latLngBounds(startPoint, e.latlng);
      const selectedFeatures: any[] = [];
      
      // Buscar features dentro del rectángulo
      layers.forEach(layer => {
        if (layer.data?.features) {
          layer.data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Point') {
              const [lng, lat] = feature.geometry.coordinates;
              if (bounds.contains([lat, lng])) {
                selectedFeatures.push({
                  ...feature,
                  layerName: layer.name
                });
              }
            }
          });
        }
      });

      if (selectedFeatures.length > 0) {
        setSelectedFeatures(selectedFeatures);
        
        // Mostrar popup con resultados
        const popup = L.popup({
          maxWidth: 300
        })
        .setLatLng(bounds.getCenter())
        .setContent(`
          <div style="color: #333;">
            <h4 style="color: #ff8800;">🎯 Selección Rectangular</h4>
            <p><strong>${selectedFeatures.length} elementos seleccionados</strong></p>
            ${selectedFeatures.slice(0, 3).map(f => `
              <div style="margin: 3px 0; font-size: 12px;">
                • ${f.properties.name || 'Sin nombre'} (${f.layerName})
              </div>
            `).join('')}
            ${selectedFeatures.length > 3 ? '<div style="font-size: 12px; color: #666;">... y más</div>' : ''}
          </div>
        `)
        .openOn(map);
      }
      
      // Cleanup
      map.off('mousedown', onMouseDown);
      map.off('mousemove', onMouseMove);
      map.off('mouseup', onMouseUp);
      setIsActive(false);
    };

    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 500,
      minWidth: '280px',
      color: '#ecf011'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>🎯 Herramientas de Selección</h4>
        <button onClick={() => {
          clearSelections();
          onClose();
        }} style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          fontSize: '18px',
          color: '#666'
        }}>×</button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleClickSelection}
          disabled={isActive && mode !== 'clic'}
          style={{ 
            margin: '5px', 
            padding: '10px 15px', 
            border: '1px solid #28a745', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: (isActive && mode === 'clic') ? '#28a745' : 'white',
            color: (isActive && mode === 'clic') ? 'white' : '#28a745',
            opacity: (isActive && mode !== 'clic') ? 0.5 : 1
          }}
        >
          👆 Seleccionar por Clic
        </button>
        <button 
          onClick={handleRectSelection}
          disabled={isActive && mode !== 'rectangular'}
          style={{ 
            margin: '5px', 
            padding: '10px 15px', 
            border: '1px solid #28a745', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: (isActive && mode === 'rectangular') ? '#28a745' : 'white',
            color: (isActive && mode === 'rectangular') ? 'white' : '#28a745',
            opacity: (isActive && mode !== 'rectangular') ? 0.5 : 1
          }}
        >
          ⬜ Selección Rectangular
        </button>
        <button 
          onClick={clearSelections}
          style={{ 
            margin: '5px', 
            padding: '10px 15px', 
            border: '1px solid #dc3545', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: 'white',
            color: '#dc3545'
          }}
        >
          🗑️ Limpiar Selección
        </button>
      </div>
      
      {selectedFeatures.length > 0 && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          color: '#333',
          fontSize: '14px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>✅ Seleccionados:</strong> {selectedFeatures.length} elementos<br/>
          {isActive && <small>🔄 Modo activo: {mode}</small>}
        </div>
      )}
    </div>
  );
};

// Panel de bookmarks/vistas FUNCIONAL
const FunctionalBookmarksPanel: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const { map } = useMap();
  const [bookmarks, setBookmarks] = useState<Array<{
    id: string;
    name: string;
    center: [number, number];
    zoom: number;
    timestamp: string;
  }>>([]);

  const saveCurrentView = () => {
    if (!map) return;
    
    const center = map.getCenter();
    const zoom = map.getZoom();
    const timestamp = new Date().toLocaleString('es-ES');
    
    const newBookmark = {
      id: `bookmark_${Date.now()}`,
      name: `Vista ${bookmarks.length + 1}`,
      center: [center.lat, center.lng] as [number, number],
      zoom: zoom,
      timestamp: timestamp
    };

    setBookmarks(prev => [...prev, newBookmark]);
    
    // Mostrar confirmación temporal
    const popup = L.popup({
      closeButton: false,
      autoClose: true,
      autoPan: false
    })
    .setLatLng(center)
    .setContent(`
      <div style="color: #333; text-align: center;">
        <strong>✅ Vista guardada</strong><br/>
        <small>${timestamp}</small>
      </div>
    `)
    .openOn(map);

    setTimeout(() => {
      map.closePopup(popup);
    }, 2000);
  };

  const goToBookmark = (bookmark: any) => {
    if (!map) return;
    
    map.setView(bookmark.center, bookmark.zoom, {
      animate: true,
      duration: 1.5
    });

    // Mostrar popup en la vista restaurada
    setTimeout(() => {
      L.popup({
        closeButton: false,
        autoClose: true,
        autoPan: false
      })
      .setLatLng(bookmark.center)
      .setContent(`
        <div style="color: #333; text-align: center;">
          <strong>📌 ${bookmark.name}</strong><br/>
          <small>Guardado: ${bookmark.timestamp}</small>
        </div>
      `)
      .openOn(map);
    }, 1500);
  };

  const deleteBookmark = (id: string) => {
    if (window.confirm('¿Eliminar esta vista guardada?')) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
    }
  };

  const renameBookmark = (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;
    
    const newName = prompt('Nuevo nombre para la vista:', bookmark.name);
    if (newName && newName.trim()) {
      setBookmarks(prev => prev.map(b => 
        b.id === id ? { ...b, name: newName.trim() } : b
      ));
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 500,
      minWidth: '320px',
      maxHeight: '400px',
      color: '#333',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>📌 Vistas Guardadas</h4>
        <button onClick={onClose} style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          fontSize: '18px',
          color: '#666'
        }}>×</button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={saveCurrentView}
          style={{ 
            padding: '10px 15px', 
            border: '1px solid #17a2b8', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: '#17a2b8',
            color: 'white',
            width: '100%',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}
        >
          💾 Guardar Vista Actual
        </button>
      </div>
      
      <div>
        {bookmarks.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '14px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📍</div>
            <p>No hay vistas guardadas</p>
            <small>Navega a una ubicación y guarda tu primera vista</small>
          </div>
        ) : (
          bookmarks.map((bookmark, index) => (
            <div key={bookmark.id} style={{
              padding: '10px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              marginBottom: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#333',
                marginBottom: '4px',
                cursor: 'pointer'
              }}
              onClick={() => goToBookmark(bookmark)}
              >
                📌 {bookmark.name}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666',
                marginBottom: '8px'
              }}>
                📅 {bookmark.timestamp}<br/>
                🗺️ Zoom: {bookmark.zoom.toFixed(1)} • Lat: {bookmark.center[0].toFixed(4)} • Lng: {bookmark.center[1].toFixed(4)}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => goToBookmark(bookmark)}
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    backgroundColor: '#28a745',
                    color: 'white'
                  }}
                >
                  🎯 Ir
                </button>
                <button 
                  onClick={() => renameBookmark(bookmark.id)}
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    backgroundColor: '#17a2b8',
                    color: 'white'
                  }}
                >
                  ✏️
                </button>
                <button 
                  onClick={() => deleteBookmark(bookmark.id)}
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    backgroundColor: '#dc3545',
                    color: 'white'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Búsqueda funcional
const FunctionalSearchPanel: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const { map } = useMap();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  const parseCoordinates = (input: string): [number, number] | null => {
    // Limpiar input
    const cleaned = input.replace(/[^\d.,\-\s]/g, '');
    
    // Intentar varios formatos
    const patterns = [
      /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/, // lat, lng o lat lng
      /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/, // lng, lat
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const num1 = parseFloat(match[1]);
        const num2 = parseFloat(match[2]);
        
        // Determinar si es lat,lng o lng,lat basado en rangos típicos
        if (Math.abs(num1) <= 90 && Math.abs(num2) <= 180) {
          // Primer número parece latitud
          return [num1, num2];
        } else if (Math.abs(num2) <= 90 && Math.abs(num1) <= 180) {
          // Segundo número parece latitud
          return [num2, num1];
        }
      }
    }
    return null;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || !map) return;

    setLoading(true);
    setResults([]);

    // Limpiar marcador anterior
    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    try {
      // Intentar parsear como coordenadas primero
      const coords = parseCoordinates(searchTerm);
      
      if (coords) {
        const [lat, lng] = coords;
        
        // Crear marcador en las coordenadas
        const searchIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        searchMarkerRef.current = L.marker([lat, lng], { icon: searchIcon })
          .bindPopup(`
            <div style="color: #333;">
              <h4 style="margin: 0 0 8px 0;">📍 Coordenadas encontradas</h4>
              <p style="margin: 0;"><strong>Latitud:</strong> ${lat.toFixed(6)}</p>
              <p style="margin: 0;"><strong>Longitud:</strong> ${lng.toFixed(6)}</p>
            </div>
          `)
          .addTo(map);

        // Navegar a las coordenadas
        map.setView([lat, lng], 16);
        searchMarkerRef.current.openPopup();
        
        setResults([`✅ Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`]);
      } else {
        // Buscar como nombre de lugar usando Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5&bounded=0&addressdetails=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.length > 0) {
            const searchResults = data.map((item: any) => 
              `${item.display_name} (${parseFloat(item.lat).toFixed(4)}, ${parseFloat(item.lon).toFixed(4)})`
            );
            setResults(searchResults);
            
            // Navegar al primer resultado
            const firstResult = data[0];
            const lat = parseFloat(firstResult.lat);
            const lng = parseFloat(firstResult.lon);
            
            // Crear marcador
            const searchIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            searchMarkerRef.current = L.marker([lat, lng], { icon: searchIcon })
              .bindPopup(`
                <div style="color: #333;">
                  <h4 style="margin: 0 0 8px 0;">🔍 ${firstResult.display_name}</h4>
                  <p style="margin: 0; font-size: 12px;"><strong>Coordenadas:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                </div>
              `)
              .addTo(map);

            map.setView([lat, lng], 14);
            searchMarkerRef.current.openPopup();
            
          } else {
            setResults(['❌ No se encontraron resultados']);
          }
        } else {
          throw new Error('Error en la búsqueda');
        }
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults(['❌ Error en la búsqueda. Verifique su conexión.']);
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = async (locationText: string) => {
    if (!map) return;
    
    // Extraer coordenadas del texto del resultado
    const coordMatch = locationText.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      map.setView([lat, lng], 16);
      
      if (searchMarkerRef.current) {
        searchMarkerRef.current.openPopup();
      }
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 500,
      minWidth: '320px',
      color: '#333'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>🔍 Búsqueda Geográfica</h4>
        <button onClick={() => {
          if (searchMarkerRef.current && map) {
            map.removeLayer(searchMarkerRef.current);
            searchMarkerRef.current = null;
          }
          onClose();
        }} style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          fontSize: '18px',
          color: '#666'
        }}>×</button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Ej: -12.0464, -77.0428 o Centro de Lima"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            marginBottom: '10px',
            boxSizing: 'border-box',
            color: '#333'
          }}
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          style={{ 
            padding: '10px 15px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            backgroundColor: loading ? '#ccc' : '#ffc107',
            color: '#333',
            width: '100%',
            opacity: loading || !searchTerm.trim() ? 0.6 : 1
          }}
        >
          {loading ? '🔄 Buscando...' : '🔍 Buscar'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Resultados:</h5>
          {results.map((result, index) => (
            <div 
              key={index}
              onClick={() => selectLocation(result)}
              style={{
                padding: '8px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                marginBottom: '5px',
                cursor: result.startsWith('✅') ? 'pointer' : result.startsWith('❌') ? 'default' : 'pointer',
                color: '#333',
                backgroundColor: result.startsWith('❌') ? '#f8d7da' : '#f8f9fa',
                fontSize: '13px'
              }}
            >
              {result}
            </div>
          ))}
        </div>
      )}
      
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e7f3ff',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#333'
      }}>
        <strong>💡 Ejemplos de búsqueda:</strong><br/>
        • <strong>Coordenadas:</strong> -12.0464, -77.0428<br/>
        • <strong>Lugares:</strong> Plaza de Armas Lima<br/>
        • <strong>Direcciones:</strong> Av. Larco Miraflores
      </div>
    </div>
  );
};

const SimpleAttributeTable: React.FC<{onClose: () => void}> = ({ onClose }) => (
  <div style={{
    position: 'absolute',
    bottom: 0,
    left: '320px',
    right: 0,
    height: '300px',
    background: 'white',
    borderTop: '2px solid #e0e0e0',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
    zIndex: 500,
    display: 'flex',
    flexDirection: 'column',
    color: '#333'
  }}>
    <div style={{ 
      padding: '10px 15px', 
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#f5f5f5'
    }}>
      <h4 style={{ margin: 0, color: '#333' }}>📊 Tabla de Atributos</h4>
      <button onClick={onClose} style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        fontSize: '18px',
        color: '#666'
      }}>×</button>
    </div>
    <div style={{ flex: 1, padding: '15px', color: '#333' }}>
      <p style={{ color: '#666' }}>No hay capas seleccionadas para mostrar atributos.</p>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Agrega una capa y selecciona elementos para ver sus atributos aquí.
      </p>
    </div>
  </div>
);

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
        overflow: 'hidden',
        position: 'relative'
      }}>
        <LayerPanel />
        
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <MapContainer />
          
          {/* Herramientas flotantes según tool activo */}
          {activeTool === 'measurement' && (
            <FunctionalMeasurementTools onClose={() => setActiveTool('none')} />
          )}
          
          {activeTool === 'selection' && (
            <FunctionalSelectionTools onClose={() => setActiveTool('none')} />
          )}
          
          {activeTool === 'bookmarks' && (
            <FunctionalBookmarksPanel onClose={() => setActiveTool('none')} />
          )}
          
          {activeTool === 'search' && (
            <FunctionalSearchPanel onClose={() => setActiveTool('none')} />
          )}
        </div>
        
        {/* Tabla de atributos en la parte inferior */}
        {showAttributeTable && (
          <SimpleAttributeTable onClose={() => setShowAttributeTable(false)} />
        )}
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