import React, { useState } from 'react';

const GeminiAssistant = () => {
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskGemini = async () => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    setAiResponse('');

    try {
      
      const settings = window.canabbisSettings;
      const nonce = settings?.nonce || '';
      const baseUrl = settings?.restUrl || '/wp-json/';

      // 2. Construimos la ruta hacia tu endpoint
      const apiUrl = `${baseUrl}mi-tema/v1/gemini`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          message: userQuery,
        }),
      });

      const data = await response.json();

     
      if (data.status === 'ok') {
        setAiResponse(data.message);
      } else {
        setAiResponse(data.message || 'Lo sentimos, hubo un problema con la búsqueda.');
      }
    } catch (error) {
      console.error('Error en la comunicación con WordPress:', error);
      setAiResponse('Error de conexión con el servidor. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={containerStyle}>
      <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✨ Consulta a nuestro experto IA</h3>
      <p style={{ fontSize: '14px', color: '#555' }}>
        Pregúntanos cualquier duda sobre bienestar y nuestros productos.
      </p>

      <div style={inputContainerStyle}>
        <input
          type="text"
          placeholder="Ej: ¿Qué beneficios tiene el CBD?"
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
          <p style={{ margin: 0, lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' }}>
            {aiResponse}
          </p>
        </div>
      )}
    </section>
  );
};

// Estilos limpios sin tipos de TypeScript
const containerStyle = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginTop: '40px',
  maxWidth: '600px',
};

const inputContainerStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
};

const inputStyle = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '16px',
  outline: 'none',
};

const buttonStyle = {
  backgroundColor: '#2e7d32',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const responseBoxStyle = {
  marginTop: '20px',
  padding: '16px',
  backgroundColor: '#f1f8e9',
  borderRadius: '8px',
  borderLeft: '4px solid #2e7d32',
};

export default GeminiAssistant;