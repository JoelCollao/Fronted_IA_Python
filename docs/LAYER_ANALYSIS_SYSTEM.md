# Sistema de Análisis de Capas GIS con Chat IA

##  Descripción
Sistema integrado que permite consultar información sobre capas GIS cargadas en el mapa mediante un chatbot inteligente.

##  Ejemplos de Uso

### Consultas Soportadas
- "¿Cuántas capas de polígono hay en el mapa?"
- "¿Cuántas capas de línea existen?"
- "¿Hay capas de punto cargadas?"
- "¿Cuántas capas hay en total?"

### Respuestas Generadas
- "En el mapa existen 3 capas de tipo polígono."
- "En el mapa hay 5 capas cargadas: 3 de polígonos, 1 de líneas, 1 de puntos."
- "No hay capas de tipo punto cargadas en el mapa actualmente."

##  Flujo de Datos Completo

1. Usuario carga capas desde GeoServer
2. LayerContext almacena las capas
3. ChatBridge detecta cambios y actualiza window.layersAnalysisData
4. Usuario hace pregunta en el chatbox
5. Chatbox envía mensaje + datos de capas al backend
6. Backend analiza la consulta
7. Usuario recibe respuesta inmediata

##  Archivos Creados

### Frontend
- src/services/layerAnalysisService.ts - Servicio de análisis de capas
- src/components/chat/ChatBridge.tsx - Puente entre React y HTML
- src/components/map/MapComponentExample.tsx - Ejemplo de uso
- pages/chatbox.html - Chat actualizado con envío de datos

### Backend
- src/application/services/layer_analysis.py - Análisis de consultas
- src/presentation/api/agenteConsultaGIS.py - Endpoint actualizado

##  Testing Manual

1. Iniciar backend: cd gis-backend-app && python app.py
2. Iniciar frontend: npm run dev
3. Cargar capas en el mapa
4. Preguntar en el chatbox: "¿Cuántas capas de polígono hay?"

##  Verificación

### En Consola del Navegador
- " Datos de capas actualizados"
- " Enviando datos de capas"

### En Terminal del Backend
- "Consulta de capas detectada"
