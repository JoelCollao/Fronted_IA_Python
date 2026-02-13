import React, { useState } from 'react';
import { useLayers } from '../../core/contexts/LayerContext';
import { useMap } from '../../core/contexts/MapContext';
import L from 'leaflet';

export const LayerPanel: React.FC = () => {
  const { layers, addLayer, removeLayer } = useLayers();
  const { map } = useMap();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !map) return;

    setLoading(true);
    setError(null);

    try {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (fileExtension === 'kml') {
        // Procesar archivo KML
        const text = await file.text();
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(text, 'application/xml');

        // Convertir KML a GeoJSON
        const geoJsonData = await kmlToGeoJSON(kmlDoc);

        console.log('GeoJSON data from KML:', geoJsonData);

        if (!geoJsonData.features || geoJsonData.features.length === 0) {
          throw new Error('No se encontraron elementos válidos en el archivo KML.');
        }

        // Array para guardar referencias de marcadores
        const createdMarkers: L.Layer[] = [];

        // Crear marcadores DIRECTAMENTE en el mapa (versión ultra-robusta)
        geoJsonData.features.forEach((feature: any, index: number) => {
          if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates;
            const name = feature.properties.name || `Punto ${index + 1}`;
            const description = feature.properties.description || 'Sin descripción';

            console.log(`Creando marcador ROBUSTO ${index + 1} en: ${lat}, ${lng}`);

            // OPCIÓN 1: Usar circleMarker (más robusto que divIcon)
            const circleMarker = L.circleMarker([lat, lng], {
              radius: 10,
              fillColor: '#ff0000',
              color: '#ffffff',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.9,
              // Configurar para que sea visible en todos los zoom levels
              interactive: true,
              bubblingMouseEvents: false
            });

            // OPCIÓN 2: Marcador estándar con ícono simple (respaldo)
            const standardIcon = L.icon({
              iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" fill="#ff0000" stroke="#ffffff" stroke-width="3"/>
          <text x="15" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">${index + 1}</text>
        </svg>
      `),
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              popupAnchor: [0, -15]
            });

            const standardMarker = L.marker([lat, lng], {
              icon: standardIcon,
              zIndexOffset: 10000,
              riseOnHover: true,
              riseOffset: 250
            });

            // Configurar popup para AMBOS marcadores
            const popupContent = `
      <div style="color: #333; min-width: 200px; max-width: 300px; font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 10px 0; color: #ff0000; border-bottom: 2px solid #ff0000; padding-bottom: 5px; font-size: 16px;">
          🔴 ${name}
        </h4>
        <p style="margin: 4px 0 10px 0; color: #444; line-height: 1.4; font-size: 14px;">
          ${description}
        </p>
        <div style="background: #f0f0f0; padding: 8px; border-radius: 4px; font-size: 12px; color: #666; border-left: 3px solid #ff0000;">
          📄 <strong>${fileName}</strong><br/>
          📍 <strong>Coordenadas:</strong><br/>
          &nbsp;&nbsp;&nbsp;Lat: ${lat.toFixed(6)}<br/>
          &nbsp;&nbsp;&nbsp;Lng: ${lng.toFixed(6)}<br/>
          🏷️ Marcador ${index + 1} de ${geoJsonData.features.length}
        </div>
      </div>
    `;

            circleMarker.bindPopup(popupContent, {
              maxWidth: 300,
              className: 'kml-popup-circle'
            });

            standardMarker.bindPopup(popupContent, {
              maxWidth: 300,
              className: 'kml-popup-standard'
            });

            // Agregar AMBOS marcadores al mapa
            circleMarker.addTo(map);
            standardMarker.addTo(map);

            // Guardar ambos para referencias
            createdMarkers.push(circleMarker);
            createdMarkers.push(standardMarker);

            // Event listeners para debugging
            circleMarker.on('add', () => {
              console.log(`✅ CircleMarker ${index + 1} agregado al mapa`);
            });

            standardMarker.on('add', () => {
              console.log(`✅ StandardMarker ${index + 1} agregado al mapa`);
            });

            circleMarker.on('remove', () => {
              console.log(`❌ CircleMarker ${index + 1} removido del mapa`);
            });

            standardMarker.on('remove', () => {
              console.log(`❌ StandardMarker ${index + 1} removido del mapa`);
            });

            console.log(`✅ Marcadores duales ${index + 1} agregados: CircleMarker + StandardMarker`);
          }
        });

        console.log(`🎉 Total marcadores creados: ${createdMarkers.length}`);

        // Crear LayerGroup solo para manejo posterior
        const layerGroup = L.layerGroup(createdMarkers);

        // NO agregar el grupo al mapa (los marcadores ya están)
        // layerGroup.addTo(map); // ❌ NO hacer esto

        // Calcular bounds y centrar después de un pequeño delay
        let bounds: L.LatLngBounds | null = null;
        geoJsonData.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates;
            if (!bounds) {
              bounds = L.latLngBounds([lat, lng], [lat, lng]);
            } else {
              bounds.extend([lat, lng]);
            }
          }
        });

        // Centrar con un pequeño delay para asegurar que los marcadores estén renderizados
        if (bounds) {
          setTimeout(() => {
            console.log('Centrando en bounds:', bounds);
            map.fitBounds(bounds!, {
              padding: [40, 40],
              maxZoom: 15,
              animate: true,
              duration: 1.0
            });
          }, 300);
        }

        // Crear objeto de capa para el contexto
        const newLayer = {
          id: `kml_${Date.now()}`,
          name: fileName,
          type: 'geojson' as const,
          visible: true,
          opacity: 1,
          data: geoJsonData,
          leafletLayer: layerGroup, // Guardamos el grupo para manejo
          markers: createdMarkers, // Guardamos las referencias individuales
          style: {
            color: '#ff0000',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8
          }
        };

        // Agregar al contexto
        addLayer(newLayer);
        setShowUploader(false);
        setError(null);

        // Log de confirmación con delay
        setTimeout(() => {
          const markersInMap = map.hasLayer ? createdMarkers.filter(m => map.hasLayer(m)).length : createdMarkers.length;
          console.log(`🔍 Verificación: ${markersInMap}/${createdMarkers.length} marcadores visibles en el mapa`);
        }, 500);

        console.log(`🎉 KML cargado: ${fileName} con ${geoJsonData.features.length} elementos`);

      } else if (fileExtension === 'geojson' || fileExtension === 'json') {
        // Manejo similar para GeoJSON...
        const text = await file.text();
        const geoJsonData = JSON.parse(text);

        const createdMarkers: L.Layer[] = [];

        if (geoJsonData.features && geoJsonData.features.length > 0) {
          geoJsonData.features.forEach((feature: any, index: number) => {
            const geometryType = feature.geometry.type;
            const properties = feature.properties || {};
            const name = properties.name || `Elemento ${index + 1}`;
            const description = properties.description || 'Sin descripción';

            // 🔵 PUNTOS
            if (geometryType === 'Point') {
              const [lng, lat] = feature.geometry.coordinates;

              const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                  className: `geojson-marker-${Date.now()}-${index}`,
                  html: `<div style="
                  background: #0066cc; 
                  width: 20px; 
                  height: 20px; 
                  border-radius: 50%; 
                  border: 3px solid white; 
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
                  iconSize: [26, 26],
                  iconAnchor: [13, 13]
                }),
                zIndexOffset: 1500 + index
              });

              marker.bindPopup(`
              <div style="color: #333;">
                <h4 style="color: #0066cc;">🔵 ${name}</h4>
                <p>${description}</p>
                <p>📄 ${fileName}</p>
                <small>📍 Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</small>
                <br><small>🏷️ Tipo: Punto</small>
              </div>
            `);

              marker.addTo(map);
              createdMarkers.push(marker);

            // 🔷 LÍNEAS
            } else if (geometryType === 'LineString') {
              const coordinates = feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
              
              const polyline = L.polyline(coordinates, {
                color: '#ff6600',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 5'
              });

              polyline.bindPopup(`
              <div style="color: #333;">
                <h4 style="color: #ff6600;">🔶 ${name}</h4>
                <p>${description}</p>
                <p>📄 ${fileName}</p>
                <small>📏 Puntos: ${coordinates.length}</small>
                <br><small>🏷️ Tipo: Línea</small>
              </div>
            `);

              polyline.addTo(map);
              createdMarkers.push(polyline);

            // 🔺 POLÍGONOS
            } else if (geometryType === 'Polygon') {
              const coordinates = feature.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
              
              const polygon = L.polygon(coordinates, {
                color: '#28a745',
                fillColor: '#28a745',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3
              });

              polygon.bindPopup(`
              <div style="color: #333;">
                <h4 style="color: #28a745;">🔺 ${name}</h4>
                <p>${description}</p>
                <p>📄 ${fileName}</p>
                <small>📐 Vértices: ${coordinates.length}</small>
                <br><small>🏷️ Tipo: Polígono</small>
              </div>
            `);

              polygon.addTo(map);
              createdMarkers.push(polygon);

            // 🔷 MULTILÍNEAS
            } else if (geometryType === 'MultiLineString') {
              const multiCoordinates = feature.geometry.coordinates.map((line: number[][]) => 
                line.map((coord: number[]) => [coord[1], coord[0]])
              );

              const multiPolyline = L.polyline(multiCoordinates, {
                color: '#ff6600',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 5'
              });

              multiPolyline.bindPopup(`
              <div style="color: #333;">
                <h4 style="color: #ff6600;">🔶 ${name}</h4>
                <p>${description}</p>
                <p>📄 ${fileName}</p>
                <small>📏 Líneas: ${multiCoordinates.length}</small>
                <br><small>🏷️ Tipo: Multi-Línea</small>
              </div>
            `);

              multiPolyline.addTo(map);
              createdMarkers.push(multiPolyline);

            // 🔺 MULTIPOLÍGONOS
            } else if (geometryType === 'MultiPolygon') {
              const multiCoordinates = feature.geometry.coordinates.map((polygon: number[][][]) =>
                polygon[0].map((coord: number[]) => [coord[1], coord[0]])
              );

              const multiPolygon = L.polygon(multiCoordinates, {
                color: '#28a745',
                fillColor: '#28a745',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3
              });

              multiPolygon.bindPopup(`
              <div style="color: #333;">
                <h4 style="color: #28a745;">🔺 ${name}</h4>
                <p>${description}</p>
                <p>📄 ${fileName}</p>
                <small>📐 Polígonos: ${multiCoordinates.length}</small>
                <br><small>🏷️ Tipo: Multi-Polígono</small>
              </div>
            `);

              multiPolygon.addTo(map);
              createdMarkers.push(multiPolygon);

            } else {
              console.warn(`⚠️ Tipo de geometría no soportado: ${geometryType}`);
            }
          });
        }

        const layerGroup = L.layerGroup(createdMarkers);

        const newLayer = {
          id: `geojson_${Date.now()}`,
          name: fileName,
          type: 'geojson' as const,
          visible: true,
          opacity: 1,
          data: geoJsonData,
          leafletLayer: layerGroup,
          markers: createdMarkers,
          style: { color: '#0066cc', weight: 2, opacity: 1, fillOpacity: 0.8 }
        };

        addLayer(newLayer);
        setShowUploader(false);
        setError(null);

      } else {
        throw new Error('Formato no soportado. Use KML, GeoJSON o JSON.');
      }

    } catch (err) {
      console.error('Error procesando archivo:', err);
      setError(`❌ ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleRemoveLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer && window.confirm(`¿Eliminar la capa "${layer.name}"?`)) {
      // Eliminar marcadores individuales del mapa
      if ((layer as any).markers && map) {
        (layer as any).markers.forEach((marker: L.Layer) => {
          if (map.hasLayer && map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });
        console.log(`🗑️ ${(layer as any).markers.length} marcadores eliminados individualmente`);
      }
      // También eliminar el grupo como respaldo
      if (layer.leafletLayer && map) {
        map.removeLayer(layer.leafletLayer);
      }
      removeLayer(layerId);
    }
  };

  const handleToggleVisibility = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer && layer.leafletLayer && map) {
      if (layer.visible) {
        map.removeLayer(layer.leafletLayer);
        console.log(`👁️ Capa ocultada: ${layer.name}`);
      } else {
        map.addLayer(layer.leafletLayer);
        console.log(`👁️ Capa mostrada: ${layer.name}`);
      }
      // Aquí deberías actualizar el estado en el contexto
      // updateLayer(layerId, { visible: !layer.visible });
    }
  };

  const handleCenterOnLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer && map) {
      if (layer.data?.features?.length > 0) {
        const firstFeature = layer.data.features[0];
        if (firstFeature.geometry.type === 'Point') {
          const [lng, lat] = firstFeature.geometry.coordinates;
          map.setView([lat, lng], 16);
          console.log(`🎯 Centrado en: ${lat}, ${lng}`);
        }
      }
    }
  };

  // Función para convertir KML a GeoJSON (mejorada)
  const kmlToGeoJSON = async (kmlDoc: Document): Promise<any> => {
    const placemarks = kmlDoc.getElementsByTagName('Placemark');
    const features = [];

    console.log(`🔍 Procesando ${placemarks.length} placemarks en el KML`);

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const nameEl = placemark.getElementsByTagName('name')[0];
      const descriptionEl = placemark.getElementsByTagName('description')[0];
      
      // 🔵 PUNTOS
      const pointEl = placemark.getElementsByTagName('Point')[0];
      if (pointEl) {
        const coordinatesEl = pointEl.getElementsByTagName('coordinates')[0];
        if (coordinatesEl) {
          const coordsText = coordinatesEl.textContent?.trim();
          if (coordsText) {
            const parts = coordsText.split(',');
            if (parts.length >= 2) {
              const lng = parseFloat(parts[0]);
              const lat = parseFloat(parts[1]);

              if (!isNaN(lat) && !isNaN(lng)) {
                features.push({
                  type: 'Feature',
                  properties: {
                    name: nameEl?.textContent || `Punto ${i + 1}`,
                    description: descriptionEl?.textContent || 'Sin descripción'
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                  }
                });
                console.log(`✅ Punto ${i + 1}: ${lat}, ${lng} - ${nameEl?.textContent}`);
              }
            }
          }
        }
      }
      
      // 🔷 LÍNEAS
      const lineStringEl = placemark.getElementsByTagName('LineString')[0];
      if (lineStringEl) {
        const coordinatesEl = lineStringEl.getElementsByTagName('coordinates')[0];
        if (coordinatesEl) {
          const coordsText = coordinatesEl.textContent?.trim();
          if (coordsText) {
            const coordinates = coordsText.split(' ')
              .map(coord => coord.split(','))
              .filter(parts => parts.length >= 2)
              .map(parts => [parseFloat(parts[0]), parseFloat(parts[1])])
              .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));

            if (coordinates.length > 1) {
              features.push({
                type: 'Feature',
                properties: {
                  name: nameEl?.textContent || `Línea ${i + 1}`,
                  description: descriptionEl?.textContent || 'Sin descripción'
                },
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates
                }
              });
              console.log(`✅ Línea ${i + 1}: ${coordinates.length} puntos - ${nameEl?.textContent}`);
            }
          }
        }
      }

      // 🔺 POLÍGONOS
      const polygonEl = placemark.getElementsByTagName('Polygon')[0];
      if (polygonEl) {
        const outerBoundaryEl = polygonEl.getElementsByTagName('outerBoundaryIs')[0];
        if (outerBoundaryEl) {
          const linearRingEl = outerBoundaryEl.getElementsByTagName('LinearRing')[0];
          if (linearRingEl) {
            const coordinatesEl = linearRingEl.getElementsByTagName('coordinates')[0];
            if (coordinatesEl) {
              const coordsText = coordinatesEl.textContent?.trim();
              if (coordsText) {
                const coordinates = coordsText.split(' ')
                  .map(coord => coord.split(','))
                  .filter(parts => parts.length >= 2)
                  .map(parts => [parseFloat(parts[0]), parseFloat(parts[1])])
                  .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));

                if (coordinates.length > 2) {
                  features.push({
                    type: 'Feature',
                    properties: {
                      name: nameEl?.textContent || `Polígono ${i + 1}`,
                      description: descriptionEl?.textContent || 'Sin descripción'
                    },
                    geometry: {
                      type: 'Polygon',
                      coordinates: [coordinates]
                    }
                  });
                  console.log(`✅ Polígono ${i + 1}: ${coordinates.length} vértices - ${nameEl?.textContent}`);
                }
              }
            }
          }
        }
      }
    }

    return {
      type: 'FeatureCollection',
      features
    };
  };

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: isExpanded ? '320px' : '50px',
      background: 'white',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
          📁 Capas ({layers.length})
        </h3>
        <div>
          <button
            onClick={() => setShowUploader(!showUploader)}
            title="Agregar capa"
            style={{
              background: showUploader ? '#007cba' : 'none',
              border: `2px solid ${showUploader ? '#007cba' : '#ccc'}`,
              cursor: 'pointer',
              padding: '6px',
              marginRight: '5px',
              color: showUploader ? 'white' : '#007cba',
              fontSize: '16px',
              borderRadius: '4px'
            }}
          >
            ➕
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Contraer' : 'Expandir'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              color: '#333',
              fontSize: '16px'
            }}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
          {layers.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📂</div>
              <p>No hay capas activas</p>
              <button
                onClick={() => setShowUploader(true)}
                style={{
                  background: '#007cba',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🎯 Agregar Primera Capa
              </button>
            </div>
          ) : (
            <div>
              {layers.map((layer, index) => (
                <div key={layer.id} style={{
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  marginBottom: '10px',
                  borderRadius: '6px',
                  backgroundColor: layer.visible ? '#f9f9f9' : '#f5f5f5'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '6px',
                    fontSize: '14px'
                  }}>
                    {layer.name.includes('.kml') ? '🔴' : '🔵'} {layer.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px'
                  }}>
                    📊 {layer.data?.features?.length || 0} elementos • {layer.visible ? '✅ Visible' : '❌ Oculto'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      title="Centrar en la capa"
                      onClick={() => handleCenterOnLayer(layer.id)}
                      style={{
                        fontSize: '10px',
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      🎯
                    </button>
                    <button
                      title={layer.visible ? 'Ocultar' : 'Mostrar'}
                      onClick={() => handleToggleVisibility(layer.id)}
                      style={{
                        fontSize: '10px',
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: layer.visible ? '#28a745' : '#6c757d',
                        color: 'white'
                      }}
                    >
                      {layer.visible ? '👁️' : '🙈'}
                    </button>
                    <button
                      title="Eliminar capa"
                      onClick={() => handleRemoveLayer(layer.id)}
                      style={{
                        fontSize: '10px',
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: '#dc3545',
                        color: 'white'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showUploader && (
            <div style={{
              marginTop: '15px',
              padding: '0',
              border: '2px solid #007cba',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              overflow: 'hidden'
            }}>
              {/* Header informativo */}
              <div style={{
                backgroundColor: '#007cba',
                color: 'white',
                padding: '12px 15px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0', fontSize: '16px' }}>
                  📁 Cargador de Archivos Geográficos
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                  Arrastra archivos o haz clic para seleccionar
                </p>
              </div>

              <div style={{ padding: '15px' }}>
                {/* Información de formatos soportados */}
                <div style={{
                  marginBottom: '15px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>
                    📋 Formatos Soportados y Simbología:
                  </h5>

                  <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.5' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#ff0000',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        marginRight: '8px'
                      }}></span>
                      <strong>📄 KML (Google Earth):</strong> Marcadores rojos círculos • Acepta puntos, líneas y polígonos
                    </div>

                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#0066cc',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        marginRight: '8px'
                      }}></span>
                      <strong>🗂️ GeoJSON:</strong> Marcadores azules círculos • Formato web estándar
                    </div>

                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '20px',
                        height: '4px',
                        backgroundColor: '#ff6600',
                        marginRight: '8px',
                        border: '1px solid white'
                      }}></span>
                      <strong>🔶 Líneas:</strong> Líneas naranjas con puntos
                    </div>

                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#28a745',
                        opacity: 0.6,
                        border: '2px solid #28a745',
                        marginRight: '8px'
                      }}></span>
                      <strong>🔺 Polígonos:</strong> Áreas verdes con borde
                    </div>
                  </div>
                </div>

                {/* Área de carga de archivos */}
                <div style={{
                  border: '2px dashed #007cba',
                  borderRadius: '6px',
                  backgroundColor: '#f0f8ff',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>📂</div>
                  <input
                    type="file"
                    accept=".kml,.geojson,.json,.zip"
                    onChange={handleFileUpload}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: loading ? '#f8f9fa' : '#fff',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  />

                  {loading && (
                    <div style={{
                      color: '#007cba',
                      fontSize: '14px',
                      marginTop: '10px',
                      fontWeight: 'bold'
                    }}>
                      ⏳ Procesando archivo... Por favor espera
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div style={{
                  fontSize: '11px',
                  color: '#666',
                  backgroundColor: '#fff3cd',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ffeaa7'
                }}>
                  <strong>💡 Consejos:</strong><br />
                  • Los archivos se centrarán automáticamente en el mapa<br />
                  • Haz clic en los marcadores para ver información detallada<br />
                  • Usa los botones 🎯 🗑️ en cada capa para managment<br />
                  • Los shapefiles deben estar comprimidos en ZIP
                </div>

                {/* Error display mejorado */}
                {error && (
                  <div style={{
                    color: '#721c24',
                    backgroundColor: '#f8d7da',
                    padding: '10px',
                    borderRadius: '4px',
                    margin: '10px 0',
                    fontSize: '12px',
                    border: '1px solid #f5c6cb'
                  }}>
                    <strong>⚠️ Error:</strong><br />
                    {error}
                  </div>
                )}

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <button
                    onClick={() => {
                      setShowUploader(false);
                      setError(null);
                    }}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ❌ Cancelar
                  </button>

                  <button
                    onClick={() => setError(null)}
                    style={{
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔄 Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ AGREGAR AQUÍ - Estilos CSS para marcadores robustos
if (typeof document !== 'undefined') {
  const styleId = 'kml-markers-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .kml-popup-circle .leaflet-popup-content-wrapper {
        border: 2px solid #ff0000;
      }
      
      .kml-popup-standard .leaflet-popup-content-wrapper {
        border: 2px solid #ff0000;
      }
      
      .leaflet-marker-icon {
        z-index: 1000 !important;
      }
      
      .leaflet-interactive {
        z-index: 1001 !important;
      }
      
      /* Asegurar que los marcadores estén siempre encima de los controles */
      .leaflet-marker-pane {
        z-index: 1002 !important;
      }
      
      /* Evitar que los controles oculten los marcadores */
      .leaflet-control-zoom {
        z-index: 999 !important;
      }
      
      .leaflet-control-attribution {
        z-index: 999 !important;
      }
    `;
    document.head.appendChild(style);
  }
}