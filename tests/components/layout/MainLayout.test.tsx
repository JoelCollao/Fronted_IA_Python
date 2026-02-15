import React from 'react';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '../../../src/components/layout/MainLayout';

// Mock de componentes hijos
jest.mock('../../../src/components/layout/Navbar', () => ({
  Navbar: ({ activeTool, onToolChange }: any) => (
    <div data-testid="navbar">Navbar - {activeTool}</div>
  ),
}));

jest.mock('../../../src/components/layout/Sidebar', () => ({
  Sidebar: ({ isVisible }: any) => (
    <div data-testid="sidebar">Sidebar - {isVisible ? 'visible' : 'hidden'}</div>
  ),
}));

jest.mock('../../../src/components/map/MapContainer', () => ({
  MapContainer: () => <div data-testid="map-container">Map Container</div>,
}));

// Mock de contextos
jest.mock('../../../src/core/contexts/MapContext', () => ({
  MapProvider: ({ children }: any) => <div data-testid="map-provider">{children}</div>,
}));

jest.mock('../../../src/core/contexts/LayerContext', () => ({
  LayerProvider: ({ children }: any) => <div data-testid="layer-provider">{children}</div>,
}));

jest.mock('../../../src/core/contexts/SelectionContext', () => ({
  SelectionProvider: ({ children }: any) => <div data-testid="selection-provider">{children}</div>,
}));

describe('MainLayout', () => {
  // Test 1: Renderizado básico
  test('renderiza correctamente el layout principal', () => {
    render(<MainLayout />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  // Test 2: Providers están presentes
  test('incluye todos los providers de contexto', () => {
    render(<MainLayout />);
    
    expect(screen.getByTestId('map-provider')).toBeInTheDocument();
    expect(screen.getByTestId('layer-provider')).toBeInTheDocument();
    expect(screen.getByTestId('selection-provider')).toBeInTheDocument();
  });

  // Test 3: Estructura de layout
  test('mantiene la estructura de layout esperada', () => {
    const { container } = render(<MainLayout />);
    
    // Verificar que el contenedor tiene los elementos principales
    expect(container.querySelector('[data-testid="navbar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="sidebar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="map-container"]')).toBeInTheDocument();
  });

  // Test 4: No crashea al renderizar
  test('no crashea durante el renderizado', () => {
    expect(() => {
      render(<MainLayout />);
    }).not.toThrow();
  });
});
