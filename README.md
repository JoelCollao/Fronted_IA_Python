# Frontend GIS Application

Aplicación GIS empresarial construida con React, TypeScript, Leaflet y Tailwind CSS.

## 🚀 Características

- **Mapa interactivo** con React-Leaflet
- **Capas WMS/WFS** desde GeoServer
- **API REST** integración con Flask backend
- **Herramientas de medición** (distancia y área)
- **Control de capas** dinámico
- **Display de coordenadas** en tiempo real
- **Diseño responsive** para desktop y móvil
- **Arquitectura modular** y escalable

## 🏗️ Arquitectura

```
src/
├── core/               # Configuración y utilidades base
│   ├── config/        # Variables de entorno
│   ├── constants/     # Constantes GIS
│   └── utils/         # Utilidades compartidas
├── services/          # Servicios externos
│   ├── api/          # API REST base
│   ├── geoserver/    # Servicios GeoServer (WMS/WFS)
│   └── flask/        # Servicios Flask backend
├── features/          # Funcionalidades específicas
│   └── map/          # Hooks y lógica del mapa
├── components/        # Componentes reutilizables
│   ├── ui/           # Componentes UI básicos
│   ├── map/          # Componentes del mapa
│   └── layout/       # Componentes de layout
└── pages/            # Páginas de la aplicación
```

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Leaflet** para mapas interactivos
- **Tailwind CSS** para estilos
- **Vite** como bundler
- **Axios** para HTTP requests
- **Turf.js** para cálculos geoespaciales

## 📋 Prerrequisitos

- Node.js >= 18
- npm >= 9

## 🚀 Instalación y Ejecución

1. **Clonar el repositorio e instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

3. **La aplicación estará disponible en:**
```
http://localhost:3000
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot reload

# Producción
npm run build        # Build para producción
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecutar ESLint
```

## 🌍 Configuración de Entornos

La aplicación soporta múltiples entornos configurables en `src/core/config/environment.ts`:

- **development**: Desarrollo local
- **qa**: Ambiente de QA
- **production**: Producción

Variables configurables:
- API URLs (Flask backend)
- GeoServer URLs
- Configuración del mapa (centro, zoom, límites)

## 🗺️ Funcionalidades GIS

### Capas Soportadas
- **OpenStreetMap** como capa base
- **Capas WMS** desde GeoServer
- **Capas vectoriales** GeoJSON
- Control dinámico de visibilidad

### Herramientas
- **Medición de distancia** entre puntos
- **Medición de área** de polígonos
- **Display de coordenadas** del mouse
- **Popups informativos** en features
- **Zoom y navegación** completos

### Interactividad
- Click en features para información detallada
- Sidebar responsive con controles
- Soporte para móviles y tablets

## 🔌 Integraciones

### GeoServer
- Servicios WMS para capas raster
- Servicios WFS para datos vectoriales
- GetFeatureInfo para consultas

### Flask Backend
- CRUD operations en features
- Búsqueda y filtrado
- Estadísticas de capas

## 🎨 Estilos y Responsive

- **Tailwind CSS** para diseño consistente
- **Mobile-first** approach
- **Dark/Light mode** ready
- Componentes modulares y reutilizables

## 🧪 Testing

```bash
# Pendiente implementar
npm run test
```

## 📦 Build y Deploy

```bash
# Build para producción
npm run build

# Preview del build
npm run preview

## LINT

npm run lint          # Linting sin warnings ✅
npm run lint:dev      # Linting desarrollo (permisivo)
npm run lint:strict   # Linting estricto (CI/CD)
npm run build:dev     # Build desarrollo (sin tipos estrictos)
npm run build:strict  # Build con chequeo completo de tipos
```

Los archivos de producción se generan en `dist/`

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👥 Autores

- **Senior Frontend GIS Engineer** - *Desarrollo inicial* - GitHub Copilot

## 🙏 Reconocimientos

- React Leaflet community
- OpenStreetMap contributors
- GeoServer project
- Tailwind CSS team
