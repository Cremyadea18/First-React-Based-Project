import React, { useState } from 'react';

const GeminiAssistant = () => {
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskGroq = async () => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    setAiResponse('');

    try {
      const settings = window.canabbisSettings;
      const nonce = settings?.nonce || '';
      const baseUrl = settings?.restUrl || '/wp-json/';
      const apiUrl = `${baseUrl}mi-tema/v1/gemini`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ message: userQuery }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setAiResponse(data.message);
      } else {
        setAiResponse(data.message || 'Hubo un error al procesar tu consulta.');
      }
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={glassContainerStyle}>
      <h3 style={titleStyle}>✨ Consulta a nuestra IA</h3>
      
      <div style={inputContainerStyle}>
        <input
          type="text"
          placeholder="Escribe tu duda sobre bienestar..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskGroq()}
          style={glassInputStyle}
        />
        <button 
          onClick={handleAskGroq} 
          disabled={isLoading} 
          style={isLoading ? { ...buttonStyle, opacity: 0.7 } : buttonStyle}
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </div>

      {aiResponse && (
        <div style={responseBoxStyle}>
          <p style={responseTextStyle}>{aiResponse}</p>
        </div>
      )}
    </section>
  );
};

// --- ESTILOS GLASSMORFISMO ---

const glassContainerStyle = {
  // Configuración de dimensiones pedida
  width: '100%',
  maxWidth: '800px',
  minWidth: '320px',
  margin: '40px auto',
  
  // Efecto Cristal
  background: 'rgba(255, 255, 255, 0.15)', // Fondo semi-transparente
  backdropFilter: 'blur(10px)',            // Desenfoque de fondo
  WebkitBackdropFilter: 'blur(10px)',      // Soporte para Safari
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)', // Borde blanco suave
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  padding: '30px',
  boxSizing: 'border-box'
};

const titleStyle = {
  color: '#2e7d32', 
  marginTop: 0, 
  marginBottom: '15px',
  fontWeight: '600',
  textAlign: 'center'
};

const inputContainerStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center'
};

const glassInputStyle = {
  flex: 1,
  background: 'rgba(255, 255, 255, 0.2)', // Input traslúcido
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '12px',
  padding: '12px 18px',
  color: '#333',
  fontSize: '16px',
  outline: 'none',
  backdropFilter: 'blur(5px)',
};

const buttonStyle = {
  backgroundColor: '#2e7d32',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)',
};

const responseBoxStyle = {
  marginTop: '25px',
  padding: '15px 20px',
  backgroundColor: 'rgba(255, 255, 255, 0.25)', // Caja de respuesta traslúcida
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const responseTextStyle = {
  margin: 0,
  lineHeight: '1.6',
  color: '#1b5e20',
  fontSize: '15px',
  whiteSpace: 'pre-wrap'
};

export default GeminiAssistant;