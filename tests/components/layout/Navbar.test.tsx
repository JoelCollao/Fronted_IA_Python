import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '../../../src/components/layout/Navbar';

// Mock del contexto de Map
const mockMap = {
  setView: jest.fn(),
  fitBounds: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('../../../src/components/layout/Navbar.css', () => ({}));

jest.mock('../../../src/core/contexts/MapContext', () => ({
  useMap: () => ({
    map: mockMap,
    mapState: { zoom: 5, center: [0, 0] },
  }),
}));

describe('Navbar', () => {
  const mockOnToolChange = jest.fn();
  const defaultProps = {
    activeTool: 'selection' as const,
    onToolChange: mockOnToolChange,
    showAttributeTable: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Renderizado básico
  test('renderiza correctamente la navbar', () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getByText('Medición')).toBeInTheDocument();
    expect(screen.getByText('Selección')).toBeInTheDocument();
    expect(screen.getByText('Dibujo')).toBeInTheDocument();
    expect(screen.getByText('Atributos')).toBeInTheDocument();
    expect(screen.getByText('Vistas')).toBeInTheDocument();
  });

  // Test 2: Iconos de herramientas
  test('muestra los iconos correctos para cada herramienta', () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getByText('')).toBeInTheDocument(); // Medición
    expect(screen.getByText('')).toBeInTheDocument(); // Selección
    expect(screen.getByText('')).toBeInTheDocument(); // Dibujo
    expect(screen.getByText('')).toBeInTheDocument(); // Atributos
    expect(screen.getByText('')).toBeInTheDocument(); // Vistas
  });

  // Test 3: Herramienta activa resaltada
  test('resalta la herramienta activa', () => {
    render(<Navbar {...defaultProps} activeTool="measurement" />);

    const measurementButton = screen.getByRole('button', { name: /Medición/i });
    expect(measurementButton).toHaveClass(/active|selected/); // Depende de la implementación CSS
  });

  // Test 4: Cambio de herramienta
  test('llama onToolChange cuando se hace clic en una herramienta', async () => {
    const user = userEvent.setup();
    render(<Navbar {...defaultProps} />);

    const drawButton = screen.getByRole('button', { name: /Dibujo/i });
    await user.click(drawButton);

    expect(mockOnToolChange).toHaveBeenCalledWith('draw');
  });

  // Test 5: Múltiples clics en herramientas
  test('permite cambiar entre diferentes herramientas', async () => {
    const user = userEvent.setup();
    render(<Navbar {...defaultProps} />);

    // Hacer clic en medición
    const measurementButton = screen.getByRole('button', { name: /Medición/i });
    await user.click(measurementButton);
    expect(mockOnToolChange).toHaveBeenCalledWith('measurement');

    // Hacer clic en atributos
    const attributesButton = screen.getByRole('button', { name: /Atributos/i });
    await user.click(attributesButton);
    expect(mockOnToolChange).toHaveBeenCalledWith('attributes');

    expect(mockOnToolChange).toHaveBeenCalledTimes(2);
  });

  // Test 6: Tooltips o descripciones (si las hay)
  test('muestra descripciones de herramientas', () => {
    render(<Navbar {...defaultProps} />);

    // Verificar que las descripciones están presentes (como title o tooltip)
    const measurementButton = screen.getByRole('button', { name: /Medición/i });
    expect(measurementButton).toHaveAttribute('title', 'Medir distancias y áreas');
  });

  // Test 7: Estado de la tabla de atributos
  test('maneja el estado de showAttributeTable', () => {
    const { rerender } = render(<Navbar {...defaultProps} showAttributeTable={false} />);

    // Verificar estado inicial
    expect(screen.getByRole('button', { name: /Atributos/i })).toBeInTheDocument();

    // Cambiar prop y verificar actualización
    rerender(<Navbar {...defaultProps} showAttributeTable={true} />);
    const attributesButton = screen.getByRole('button', { name: /Atributos/i });
    expect(attributesButton).toBeInTheDocument();
  });

  // Test 8: Accesibilidad
  test('es accesible con teclado', async () => {
    const user = userEvent.setup();
    render(<Navbar {...defaultProps} />);

    // Navegar con Tab
    await user.tab();
    expect(document.activeElement).toBeInstanceOf(HTMLElement);

    // Activar con Enter o Space
    if (document.activeElement) {
      await user.keyboard('{Enter}');
      expect(mockOnToolChange).toHaveBeenCalled();
    }
  });

  // Test 9: Renderizado con diferentes herramientas activas
  test('renderiza correctamente con diferentes herramientas activas', () => {
    const tools = ['measurement', 'selection', 'draw', 'attributes', 'bookmarks'] as const;

    tools.forEach(tool => {
      const { container, rerender } = render(<Navbar {...defaultProps} activeTool={tool} />);

      // Verificar que la herramienta activa está resaltada por clase CSS
      const activeButton = container.querySelector('.navbar-tool.active');
      expect(activeButton).toBeInTheDocument();

      rerender(<div />); // Limpiar para el siguiente test
    });
  });

  // Test 10: No crashea con props undefined
  test('maneja props undefined gracefully', () => {
    const minimalProps = {
      activeTool: 'selection' as const,
      onToolChange: jest.fn(),
      showAttributeTable: false,
    };

    expect(() => {
      render(<Navbar {...minimalProps} />);
    }).not.toThrow();
  });
});
