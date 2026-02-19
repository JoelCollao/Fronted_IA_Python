#  GUÍA DE PRUEBAS: Buffer Multi-Formato

##  Formatos Soportados

El sistema de buffer ahora funciona con **tres formatos** de archivos GIS:

| Formato | Extensiones | Conversión Interna | Estado |
|---------|-------------|-------------------|--------|
| **GeoJSON** | `.json`, `.geojson` | Nativa |  Funcional |
| **Shapefile** | `.shp`, `.zip` (con .shx, .dbf) | Via `shpjs`  GeoJSON |  Funcional |
| **KML** | `.kml` | Parser XML  GeoJSON |  Funcional |

---

##  Casos de Prueba

### **TEST 1: Buffer desde GeoJSON**
```
1. Cargar archivo: puntos.geojson
2. En chatbox: "realizame un buffer de 50 metros de los puntos"
3. Verificar:
    Mensaje: "Se ha generado un buffer de 50 metros..."
    Nueva capa en LayerControl: "buffer_puntos_50m_..."
    Círculos naranjas alrededor de los puntos
```

### **TEST 2: Buffer desde Shapefile**
```
1. Cargar archivo: locations.zip (Shapefile empaquetado)
   O: Cargar locations.shp + locations.shx + locations.dbf
2. En chatbox: "genera un buffer de 100m de los puntos"
3. Verificar:
    Consola muestra: "Procesando capa: locations (Original: Shapefile)"
    Buffer aparece en mapa y LayerControl
```

### **TEST 3: Buffer desde KML**
```
1. Cargar archivo: sitios.kml
2. En chatbox: "crear buffer de 200 metros para los puntos"
3. Verificar:
    Consola muestra: "Procesando capa: sitios (Original: KML)"
    Buffer visualizado correctamente
```

### **TEST 4: Buffer Multi-Capa (Mixto)**
```
1. Cargar: puntos.geojson + locations.zip + sitios.kml
2. En chatbox: "buffer de 75 metros de todos los puntos"
3. Verificar:
    Consola: "GeoJSON preparado con X features de 3 capas"
    Buffer único que incluye todas las geometrías
```

### **TEST 5: Geometrías de Líneas (LineString)**
```
1. Cargar: calles.shp (líneas) o rutas.kml
2. En chatbox: "buffer de 10 metros de las líneas"
3. Verificar:
    Buffer tipo "corredor" alrededor de las líneas
```

### **TEST 6: Geometrías de Polígonos**
```
1. Cargar: parcelas.geojson o zonas.kml
2. En chatbox: "buffer de 5 metros de los polígonos"
3. Verificar:
    Buffer expandido alrededor de polígonos
```

---

##  Logs de Validación

### **Consola del Navegador** (F12  Console)
```javascript
// Al enviar solicitud de buffer
 Procesando capa: puntos (Original: GeoJSON, Features: 15)
 Procesando capa: locations (Original: Shapefile, Features: 8)
 GeoJSON preparado con 23 features de 2 capas
   Formatos soportados: GeoJSON, Shapefile (.shp/.zip), KML

// Al recibir respuesta
 Nueva capa de buffer recibida: buffer_1234567890
 Features en buffer: 23
 Capa agregada al mapa
```

### **Terminal del Backend** (Python)
```python
 Mensaje recibido: realizame un buffer de 50 metros...
 Procesando solicitud de buffer...
 GeoJSON recibido con 23 features
 Distancia: 50.0 metros
 Buffer procesado: True
 Buffer GeoJSON generado con 23 features
```

---

##  Troubleshooting

### **Problema**: "Capa sin features válidas"
```
Causa: Archivo corrupto o mal formado
Solución: Verificar que el archivo tiene geometrías válidas
```

### **Problema**: "No se recibió GeoJSON de capas"
```
Causa: La capa no tiene layer.data
Solución: Recargar el archivo o verificar que se cargó correctamente
```

### **Problema**: Buffer no aparece en el mapa
```
Causa: Backend no devolvió bufferGeojson
Solución: 
  1. Verificar que Shapely está instalado: pip install shapely
  2. Revisar logs del backend para errores
  3. Verificar que layers_geojson se envió correctamente
```

---

##  Debugging Avanzado

### **Verificar capas disponibles** (Consola del navegador):
```javascript
window.getAvailableLayers()
// Retorna:
[
  {
    id: "geojson_1234567890",
    name: "puntos.geojson",
    visible: true,
    geometryType: "Point",
    sourceFormat: "GeoJSON",
    featureCount: 15
  },
  {
    id: "shapefile_9876543210",
    name: "locations.zip",
    visible: true,
    geometryType: "Point",
    sourceFormat: "Shapefile",
    featureCount: 8
  }
]
```

### **Inspeccionar GeoJSON enviado**:
```javascript
// Antes de enviar al backend, revisar:
const bufferData = await window.createBufferFromChat("buffer 50m de puntos");
console.log(bufferData.layersGeojson);
```

---

##  Checklist de Funcionamiento

- [ ] Buffer funciona con archivos .geojson
- [ ] Buffer funciona con archivos .shp/.zip (Shapefile)
- [ ] Buffer funciona con archivos .kml
- [ ] Buffer combina múltiples capas de diferentes formatos
- [ ] Buffer se visualiza en el mapa con estilo naranja
- [ ] Nueva capa aparece en LayerControl
- [ ] Logs muestran "Original: Shapefile/KML/GeoJSON"
- [ ] Backend confirma recepción de GeoJSON
- [ ] Backend retorna bufferGeojson

---

##  Notas Técnicas

1. **Conversión Automática**: Todos los formatos se convierten a GeoJSON en `layer.data` al cargar
2. **Sin Cambios en Backend**: Backend solo trabaja con GeoJSON independientemente del formato original
3. **Validación**: Se verifica que cada capa tenga `features` antes de procesar
4. **Metadatos**: El buffer resultante incluye información de origen y fecha de creación
