console.log('🚀 Cargando chatbox.js con routing inteligente...');

// ========================================
// CONFIGURACIÓN
// ========================================
const GIS_API_URL = 'http://localhost:5000/api/v1/gis';
const AI_ORCH_URL = 'http://localhost:5000/api/v1/orchestrator';

const BADGE_COLORS = { LOCAL: '#28a745', API: '#17a2b8', IA: '#6f42c1' };
const DEST_LABELS = {
  LOCAL: '💾 Respondido desde datos locales',
  API: '🌍 Consultado en API GIS',
  IA: '🤖 Analizado por IA Azure',
};
const DEST_EMOJIS = { LOCAL: '⚡', API: '🌐', IA: '🧠' };

// ========================================
// 1) LOCAL QUERY SERVICE
//    Responde con datos ya cargados en memoria
// ========================================
function answerLocalQuery(message) {
  const msg = message.toLowerCase().trim();
  const layersData = window.layersAnalysisData;
  const getStats = window.getLayerStatistics;

  if (!layersData && !getStats) return null;
  const stats = getStats ? getStats() : layersData;

  // --- Registros / features (DETALLE) ---
  if (
    _hasAny(msg, [
      'cuantos registros',
      'total de registros',
      'registros tienen las capas',
      'registros tiene las capas',
      'registros tienen',
      'registros hay',
    ])
  ) {
    const f = stats.totalFeatures || 0;
    const details = stats.layers || stats.layersDetails || []; // ✅ CAMBIADO

    let html = 'Hay <strong>' + f + '</strong> registros en total.';
    if (details.length > 0) {
      html += '<br/><br/><strong>📊 Detalle por capa:</strong>';
      details.forEach(function (l, i) {
        html +=
          '<br/>&nbsp;&nbsp;' +
          (i + 1) +
          '. <strong>' +
          l.name +
          '</strong>: ' +
          l.featureCount +
          ' registros';
      });
    }
    return _ok(html, f);
  }

  // --- Total de capas ---
  if (
    _hasAny(msg, [
      'cuantas capas',
      'total de capas',
      'capas hay',
      'capas estan cargadas',
      'capas cargadas en el mapa',
    ])
  ) {
    const t = stats.totalLayers || 0;
    return _ok('Hay <strong>' + t + '</strong> capas cargadas en total.', t);
  }

  return null;
}

// ========================================
// 2) GIS API SERVICE
//    Consulta GIS simple al backend tradicional
// ========================================
function isSimpleGISQuery(message) {
  const msg = message.toLowerCase();
  const gisOps = [
    'filtrar',
    'bbox',
    'bounding box',
    'en el área',
    'dentro de',
    'intersect',
    'intersección',
    'sumar',
    'calcular área',
    'distancia entre',
    'distancia de',
    'features en',
    'geometrías en',
  ];
  const reasoning = [
    'por qué',
    'cómo',
    'analiza',
    'compara',
    'recomienda',
    'tendencia',
    'patrón',
    'densidad',
    'correlación',
    'impacto',
    'interpreta',
    'explica',
    'relación entre',
    'causa',
    'efecto',
  ];

  return gisOps.some(op => msg.includes(op)) && !reasoning.some(kw => msg.includes(kw));
}

async function executeGISQuery(message) {
  try {
    console.log('🌍 Ejecutando consulta GIS:', message);
    const response = await fetch(`${GIS_API_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message }),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    return {
      success: true,
      data: data.result || data.data,
      message: data.message || 'Consulta ejecutada exitosamente.',
    };
  } catch (error) {
    console.error('❌ Error en consulta GIS:', error);
    return {
      success: false,
      data: null,
      message: `Error al ejecutar consulta GIS: ${error.message}`,
    };
  }
}

// ========================================
// 3) QUERY ROUTER
//    LOCAL → API → IA
// ========================================
async function routeQuery(message) {
  const t0 = Date.now();
  console.log('🎯 QueryRouter — analizando consulta:', message);

  // 1️⃣ LOCAL
  const local = answerLocalQuery(message);
  if (local) {
    console.log('⚡ Ruta: LOCAL');
    return {
      destination: 'LOCAL',
      success: true,
      answer: local.answer,
      data: local.data,
      executionTime: Date.now() - t0,
    };
  }

  // 2️⃣ API GIS
  if (isSimpleGISQuery(message)) {
    console.log('🌐 Ruta: API');
    const gis = await executeGISQuery(message);
    return {
      destination: 'API',
      success: gis.success,
      answer: gis.message || JSON.stringify(gis.data),
      data: gis.data,
      executionTime: Date.now() - t0,
    };
  }

  // 3️⃣ IA (LangGraph + agentes)
  console.log('🧠 Ruta: IA');
  try {
    const response = await fetch(AI_ORCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    const answer = data.reply || data.response || data.message || JSON.stringify(data);
    return { destination: 'IA', success: true, answer, data, executionTime: Date.now() - t0 };
  } catch (error) {
    console.error('❌ Error en orquestador IA:', error);
    return {
      destination: 'IA',
      success: false,
      answer: `Error al consultar el orquestador de IA: ${error.message}`,
      executionTime: Date.now() - t0,
    };
  }
}

// ========================================
// HELPERS
// ========================================
function ok(answer, data) {
  return { success: true, answer, data };
}
function isCountQuery(msg, keywords) {
  return (
    keywords.some(k => msg.includes(k)) &&
    (msg.includes('cuántas') ||
      msg.includes('cuantas') ||
      msg.includes('cuántos') ||
      msg.includes('cuantos') ||
      msg.includes('cantidad') ||
      msg.includes('número') ||
      msg.includes('numero') ||
      msg.includes('hay'))
  );
}
function hasAny(msg, patterns) {
  return patterns.some(p => msg.includes(p));
}

// ========================================
// CHATBOX UI — Función principal
// ========================================
window.handleSendMessage = async function () {
  console.log('📤 handleSendMessage ejecutándose con routing...');

  const input = document.getElementById('chatbox-input');
  const messages = document.getElementById('chatbox-messages');
  const button = document.getElementById('chatbox-send-btn');

  if (!input || !messages) {
    console.error('❌ Elementos del chatbox no encontrados');
    alert('Error: Elementos del chat no encontrados');
    return;
  }

  const texto = input.value.trim();
  console.log('💬 Texto a enviar:', texto);

  if (!texto) {
    alert('Por favor escribe un mensaje');
    return;
  }

  // Mensaje del usuario
  const userDiv = document.createElement('div');
  userDiv.style.cssText =
    'background: #007bff; color: white; padding: 10px; margin: 5px 0; border-radius: 10px; text-align: right;';
  userDiv.textContent = '👤 Tú: ' + texto;
  messages.appendChild(userDiv);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  // Deshabilitar botón
  if (button) {
    button.disabled = true;
    button.textContent = '⏳ Procesando...';
    button.style.background = '#6c757d';
  }

  // Indicador de carga
  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText =
    'background: #e3f2fd; padding: 8px; margin: 5px 0; border-radius: 10px; font-style: italic; color: #1976d2;';
  loadingDiv.textContent = '🔄 Analizando consulta...';
  messages.appendChild(loadingDiv);
  messages.scrollTop = messages.scrollHeight;

  try {
    // 🎯 ROUTING INTELIGENTE
    const result = await routeQuery(texto);

    // Quitar indicador
    if (messages.contains(loadingDiv)) messages.removeChild(loadingDiv);

    // Badge de destino
    const badgeDiv = document.createElement('div');
    badgeDiv.style.cssText = 'text-align: center; margin: 5px 0; font-size: 11px; color: #666;';
    const color = BADGE_COLORS[result.destination];
    const label = DEST_LABELS[result.destination];
    badgeDiv.innerHTML = `<span style="background:${color};color:white;padding:3px 10px;border-radius:12px;font-weight:500;font-size:10px;">${label} &bull; ${result.executionTime}ms</span>`;
    messages.appendChild(badgeDiv);

    // Respuesta
    const botDiv = document.createElement('div');
    const emoji = DEST_EMOJIS[result.destination];
    botDiv.style.cssText = `background:${result.success ? '#f8f9fa' : '#f8d7da'};border:1px solid ${result.success ? '#dee2e6' : '#f5c6cb'};padding:10px;margin:5px 0;border-radius:10px;border-left:4px solid ${color};white-space:pre-line;`;
    botDiv.textContent = `${emoji} Asistente: ${result.answer}`;
    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;

    console.log(`✅ Consulta procesada vía ${result.destination} en ${result.executionTime}ms`);
  } catch (error) {
    console.error('❌ Error completo:', error);
    if (messages.contains(loadingDiv)) messages.removeChild(loadingDiv);

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText =
      'background: #f8d7da; color: #721c24; padding: 10px; margin: 5px 0; border-radius: 10px; border: 1px solid #f5c6cb; white-space: pre-line;';
    errorDiv.textContent = '❌ Error: ' + error.message;
    messages.appendChild(errorDiv);
    messages.scrollTop = messages.scrollHeight;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = '📤 Enviar';
      button.style.background = '#007bff';
    }
  }
};

console.log('✅ Chatbox JS con routing inteligente cargado exitosamente');
console.log('✅ handleSendMessage disponible:', typeof window.handleSendMessage);
