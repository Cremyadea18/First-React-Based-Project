import React, { useState } from 'react';

const GeminiAssistant: React.FC = () => {
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskGemini = async () => {
    if (!userQuery.trim()) return; // No enviar si está vacío

    setIsLoading(true);
    setAiResponse(''); // Limpiar respuesta previa

    try {
      // 1. Obtenemos el Nonce que configuramos en wp_head
      const nonce = (window as any).canabbisSettings?.nonce || '';

      // 2. Llamamos a TU endpoint de WordPress
      const response = await fetch('/wp-json/mi-tema/v1/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          message: userQuery, // Este es el 'message' que recibe handle_gemini_request
        }),
      });

      const data = await response.json();

      // 3. Validamos la respuesta del servidor
      if (data.status === 'ok') {
        setAiResponse(data.message);
      } else {
        setAiResponse('Lo siento, hubo un problema al obtener la respuesta.');
      }
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={containerStyle}>
      <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✨ Consulta a nuestro experto IA</h3>
      <p style={{ fontSize: '14px', color: '#555' }}>
        ¿Tienes dudas sobre productos o beneficios? Escribe tu pregunta abajo.
      </p>

      <div style={inputContainerStyle}>
        <input
          type="text"
          placeholder="Ej: ¿Qué producto recomiendan para relajarme?"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
          style={inputStyle}
        />
        <button 
          onClick={handleAskGemini} 
          disabled={isLoading} 
          style={isLoading ? { ...buttonStyle, opacity: 0.6, cursor: 'not-allowed' } : buttonStyle}
        >
          {isLoading ? 'Pensando...' : 'Consultar'}
        </button>
      </div>

      {aiResponse && (
        <div style={responseBoxStyle}>
          <strong style={{ display: 'block', marginBottom: '8px', color: '#2e7d32' }}>Respuesta de Gemini:</strong>
          <p style={{ margin: 0, lineHeight: '1.6', color: '#333' }}>{aiResponse}</p>
        </div>
      )}
    </section>
  );
};

// --- ESTILOS (CSS-in-JS) ---
const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginTop: '40px',
  maxWidth: '600px',
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '16px',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#2e7d32',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const responseBoxStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '16px',
  backgroundColor: '#f1f8e9',
  borderRadius: '8px',
  borderLeft: '4px solid #2e7d32',
};

export default GeminiAssistant;