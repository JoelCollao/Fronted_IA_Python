import React, { useState } from 'react';
import { useMap } from '../../core/contexts/MapContext';
import { Coordinates } from '../../core/types/gis.types';
import './SearchPanel.css';

interface SearchPanelProps {
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onClose }) => {
  const { flyTo, map } = useMap();
  const [searchType, setSearchType] = useState<'coords' | 'address'>('coords');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchCoordinates = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Coordenadas inválidas');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setError('Latitud debe estar entre -90 y 90');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setError('Longitud debe estar entre -180 y 180');
      return;
    }

    setError(null);
    flyTo({ lat: latitude, lng: longitude }, 15);

    // Añadir marcador temporal
    if (map) {
      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<b>Ubicación</b><br>Lat: ${latitude}<br>Lng: ${longitude}`).openPopup();
      
      setTimeout(() => {
        map.removeLayer(marker);
      }, 5000);
    }
  };

  const handleSearchAddress = async () => {
    if (!address.trim()) {
      setError('Ingrese una dirección');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      // Usar API de Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      
      const data = await response.json();
      
      if (data.length === 0) {
        setError('No se encontraron resultados');
        return;
      }

      const result = data[0];
      const coords: Coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };

      flyTo(coords, 15);

      // Añadir marcador
      if (map) {
        const marker = L.marker([coords.lat, coords.lng]).addTo(map);
        marker.bindPopup(`<b>${result.display_name}</b>`).openPopup();
        
        setTimeout(() => {
          map.removeLayer(marker);
        }, 5000);
      }
    } catch (err) {
      setError('Error al buscar la dirección');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="floating-panel search-panel">
      <div className="panel-header">
        <h3>🔍 Búsqueda Geográfica</h3>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="panel-content">
        <div className="search-tabs">
          <button
            className={searchType === 'coords' ? 'active' : ''}
            onClick={() => setSearchType('coords')}
          >
            Coordenadas
          </button>
          <button
            className={searchType === 'address' ? 'active' : ''}
            onClick={() => setSearchType('address')}
          >
            Dirección
          </button>
        </div>

        {searchType === 'coords' ? (
          <div className="search-form">
            <div className="form-group">
              <label>Latitud</label>
              <input
                type="text"
                placeholder="-33.4489"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Longitud</label>
              <input
                type="text"
                placeholder="-70.6693"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
            <button
              className="tool-btn primary"
              onClick={handleSearchCoordinates}
            >
              🔍 Buscar
            </button>
          </div>
        ) : (
          <div className="search-form">
            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Santiago, Chile"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearchAddress();
                }}
              />
            </div>
            <button
              className="tool-btn primary"
              onClick={handleSearchAddress}
              disabled={searching}
            >
              {searching ? '⏳ Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        )}

        {error && (
          <div className="search-error">
            ⚠️ {error}
          </div>
        )}

        <div className="search-help">
          <h4>💡 Ejemplos:</h4>
          <ul>
            <li>Coordenadas: -33.4489, -70.6693</li>
            <li>Dirección: Santiago, Chile</li>
            <li>Lugar: Torre Eiffel, París</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
