import React, { useState, useRef } from 'react';
import { useLayers } from '../../core/contexts/LayerContext';
import { LayerService } from '../../core/services/layerService';
import { Layer, ServiceConfig } from '../../core/types/gis.types';
import L from 'leaflet';

interface LayerUploaderProps {
  onClose: () => void;
}

export const LayerUploader: React.FC<LayerUploaderProps> = ({ onClose }) => {
  const { addLayer } = useLayers();
  const [activeTab, setActiveTab] = useState<'file' | 'service' | 'url'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para servicios
  const [serviceConfig, setServiceConfig] = useState<Partial<ServiceConfig>>({
    type: 'WMS',
    url: '',
    layers: [],
  });

  // Estado para URL
  const [geoJsonUrl, setGeoJsonUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await LayerService.uploadFile(file);

      // Crear bounds desde los datos
      let bounds: L.LatLngBounds | undefined;
      if (data.features.length > 0) {
        const geoJsonLayer = L.geoJSON(data as any);
        bounds = geoJsonLayer.getBounds();
      }

      const newLayer: Layer = {
        id: `layer-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'geojson',
        visible: true,
        opacity: 1,
        zIndex: 1000,
        data,
        bounds,
        metadata: {
          source: 'file',
          featureCount: data.features.length,
          createdAt: new Date(),
        },
      };

      addLayer(newLayer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cargar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceLoad = async () => {
    if (!serviceConfig.url) {
      setError('Debe ingresar una URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await LayerService.loadService(serviceConfig as ServiceConfig);

      let bounds: L.LatLngBounds | undefined;
      if (data.features.length > 0) {
        const geoJsonLayer = L.geoJSON(data as any);
        bounds = geoJsonLayer.getBounds();
      }

      const newLayer: Layer = {
        id: `layer-${Date.now()}`,
        name: `${serviceConfig.type} Layer`,
        type: serviceConfig.type?.toLowerCase() as any,
        visible: true,
        opacity: 1,
        zIndex: 1000,
        data,
        url: serviceConfig.url,
        bounds,
        metadata: {
          source: 'service',
          featureCount: data.features.length,
          createdAt: new Date(),
        },
      };

      addLayer(newLayer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cargar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlLoad = async () => {
    if (!geoJsonUrl) {
      setError('Debe ingresar una URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await LayerService.loadGeoJSON(geoJsonUrl);

      let bounds: L.LatLngBounds | undefined;
      if (data.features.length > 0) {
        const geoJsonLayer = L.geoJSON(data as any);
        bounds = geoJsonLayer.getBounds();
      }

      const newLayer: Layer = {
        id: `layer-${Date.now()}`,
        name: 'GeoJSON Layer',
        type: 'geojson',
        visible: true,
        opacity: 1,
        zIndex: 1000,
        data,
        url: geoJsonUrl,
        bounds,
        metadata: {
          source: 'url',
          featureCount: data.features.length,
          createdAt: new Date(),
        },
      };

      addLayer(newLayer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cargar desde URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layer-uploader">
      <div className="layer-uploader-tabs">
        <button
          className={activeTab === 'file' ? 'active' : ''}
          onClick={() => setActiveTab('file')}
        >
          Archivo
        </button>
        <button
          className={activeTab === 'service' ? 'active' : ''}
          onClick={() => setActiveTab('service')}
        >
          Servicio
        </button>
        <button className={activeTab === 'url' ? 'active' : ''} onClick={() => setActiveTab('url')}>
          URL
        </button>
      </div>

      <div className="layer-uploader-content">
        {/* Tab: Archivo */}
        {activeTab === 'file' && (
          <div className="uploader-tab">
            <input
              ref={fileInputRef}
              type="file"
              accept=".geojson,.json,.shp,.kml"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <i className="icon-upload"></i>
              {loading ? 'Cargando...' : 'Seleccionar archivo'}
            </button>
            <p className="uploader-hint">Formatos: GeoJSON, Shapefile, KML</p>
          </div>
        )}

        {/* Tab: Servicio */}
        {activeTab === 'service' && (
          <div className="uploader-tab">
            <select
              value={serviceConfig.type}
              onChange={e => setServiceConfig({ ...serviceConfig, type: e.target.value as any })}
            >
              <option value="WMS">WMS</option>
              <option value="WFS">WFS</option>
              <option value="ArcGIS REST">ArcGIS REST</option>
            </select>
            <input
              type="text"
              placeholder="URL del servicio"
              value={serviceConfig.url}
              onChange={e => setServiceConfig({ ...serviceConfig, url: e.target.value })}
            />
            <button
              className="btn-primary"
              onClick={handleServiceLoad}
              disabled={loading || !serviceConfig.url}
            >
              {loading ? 'Cargando...' : 'Cargar servicio'}
            </button>
          </div>
        )}

        {/* Tab: URL */}
        {activeTab === 'url' && (
          <div className="uploader-tab">
            <input
              type="text"
              placeholder="URL del GeoJSON"
              value={geoJsonUrl}
              onChange={e => setGeoJsonUrl(e.target.value)}
            />
            <button
              className="btn-primary"
              onClick={handleUrlLoad}
              disabled={loading || !geoJsonUrl}
            >
              {loading ? 'Cargando...' : 'Cargar desde URL'}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="uploader-error">
            <i className="icon-alert"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
