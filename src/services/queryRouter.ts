import { LocalQueryService } from './localQueryService';
import { GISApiService } from './gisApiService';

const AI_ORCHESTRATOR_URL = 'http://localhost:5000/api/v1/orchestrator';

export type QueryDestination = 'LOCAL' | 'API' | 'IA';

export interface RoutedQueryResult {
  destination: QueryDestination;
  success: boolean;
  answer: string;
  data?: any;
  executionTime?: number;
}

export class QueryRouter {
  /**
   * Rutea la consulta al destino apropiado:
   *  1) LOCAL → datos en memoria del frontend
   *  2) API   → backend GIS tradicional
   *  3) IA    → orquestador LangGraph + agentes
   */
  static async routeQuery(message: string): Promise<RoutedQueryResult> {
    const startTime = Date.now();

    console.log('🎯 QueryRouter — analizando consulta:', message);

    // ─── 1️⃣ LOCAL ───────────────────────────────────────────
    const localResult = LocalQueryService.answerLocalQuery(message);
    if (localResult && localResult.success) {
      console.log('⚡ Respondido localmente (LOCAL)');
      return {
        destination: 'LOCAL',
        success: true,
        answer: localResult.answer,
        data: localResult.data,
        executionTime: Date.now() - startTime,
      };
    }

    // ─── 2️⃣ API GIS TRADICIONAL ────────────────────────────
    if (GISApiService.isSimpleGISQuery(message)) {
      console.log('🌐 Enviando a API GIS tradicional (API)');
      const gisResult = await GISApiService.executeGISQuery(message);

      return {
        destination: 'API',
        success: gisResult.success,
        answer: gisResult.message || JSON.stringify(gisResult.data),
        data: gisResult.data,
        executionTime: Date.now() - startTime,
      };
    }

    // ─── 3️⃣ ORQUESTADOR IA (LangGraph + agentes) ──────────
    console.log('🧠 Enviando al orquestador de IA (IA)');
    try {
      const response = await fetch(AI_ORCHESTRATOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.reply || data.response || data.message || JSON.stringify(data);

      return {
        destination: 'IA',
        success: true,
        answer,
        data,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('❌ Error en orquestador IA:', error);
      return {
        destination: 'IA',
        success: false,
        answer: `Error al consultar el orquestador de IA: ${error.message}`,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /** Etiqueta descriptiva del destino */
  static getDestinationLabel(destination: QueryDestination): string {
    const labels: Record<QueryDestination, string> = {
      LOCAL: '💾 Respondido desde datos locales',
      API: '🌍 Consultado en API GIS',
      IA: '🤖 Analizado por IA Azure',
    };
    return labels[destination];
  }

  /** Emoji representativo del destino */
  static getDestinationEmoji(destination: QueryDestination): string {
    const emojis: Record<QueryDestination, string> = {
      LOCAL: '⚡',
      API: '🌐',
      IA: '🧠',
    };
    return emojis[destination];
  }

  /** Color del badge según el destino */
  static getDestinationColor(destination: QueryDestination): string {
    const colors: Record<QueryDestination, string> = {
      LOCAL: '#28a745',
      API: '#17a2b8',
      IA: '#6f42c1',
    };
    return colors[destination];
  }
}
