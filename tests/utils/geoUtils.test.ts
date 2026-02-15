import {
  formatCoordinates,
  validateFileExtension,
  calculateDistance,
  isValidCoordinate,
  generateLayerId
} from '../../../src/utils/geoUtils';

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

    test('maneja coordenadas negativas', () => {
      const result = formatCoordinates(-33.4489, -70.6693, 4);
      expect(result).toBe('-33.4489, -70.6693');
    });

    test('maneja coordenadas de cero', () => {
      const result = formatCoordinates(0, 0, 1);
      expect(result).toBe('0.0, 0.0');
    });
  });

  describe('validateFileExtension', () => {
    const allowedExtensions = ['kml', 'geojson', 'json', 'shp', 'zip'];

    test('valida extensión correcta', () => {
      expect(validateFileExtension('archivo.kml', allowedExtensions)).toBe(true);
      expect(validateFileExtension('data.geojson', allowedExtensions)).toBe(true);
      expect(validateFileExtension('shapefile.zip', allowedExtensions)).toBe(true);
    });

    test('rechaza extensión incorrecta', () => {
      expect(validateFileExtension('archivo.txt', allowedExtensions)).toBe(false);
      expect(validateFileExtension('data.pdf', allowedExtensions)).toBe(false);
      expect(validateFileExtension('image.png', allowedExtensions)).toBe(false);
    });

    test('es case-insensitive', () => {
      expect(validateFileExtension('archivo.KML', allowedExtensions)).toBe(true);
      expect(validateFileExtension('data.GEOJSON', allowedExtensions)).toBe(true);
      expect(validateFileExtension('file.ZIP', allowedExtensions)).toBe(true);
    });

    test('maneja archivos sin extensión', () => {
      expect(validateFileExtension('archivo', allowedExtensions)).toBe(false);
    });

    test('maneja nombres de archivo con múltiples puntos', () => {
      expect(validateFileExtension('mi.archivo.datos.kml', allowedExtensions)).toBe(true);
      expect(validateFileExtension('test.backup.txt', allowedExtensions)).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    test('calcula distancia entre dos puntos conocidos', () => {
      // Distancia entre Nueva York y Los Ángeles (aproximadamente 3944 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeCloseTo(3944, 0); // Tolerancia de 1 km
    });

    test('calcula distancia cero para el mismo punto', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBeCloseTo(0, 6);
    });

    test('calcula distancia corta correctamente', () => {
      // Distancia muy corta (aproximadamente 1 km)
      const distance = calculateDistance(40.7128, -74.0060, 40.7228, -74.0060);
      expect(distance).toBeCloseTo(1.11, 1); // Aproximadamente 1.11 km
    });

    test('maneja coordenadas en antípodas', () => {
      // Puntos opuestos en la Tierra
      const distance = calculateDistance(0, 0, 0, 180);
      expect(distance).toBeCloseTo(20015, 0); // Aproximadamente la mitad de la circunferencia
    });
  });

  describe('isValidCoordinate', () => {
    test('valida coordenadas correctas', () => {
      expect(isValidCoordinate(40.7128, -74.0060)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
    });

    test('rechaza latitudes inválidas', () => {
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(-91, 0)).toBe(false);
      expect(isValidCoordinate(100, -74.0060)).toBe(false);
    });

    test('rechaza longitudes inválidas', () => {
      expect(isValidCoordinate(40, 181)).toBe(false);
      expect(isValidCoordinate(40, -181)).toBe(false);
      expect(isValidCoordinate(40.7128, 200)).toBe(false);
    });

    test('rechaza coordenadas undefined', () => {
      expect(isValidCoordinate(undefined, -74.0060)).toBe(false);
      expect(isValidCoordinate(40.7128, undefined)).toBe(false);
      expect(isValidCoordinate(undefined, undefined)).toBe(false);
    });

    test('rechaza valores NaN', () => {
      expect(isValidCoordinate(NaN, -74.0060)).toBe(false);
      expect(isValidCoordinate(40.7128, NaN)).toBe(false);
      expect(isValidCoordinate(NaN, NaN)).toBe(false);
    });
  });

  describe('generateLayerId', () => {
    test('genera IDs únicos', () => {
      const id1 = generateLayerId();
      const id2 = generateLayerId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    test('genera IDs con formato correcto', () => {
      const id = generateLayerId();
      expect(id).toMatch(/^layer_\d+_[a-z0-9]+$/);
    });

    test('genera IDs de longitud consistente', () => {
      const ids = Array.from({ length: 5 }, () => generateLayerId());
      const lengths = ids.map(id => id.length);
      
      // Todos los IDs deberían tener longitudes similares (dentro de un rango)
      const minLength = Math.min(...lengths);
      const maxLength = Math.max(...lengths);
      expect(maxLength - minLength).toBeLessThanOrEqual(3); // Tolerancia para variación
    });

    test('incluye timestamp', () => {
      const beforeTime = Date.now();
      const id = generateLayerId();
      const afterTime = Date.now();
      
      // Extraer el timestamp del ID
      const timestampStr = id.split('_')[1];
      const timestamp = parseInt(timestampStr, 10);
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
