console.log('🚀 Cargando chatbox.js...');

// Servicio para llamar al agente
async function sendMessageToAgent(message) {
    try {
        console.log('📡 Enviando al backend:', message);
        
        const response = await fetch('http://localhost:5000/api/v1/orchestrator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Respuesta del agente:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al enviar mensaje:', error);
        throw error;
    }
}

// Función principal del chatbox
window.handleSendMessage = async function() {
    console.log('📤 handleSendMessage ejecutándose...');
    
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
    
    // Agregar mensaje del usuario
    const userDiv = document.createElement('div');
    userDiv.style.cssText = 'background: #007bff; color: white; padding: 10px; margin: 5px 0; border-radius: 10px; text-align: right;';
    userDiv.textContent = '👤 Tú: ' + texto;
    messages.appendChild(userDiv);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    // Deshabilitar botón
    if (button) {
        button.disabled = true;
        button.textContent = '⏳ Enviando...';
        button.style.background = '#6c757d !important';
    }
    
    // Mensaje de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'background: #e3f2fd; padding: 8px; margin: 5px 0; border-radius: 10px; font-style: italic; color: #1976d2;';
    loadingDiv.textContent = '🔄 Consultando al agente de IA Azure...';
    messages.appendChild(loadingDiv);
    messages.scrollTop = messages.scrollHeight;
    
    try {
        // Llamar al agente
        const response = await sendMessageToAgent(texto);
        
        // Remover mensaje de carga
        if (messages.contains(loadingDiv)) {
            messages.removeChild(loadingDiv);
        }
        
        // Agregar respuesta del bot
        const botDiv = document.createElement('div');
        botDiv.style.cssText = 'background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; margin: 5px 0; border-radius: 10px;';
        
        let respuesta = '🤖 Asistente: ';
        if (response.reply) respuesta += response.reply;
        else if (response.response) respuesta += response.response;
        else if (response.message) respuesta += response.message;
        else respuesta += JSON.stringify(response);
        
        botDiv.textContent = respuesta;
        botDiv.style.whiteSpace = 'pre-line';
        messages.appendChild(botDiv);
        messages.scrollTop = messages.scrollHeight;
        
    } catch (error) {
        console.error('❌ Error completo:', error);
        
        // Remover mensaje de carga
        if (messages.contains(loadingDiv)) {
            messages.removeChild(loadingDiv);
        }
        
        // Mostrar error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 10px; margin: 5px 0; border-radius: 10px; border: 1px solid #f5c6cb;';
        
        let errorText = '❌ Error de conexión: ' + error.message;
        errorText += '\n\n🔧 Verificaciones:';
        errorText += '\n• ¿Está ejecutándose el backend en http://localhost:5000?';
        errorText += '\n• ¿El endpoint /api/agent está configurado?';
        errorText += '\n• ¿CORS está habilitado en el backend?';
        
        errorDiv.textContent = errorText;
        errorDiv.style.whiteSpace = 'pre-line';
        messages.appendChild(errorDiv);
        messages.scrollTop = messages.scrollHeight;
        
    } finally {
        // Rehabilitar botón
        if (button) {
            button.disabled = false;
            button.textContent = '📤 Enviar';
            button.style.background = '#007bff !important';
        }
    }
};

console.log('✅ Chatbox JS cargado exitosamente');
console.log('✅ handleSendMessage disponible:', typeof window.handleSendMessage);
