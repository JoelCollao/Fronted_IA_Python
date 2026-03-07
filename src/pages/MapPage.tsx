import React, { useEffect, useState } from 'react';
import { MapView } from '@components/map/MapView';
import { Sidebar } from '@components/layout/Sidebar';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { ErrorMessage } from '@components/ui/ErrorMessage';
import { flaskApiService } from '@services/flask/flaskApiService';
import { geoServerService } from '@services/geoserver/geoServerService';

interface AppState {
  geoJsonData: any;
  wmsLayers: Array<{
    url: string;
    layers: string;
    name: string;
    visible: boolean;
  }>;
  loading: boolean;
  error: string | null;
  sidebarOpen: boolean;
}

export const MapPage: React.FC = () => {
  const [state, setState] = useState<AppState>({
    geoJsonData: null,
    wmsLayers: [],
    loading: true,
    error: null,
    sidebarOpen: true,
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Cargar ejemplo de GeoJSON local
      const sampleGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Madrid Centro',
              population: '3200000',
              type: 'Ciudad',
            },
            geometry: {
              type: 'Point',
              coordinates: [-3.7038, 40.4168],
            },
          },
          {
            type: 'Feature',
            properties: {
              name: 'Parque del Retiro',
              area: '1.25 km²',
              type: 'Parque',
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-3.684, 40.4154],
                  [-3.675, 40.4154],
                  [-3.675, 40.42],
                  [-3.684, 40.42],
                  [-3.684, 40.4154],
                ],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {
              name: 'Gran Vía',
              length: '1.3 km',
              type: 'Calle',
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-3.7097, 40.4198],
                [-3.702, 40.4202],
                [-3.6969, 40.421],
              ],
            },
          },
        ],
      };

      // Simular carga de datos del backend Flask
      try {
        // Intentar cargar datos del Flask API (puede fallar si no está disponible)
        const layers = await flaskApiService.getLayers();
        console.log('Capas cargadas desde Flask:', layers);
      } catch (error) {
        console.warn('Flask API no disponible, usando datos de ejemplo:', error);
      }

      // Configurar capas WMS de ejemplo
      const exampleWMSLayers = [
        {
          url: geoServerService.getWMSUrl({
            workspace: 'demo',
            layerName: 'countries',
          }),
          layers: 'demo:countries',
          name: 'Países del Mundo',
          visible: false,
        },
      ];

      setState(prev => ({
        ...prev,
        geoJsonData: sampleGeoJSON,
        wmsLayers: exampleWMSLayers,
        loading: false,
      }));
    } catch (error) {
      console.error('Error cargando datos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false,
      }));
    }
  };

  const handleFeatureClick = (feature: any, latLng: any) => {
    console.log('Feature clickeada:', feature);
    console.log('Posición:', latLng);
    // Aquí se podría abrir un panel con detalles de la feature
  };

  const handleRetry = () => {
    loadInitialData();
  };

  if (state.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando aplicación GIS..." />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        title="Control de Capas"
        isOpen={state.sidebarOpen}
        onToggle={open => setState(prev => ({ ...prev, sidebarOpen: open }))}
        position="left"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Información</h3>
            <p className="text-sm text-gray-600">Aplicación GIS con React + Leaflet</p>
            <p className="text-sm text-gray-600 mt-1">
              Funcionalidades: Capas WMS, GeoJSON, Mediciones
            </p>
          </div>

          {state.error && <ErrorMessage message={state.error} onRetry={handleRetry} />}

          <div>
            <h3 className="font-semibold mb-2">Datos Cargados</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Capa base OpenStreetMap</li>
              <li>✅ GeoJSON de ejemplo ({state.geoJsonData?.features?.length || 0} features)</li>
              <li>✅ {state.wmsLayers.length} capas WMS configuradas</li>
              <li>✅ Herramientas de medición</li>
              <li>✅ Display de coordenadas</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Instrucciones</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Mueva el mouse para ver coordenadas</li>
              <li>• Haga clic en las features para información</li>
              <li>• Use las herramientas de medición</li>
              <li>• Active/desactive capas en el panel</li>
            </ul>
          </div>
        </div>
      </Sidebar>

      {/* Mapa principal */}
      <div
        className={`h-full transition-all duration-300 ${state.sidebarOpen ? 'md:ml-80' : 'ml-0'}`}
      >
        <MapView
          geoJsonData={state.geoJsonData}
          wmsLayers={state.wmsLayers}
          onFeatureClick={handleFeatureClick}
          className="h-full"
        />
      </div>
    </div>
  );
};
