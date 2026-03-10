import { useEffect } from 'react';
import { useLayers } from '../../core/contexts/LayerContext'; // ✅ CORREGIDO
import { useMap } from '../../core/contexts/MapContext';
import { LayerAnalysisService } from '../../services/layerAnalysisService';
import { BufferService } from '../../services/bufferService';
import L from 'leaflet';

export const ChatBridge: React.FC = () => {
  const { layers, addLayer } = useLayers(); // ✅ CORREGIDO: usar addLayer en lugar de setLayers
  const { map } = useMap();

  useEffect(() => {
    // Actualizar análisis de capas
    const analysis = LayerAnalysisService.analyzeLayers(layers);

    (window as any).layersAnalysisData = {
      totalLayers: analysis.totalLayers,
      polygonLayers: analysis.polygonLayers,
      lineLayers: analysis.lineLayers,
      pointLayers: analysis.pointLayers,
      // ✅ AÑADIR: Conteo total de registros
      totalFeatures: layers.reduce((sum, layer) => sum + (layer.data?.features?.length || 0), 0),
      // ✅ AÑADIR: Detalle por capa
      layersDetails: layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        geometryType: layer.geometryType,
        featureCount: layer.data?.features?.length || 0,
        visible: layer.visible,
      })),
    };

    console.log('📊 Datos de capas actualizados:', (window as any).layersAnalysisData);

    // ✅ NUEVA FUNCIÓN: Obtener registros por tipo de geometría
    (window as any).getFeatureCountByGeometry = (geometryType: string) => {
      const targetType = geometryType.toLowerCase();
      const matchingLayers = layers.filter(
        layer => layer.geometryType?.toLowerCase() === targetType
      );

      const totalFeatures = matchingLayers.reduce(
        (sum, layer) => sum + (layer.data?.features?.length || 0),
        0
      );

      return {
        geometryType: geometryType,
        layerCount: matchingLayers.length,
        totalFeatures: totalFeatures,
        layers: matchingLayers.map(layer => ({
          id: layer.id,
          name: layer.name,
          featureCount: layer.data?.features?.length || 0,
        })),
      };
    };

    // ✅ FUNCIÓN GENERAL: Obtener estadísticas completas
    (window as any).getLayerStatistics = () => {
      return {
        totalLayers: layers.length,
        totalFeatures: layers.reduce((sum, layer) => sum + (layer.data?.features?.length || 0), 0),
        byGeometry: {
          point: getFeaturesByType('point'),
          linestring: getFeaturesByType('linestring'),
          polygon: getFeaturesByType('polygon'),
        },
        layers: layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          type: layer.type,
          geometryType: layer.geometryType,
          featureCount: layer.data?.features?.length || 0,
          visible: layer.visible,
        })),
      };
    };

    // Función auxiliar
    const getFeaturesByType = (type: string) => {
      const matching = layers.filter(l => l.geometryType?.toLowerCase() === type.toLowerCase());
      return {
        layerCount: matching.length,
        featureCount: matching.reduce((sum, l) => sum + (l.data?.features?.length || 0), 0),
      };
    };

    // Exponer función para crear buffer
    (window as any).createBufferFromChat = async (message: string) => {
      console.log('🎯 Analizando solicitud de buffer:', message);

      const bufferData = BufferService.buildBufferRequest(message, layers);

      if (!bufferData) {
        return {
          success: false,
          message: 'No se pudo interpretar la solicitud de buffer.',
        };
      }

      if (bufferData.targetLayers.length === 0) {
        return {
          success: false,
          message: BufferService.generateConfirmationMessage(
            bufferData.request,
            bufferData.targetLayers
          ),
        };
      }

      // Preparar GeoJSON de capas origen
      const layersGeojson = bufferData.targetLayers
        .map(layer => {
          const featureCount = layer.data?.features?.length || 0;
          console.log(
            `📦 Procesando capa: ${layer.name} (Original: ${layer.type === 'geojson' ? 'GeoJSON' : 'Otro'}, Features: ${featureCount})`
          );

          return {
            id: layer.id,
            name: layer.name,
            geojson: layer.data,
            featureCount,
          };
        })
        .filter(layer => layer.geojson && layer.featureCount > 0);

      if (layersGeojson.length === 0) {
        return {
          success: false,
          message: 'Las capas seleccionadas no contienen geometrías válidas.',
        };
      }

      const totalFeatures = layersGeojson.reduce((sum, layer) => sum + layer.featureCount, 0);
      console.log(
        `✅ GeoJSON preparado con ${totalFeatures} features de ${layersGeojson.length} capas`
      );
      console.log('   Formatos soportados: GeoJSON, Shapefile (.shp/.zip), KML');

      return {
        success: true,
        bufferRequest: bufferData.request,
        targetLayers: bufferData.targetLayers.map(l => ({
          id: l.id,
          name: l.name,
          geometryType: l.geometryType,
        })),
        layersGeojson,
        confirmationMessage: BufferService.generateConfirmationMessage(
          bufferData.request,
          bufferData.targetLayers
        ),
      };
    };

    // Función para agregar buffer Y DIBUJARLO en el mapa
    (window as any).addBufferLayerToMap = (
      bufferGeojson: any,
      layerName: string,
      layerId: string
    ) => {
      if (!map) {
        console.error('❌ Mapa no disponible');
        return;
      }

      console.log('🗺️ Agregando capa de buffer al mapa...', {
        layerId,
        layerName,
        featureCount: bufferGeojson.features?.length,
      });

      if (!bufferGeojson.features || bufferGeojson.features.length === 0) {
        console.error('❌ Buffer GeoJSON no tiene features');
        return;
      }

      console.log(`✅ Buffer contiene ${bufferGeojson.features.length} features`);

      // DIBUJAR EL BUFFER EN EL MAPA
      const createdMarkers: L.Layer[] = [];

      bufferGeojson.features.forEach((feature: any, index: number) => {
        const geometryType = feature.geometry.type;
        const properties = feature.properties || {};

        console.log(`   🎨 Renderizando feature ${index + 1}: ${geometryType}`);

        if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
          let coordinates: number[][][] = [];

          if (geometryType === 'Polygon') {
            coordinates = [
              feature.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]),
            ];
          } else if (geometryType === 'MultiPolygon') {
            coordinates = feature.geometry.coordinates.map((polygon: number[][][]) =>
              polygon[0].map((coord: number[]) => [coord[1], coord[0]])
            );
          }

          const polygon = L.polygon(coordinates as L.LatLngExpression[][], {
            color: '#ff6b35',
            fillColor: '#ff6b35',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
            dashArray: '5, 5',
            className: 'buffer-polygon',
          });

          polygon.bindPopup(
            `
            <div style="color: #333; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #ff6b35; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">
                🛡️ ${layerName}
              </h4>
              <p style="margin: 4px 0;"><strong>Tipo:</strong> Buffer de Análisis</p>
              <p style="margin: 4px 0;"><strong>Distancia:</strong> ${properties.distance || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Capa origen:</strong> ${properties.sourceLayer || 'N/A'}</p>
              <small style="color: #666;">🔶 Capa generada por análisis GIS</small>
            </div>
          `,
            {
              maxWidth: 300,
              className: 'buffer-popup',
            }
          );

          polygon.addTo(map);
          createdMarkers.push(polygon);

          console.log(`   ✅ Polígono de buffer ${index + 1} dibujado en el mapa`);
        }
      });

      const layerGroup = L.layerGroup(createdMarkers);

      const newLayer = {
        id: layerId,
        name: layerName,
        type: 'geojson' as const,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: bufferGeojson,
        leafletLayer: layerGroup,
        markers: createdMarkers,
        geometryType: 'Polygon' as const,
        style: {
          color: '#ff6b35',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
          strokeColor: '#ff6b35',
          fillColor: '#ff6b35',
        },
      };

      // ✅ CORREGIDO: Usar addLayer en lugar de setLayers
      addLayer(newLayer);

      console.log('✅ Capa de buffer agregada al LayerContext y visualizada en el mapa');

      // Hacer zoom al buffer
      setTimeout(() => {
        let bounds: L.LatLngBounds | null = null;
        bufferGeojson.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0].forEach((coord: number[]) => {
              const [lng, lat] = coord;
              if (!bounds) {
                bounds = L.latLngBounds([lat, lng], [lat, lng]);
              } else {
                bounds.extend([lat, lng]);
              }
            });
          }
        });

        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
            duration: 1.5,
          });
          console.log('🎯 Zoom ajustado al buffer');
        }
      }, 300);
    };

    // Función de debugging
    (window as any).getAvailableLayers = () => {
      console.log('=== CAPAS DISPONIBLES ===');
      layers.forEach((layer, index) => {
        console.log(`${index + 1}. ${layer.name}`, {
          id: layer.id,
          type: layer.type,
          visible: layer.visible,
          geometryType: layer.geometryType,
          featureCount: layer.data?.features?.length || 0,
          hasLeafletLayer: !!layer.leafletLayer,
        });
      });
      return layers;
    };
  }, [layers, addLayer, map]);

  return null;
};
