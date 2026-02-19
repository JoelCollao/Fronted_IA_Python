# Guía de Integración con GeoServer

##  Objetivo
Integrar capas de GeoServer con el sistema de análisis de capas mediante chat.

##  Pasos para Integrar

### 1. Configurar GeoServer
Asegúrate de tener tu GeoServer corriendo y las capas publicadas.

### 2. Cargar Capas en el Componente de Mapa

En tu componente de mapa (por ejemplo, MapContainer.tsx), agrega esta lógica:

```typescript
import { useLayers } from '../core/contexts/LayerContext';
import { Layer } from '../core/types/gis.types';

const { addLayer } = useLayers();

// Función para cargar capas desde GeoServer
const loadGeoServerLayer = async (layerName: string, geometryType: GeometryType) => {
  try {
    const response = await fetch(
      `http://localhost:8080/geoserver/wfs?` +
      `service=WFS&version=2.0.0&request=GetFeature&` +
      `typeName=${layerName}&outputFormat=application/json`
    );
    
    const geojson = await response.json();
    
    const layer: Layer = {
      id: layerName,
      name: layerName,
      type: 'geojson',
      visible: true,
      opacity: 1,
      zIndex: 100,
      data: geojson
    };
    
    addLayer(layer);
    console.log(` Capa ${layerName} cargada correctamente`);
  } catch (error) {
    console.error(` Error cargando capa ${layerName}:`, error);
  }
};

// Ejemplo de uso
useEffect(() => {
  loadGeoServerLayer('departamentos', 'Polygon');
  loadGeoServerLayer('carreteras', 'LineString');
  loadGeoServerLayer('ciudades', 'Point');
}, []);
```

### 3. Verificar que ChatBridge Esté Activo

El componente ChatBridge ya está integrado en App.tsx y automáticamente:
- Detecta cuando se agregan/eliminan capas
- Analiza el tipo de geometría de cada capa
- Actualiza window.layersAnalysisData

### 4. Probar el Sistema

1. Inicia tu GeoServer
2. Carga las capas en el mapa
3. Abre el chatbox
4. Pregunta: "¿Cuántas capas de polígono hay?"
5. El sistema responderá con el conteo correcto

##  Ejemplo Completo

```typescript
// En tu MapContainer.tsx o componente principal del mapa

import React, { useEffect } from 'react';
import { useLayers } from '../core/contexts/LayerContext';
import { Layer, GeometryType } from '../core/types/gis.types';

export const MapContainer: React.FC = () => {
  const { addLayer, layers } = useLayers();

  const loadGeoServerLayers = async () => {
    const layersToLoad = [
      { name: 'workspace:departamentos', geometryType: 'Polygon' as GeometryType },
      { name: 'workspace:carreteras', geometryType: 'LineString' as GeometryType },
      { name: 'workspace:ciudades', geometryType: 'Point' as GeometryType }
    ];

    for (const layerConfig of layersToLoad) {
      try {
        const response = await fetch(
          `http://localhost:8080/geoserver/wfs?` +
          `service=WFS&version=2.0.0&request=GetFeature&` +
          `typeName=${layerConfig.name}&outputFormat=application/json`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geojson = await response.json();
        
        const layer: Layer = {
          id: layerConfig.name,
          name: layerConfig.name.split(':')[1], // Remove workspace prefix
          type: 'geojson',
          visible: true,
          opacity: 1,
          zIndex: 100,
          data: geojson
        };
        
        addLayer(layer);
        console.log(` Capa ${layerConfig.name} cargada`);
      } catch (error) {
        console.error(` Error cargando ${layerConfig.name}:`, error);
      }
    }
  };

  useEffect(() => {
    loadGeoServerLayers();
  }, []);

  return (
    <div className="map-container">
      {/* Tu mapa aquí */}
      <div id="map" style={{ width: '100%', height: '100%' }} />
      
      {/* El LayerControl ya debería estar aquí */}
    </div>
  );
};
```

##  Solución de Problemas

### Las capas no se detectan automáticamente
- Verifica que el geometryType se extraiga correctamente de los datos GeoJSON
- Usa `layer.data?.features[0]?.geometry?.type` para obtener el tipo

### Error de CORS
Si obtienes errores de CORS al conectar con GeoServer:
1. Configura CORS en GeoServer
2. O usa un proxy en tu backend

### El conteo es incorrecto
- Verifica en la consola del navegador: `window.layersAnalysisData`
- Asegúrate de que ChatBridge esté montado en App.tsx

##  Recursos Adicionales

- Documentación de GeoServer WFS: https://docs.geoserver.org/stable/en/user/services/wfs/
- Documentación del sistema: docs/LAYER_ANALYSIS_SYSTEM.md
