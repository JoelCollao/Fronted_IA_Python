# Sistema de Buffer GIS con Chat IA

##  Descripción
Sistema integrado que permite crear buffers (áreas de influencia) mediante comandos en lenguaje natural a través del chatbot.

##  Flujo Completo del Sistema

```
1. Usuario escribe: "Genera un buffer de 100 metros de los puntos cargados"
   
2. chatbox.html detecta palabra clave "buffer" + distancia
   
3. Llama a window.createBufferFromChat(message)
   
4. BufferService analiza:
   - distance: 100
   - unit: 'meters'
   - geometryType: 'Point'
   - targetLayers: [capas de puntos visibles]
   
5. Si hay capas válidas, envía al backend:
   {
     message: "...",
     bufferRequest: { distance, unit, geometryType, layerIds },
     targetLayers: [{ id, name, geometryType }]
   }
   
6. Backend (BufferService) procesa y responde:
   {
     success: true,
     reply: " Se ha generado un buffer...",
     newLayerId: "buffer_100m_puntos",
     layerName: "Buffer 100m - Puntos"
   }
   
7. Frontend muestra mensaje y puede agregar capa al mapa
```

##  Ejemplos de Uso

### Solicitudes Válidas
```
 "Genera un buffer de 100 metros de los puntos"
 "Crea un buffer de 5 kilómetros de las líneas"
 "Buffer de 500 metros para los polígonos"
 "Área de influencia de 1 km de los puntos cargados"
 "Zona de influencia de 200 metros"
```

### Unidades Soportadas
- **Metros**: metros, metro, m
- **Kilómetros**: kilómetros, kilometros, km
- **Pies**: pies, pie, ft, feet
- **Millas**: millas, milla, mi, miles

### Tipos de Geometría Detectados
- **Puntos**: punto, puntos, point, points
- **Líneas**: línea, linea, líneas, line, lines
- **Polígonos**: polígono, poligono, polygon

##  Archivos del Sistema

### Frontend
- **src/services/bufferService.ts** - Servicio principal de buffer
- **src/components/chat/ChatBridge.tsx** - Puente React-HTML (incluye buffer)
- **pages/chatbox.html** - Interfaz de chat (detecta buffer)

### Backend
- **src/application/services/buffer_service.py** - Procesamiento de buffer
- **src/presentation/api/agenteConsultaGIS.py** - Endpoint actualizado

##  Funcionalidades

### BufferService (Frontend)
```typescript
// Detectar si es solicitud de buffer
BufferService.isBufferRequest(message)

// Extraer distancia y unidad
BufferService.parseBufferRequest(message)

// Detectar tipo de geometría
BufferService.detectGeometryType(message)

// Filtrar capas por geometría
BufferService.filterLayersByGeometry(layers, 'Point')

// Construir solicitud completa
BufferService.buildBufferRequest(message, layers)
```

### BufferService (Backend)
```python
# Analizar solicitud
BufferAnalyzer.is_buffer_request(message)

# Extraer distancia
BufferAnalyzer.extract_distance(message)

# Detectar geometría
BufferAnalyzer.detect_geometry_type(message)

# Procesar buffer
buffer_service.process_buffer_request(message, buffer_request, target_layers)
```

##  Prioridad de Procesamiento en el Backend

1. **Solicitudes de Buffer** (mayor prioridad)
2. **Consultas de Capas** (¿Cuántas capas hay?)
3. **Azure AI Agent** (otras consultas)
4. **Modo Demo** (fallback)

##  Testing

### Prueba 1: Buffer Básico
```
Entrada: "Crea un buffer de 100 metros de los puntos"
Esperado: Buffer creado para todas las capas de puntos visibles
```

### Prueba 2: Sin Capas Objetivo
```
Entrada: "Buffer de 50 metros de líneas"
Sin capas de líneas cargadas
Esperado: "No se encontraron capas cargadas de tipo LineString..."
```

### Prueba 3: Sin Distancia
```
Entrada: "Crea un buffer de los puntos"
Esperado: "No pude identificar la distancia del buffer..."
```

##  Integración con el Mapa

Para agregar la capa de buffer al mapa cuando se crea:

```javascript
// En tu componente principal
window.onBufferLayerCreated = (layerId, layerName) => {
    console.log(`Nueva capa de buffer: ${layerName}`);
    
    // Aquí agregarías la lógica para:
    // 1. Obtener el GeoJSON del buffer desde el backend
    // 2. Agregar la capa al mapa
    // 3. Actualizar el LayerControl
};
```

##  Configuración

### Variables de Entorno (Backend)
No requiere configuración adicional. El servicio está listo para usar.

### Integración con GeoServer/PostGIS
Para implementar la creación real del buffer:

```python
# En buffer_service.py, método process_buffer_request

# Ejemplo con PostGIS
def create_buffer_in_postgis(layer_id, distance, unit):
    # Convertir unidad a metros
    distance_meters = convert_to_meters(distance, unit)
    
    # Query SQL
    query = f"""
    SELECT ST_Buffer(geom::geography, {distance_meters})::geometry as geom
    FROM {layer_id}
    """
    
    # Ejecutar y retornar GeoJSON
    return execute_query(query)
```

##  Solución de Problemas

### El buffer no se detecta
1. Verificar que incluya distancia + unidad
2. Usar palabras clave: "buffer", "genera", "crear"
3. Verificar logs en consola del navegador

### No encuentra capas
1. Verificar que las capas estén visibles
2. Comprobar que tengan geometryType asignado
3. Revisar `window.getAvailableLayers()` en consola

### Error en el backend
1. Verificar que buffer_service.py esté en el path correcto
2. Revisar logs del servidor Flask
3. Confirmar que la solicitud llegue con bufferRequest

##  Diferencias con Análisis de Capas

| Característica | Análisis de Capas | Buffer |
|----------------|-------------------|--------|
| Palabras clave | "capa", "cuántas" | "buffer", "genera" |
| Requiere distancia | No | Sí |
| Modifica datos | No | Sí (crea nueva capa) |
| Prioridad | Media | Alta |
| Respuesta | Texto informativo | Texto + nueva capa |

##  Ejemplo Completo de Uso

```javascript
// 1. Usuario carga capas
loadGeoServerLayer('ciudades', 'Point')

// 2. Usuario pregunta en chat
"Genera un buffer de 500 metros de los puntos"

// 3. Sistema detecta solicitud
isBufferRequest()  true

// 4. Extrae parámetros
parseBufferRequest()  { distance: 500, unit: 'meters' }
detectGeometryType()  'Point'

// 5. Filtra capas
filterLayersByGeometry()  [{ id: 'ciudades', name: 'Ciudades', geometryType: 'Point' }]

// 6. Envía al backend
POST /api/v1/agent
{
  "message": "...",
  "bufferRequest": { distance: 500, unit: 'meters', geometryType: 'Point' },
  "targetLayers": [{ id: 'ciudades', name: 'Ciudades', geometryType: 'Point' }]
}

// 7. Recibe respuesta
{
  "success": true,
  "reply": " Se ha generado un buffer de 500 metros para las capas de tipo Point: Ciudades...",
  "newLayerId": "buffer_500m_ciudades",
  "layerName": "Buffer 500m - Ciudades"
}
```

##  Próximas Mejoras

- [ ] Implementación real con PostGIS/GeoServer
- [ ] Soporte para múltiples capas simultáneas
- [ ] Opciones de dissolve para buffers superpuestos
- [ ] Visualización previa del buffer
- [ ] Exportación del buffer a diferentes formatos
- [ ] Historial de buffers creados

---

**Autor**: Sistema GIS-Chat IA  
**Fecha**: 19 de febrero de 2026  
**Versión**: 1.0
