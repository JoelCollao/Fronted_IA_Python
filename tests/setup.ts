import '@testing-library/jest-dom';

// Mock para window.matchMedia (usado por Leaflet y componentes de mapa)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para ResizeObserver (usado por algunos componentes de UI)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock para URLCreateObjectURL (usado para archivos)
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

// Mock básico para Leaflet (evitar errores en tests de componentes de mapa)
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    fitBounds: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    setLatLng: jest.fn(),
  })),
  icon: jest.fn(),
  divIcon: jest.fn(),
  circleMarker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    on: jest.fn(),
  })),
  layerGroup: jest.fn(() => ({
    addTo: jest.fn(),
    removeFrom: jest.fn(),
  })),
}));

// Configuración global para tests
jest.setTimeout(10000);
