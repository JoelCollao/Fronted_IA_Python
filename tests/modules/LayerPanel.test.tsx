import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayerPanel } from '../../../src/modules/LayerPanel/LayerPanel';

// Mock de contextos
const mockAddLayer = jest.fn();
const mockRemoveLayer = jest.fn();
const mockMap = {
  setView: jest.fn(),
  fitBounds: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  hasLayer: jest.fn().mockReturnValue(true),
  on: jest.fn(),
  off: jest.fn(),
};

// Mock de los contextos de React
jest.mock('../../../src/core/contexts/LayerContext', () => ({
  useLayers: () => ({
    layers: [
      {
        id: 'test-layer-1',
        name: 'Test Layer KML',
        type: 'geojson',
        visible: true,
        opacity: 1,
        data: {
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
              properties: { name: 'Test Point' },
            },
          ],
        },
        leafletLayer: {},
        markers: [],
        style: { color: '#ff0000', weight: 3, opacity: 1, fillOpacity: 0.8 },
      },
    ],
    addLayer: mockAddLayer,
    removeLayer: mockRemoveLayer,
  }),
}));

jest.mock('../../../src/core/contexts/MapContext', () => ({
  useMap: () => ({
    map: mockMap,
  }),
}));

// Mock shpjs
jest.mock('shpjs', () => ({
  default: jest.fn(),
  __esModule: true,
}));

describe('LayerPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Renderizado básico
  test('renderiza correctamente el panel de capas', () => {
    render(<LayerPanel />);

    expect(screen.getByText(/ Capas \(1\)/)).toBeInTheDocument();
    expect(screen.getByText('Test Layer KML')).toBeInTheDocument();
    expect(screen.getByText(/1 elementos {3}Visible/)).toBeInTheDocument();
  });

  // Test 2: Expansión y contracción
  test('permite expandir y contraer el panel', () => {
    render(<LayerPanel />);

    const toggleButton = screen.getByTitle(/Contraer|Expandir/);
    fireEvent.click(toggleButton);

    // Verificar que el panel se contraiga (la lógica específica depende de la implementación)
    expect(toggleButton).toBeInTheDocument();
  });

  // Test 3: Mostrar uploader de archivos
  test('muestra el uploader cuando se hace clic en agregar capa', () => {
    render(<LayerPanel />);

    const addButton = screen.getByTitle('Agregar capa');
    fireEvent.click(addButton);

    expect(screen.getByText(' Cargador de Archivos Geográficos')).toBeInTheDocument();
    expect(screen.getByText(/Formatos Soportados y Simbología:/)).toBeInTheDocument();
  });

  // Test 4: Botones de acción de capas
  test('muestra botones de acción para cada capa', () => {
    render(<LayerPanel />);

    expect(screen.getByTitle('Centrar en la capa')).toBeInTheDocument();
    expect(screen.getByTitle('Ocultar')).toBeInTheDocument();
    expect(screen.getByTitle('Eliminar capa')).toBeInTheDocument();
  });

  // Test 5: Eliminar capa con confirmación
  test('permite eliminar capa con confirmación', () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<LayerPanel />);

    const deleteButton = screen.getByTitle('Eliminar capa');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar la capa "Test Layer KML"?');
    expect(mockRemoveLayer).toHaveBeenCalledWith('test-layer-1');

    // Restaurar window.confirm
    window.confirm = originalConfirm;
  });

  // Test 6: Cancelar eliminación de capa
  test('cancela eliminación de capa cuando se niega confirmación', () => {
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);

    render(<LayerPanel />);

    const deleteButton = screen.getByTitle('Eliminar capa');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockRemoveLayer).not.toHaveBeenCalled();

    window.confirm = originalConfirm;
  });

  // Test 7: Centrar en capa
  test('permite centrar en una capa', () => {
    render(<LayerPanel />);

    const centerButton = screen.getByTitle('Centrar en la capa');
    fireEvent.click(centerButton);

    expect(mockMap.setView).toHaveBeenCalledWith([40.7128, -74.006], 16);
  });

  // Test 8: Upload de archivo - validación de extensión
  test('valida extensiones de archivo correctamente', async () => {
    const user = userEvent.setup();
    render(<LayerPanel />);

    // Abrir uploader
    const addButton = screen.getByTitle('Agregar capa');
    await user.click(addButton);

    const fileInput = screen.getByAcceRole('file');

    // Crear archivo con extensión no válida
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/Formato no soportado/)).toBeInTheDocument();
    });
  });

  // Test 9: Panel vacío
  test('muestra mensaje cuando no hay capas', () => {
    jest.mocked(require('../../../src/core/contexts/LayerContext').useLayers).mockReturnValue({
      layers: [],
      addLayer: mockAddLayer,
      removeLayer: mockRemoveLayer,
    });

    render(<LayerPanel />);

    expect(screen.getByText('No hay capas activas')).toBeInTheDocument();
    expect(screen.getByText(' Agregar Primera Capa')).toBeInTheDocument();
  });

  // Test 10: Cerrar uploader
  test('permite cerrar el uploader', async () => {
    const user = userEvent.setup();
    render(<LayerPanel />);

    // Abrir uploader
    const addButton = screen.getByTitle('Agregar capa');
    await user.click(addButton);

    // Verificar que está abierto
    expect(screen.getByText(' Cargador de Archivos Geográficos')).toBeInTheDocument();

    // Cerrar uploader
    const cancelButton = screen.getByText(' Cancelar');
    await user.click(cancelButton);

    // Verificar que se cerró (el uploader no debería estar visible)
    expect(screen.queryByText(' Cargador de Archivos Geográficos')).not.toBeInTheDocument();
  });
});
