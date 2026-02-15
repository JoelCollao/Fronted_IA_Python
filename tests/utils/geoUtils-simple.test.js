const {
  formatCoordinates,
  validateFileExtension,
  calculateDistance,
  isValidCoordinate,
  generateLayerId
} = require('../../src/utils/geoUtils');

describe('geoUtils', () => {
  describe('formatCoordinates', () => {
    test('formatea coordenadas con precisión por defecto', () => {
      const result = formatCoordinates(40.7128, -74.0060);
      expect(result).toBe('40.712800, -74.006000');
    });

    test('formatea coordenadas con precisión personalizada', () => {
      const result = formatCoordinates(40.7128, -74.0060, 2);
      expect(result).toBe('40.71, -74.01');
    });
  });

  describe('validateFileExtension', () => {
    const allowedExtensions = ['kml', 'geojson', 'json', 'shp', 'zip'];

    test('valida extensión correcta', () => {
      expect(validateFileExtension('archivo.kml', allowedExtensions)).toBe(true);
      expect(validateFileExtension('data.geojson', allowedExtensions)).toBe(true);
    });

    test('rechaza extensión incorrecta', () => {
      expect(validateFileExtension('archivo.txt', allowedExtensions)).toBe(false);
    });
  });

  describe('isValidCoordinate', () => {
    test('valida coordenadas correctas', () => {
      expect(isValidCoordinate(40.7128, -74.0060)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
    });

    test('rechaza coordenadas inválidas', () => {
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(40, 181)).toBe(false);
    });
  });

  describe('generateLayerId', () => {
    test('genera IDs únicos', () => {
      const id1 = generateLayerId();
      const id2 = generateLayerId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });
});
