import { LatLng, LatLngBounds } from 'leaflet';
import * as turf from '@turf/turf';

export class GeoUtils {
  /**
   * Convierte coordenadas DD a DMS
   */
  static toDMS(coordinate: number, isLatitude: boolean): string {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = isLatitude ? (coordinate >= 0 ? 'N' : 'S') : coordinate >= 0 ? 'E' : 'W';

    return `${degrees}°${minutes}'${seconds}"${direction}`;
  }

  /**
   * Calcula la distancia entre dos puntos
   */
  static calculateDistance(point1: LatLng, point2: LatLng): number {
    const from = turf.point([point1.lng, point1.lat]);
    const to = turf.point([point2.lng, point2.lat]);
    return turf.distance(from, to, { units: 'kilometers' });
  }

  /**
   * Calcula el área de un polígono
   */
  static calculateArea(coordinates: LatLng[]): number {
    const coords = coordinates.map(coord => [coord.lng, coord.lat]);
    coords.push(coords[0]); // Cerrar el polígono
    const polygon = turf.polygon([coords]);
    return turf.area(polygon) / 1000000; // Convertir a km²
  }

  /**
   * Verifica si un punto está dentro de los límites
   */
  static isPointInBounds(point: LatLng, bounds: LatLngBounds): boolean {
    return bounds.contains(point);
  }

  /**
   * Formatea coordenadas para display
   */
  static formatCoordinates(lat: number, lng: number, precision: number = 6): string {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
  }
}
