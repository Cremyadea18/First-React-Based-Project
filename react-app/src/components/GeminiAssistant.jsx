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
      const response = await fetch(`${settings?.restUrl || '/wp-json/'}mi-tema/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': settings?.nonce || '',
        },
        body: JSON.stringify({ message: userQuery }),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        setAiResponse(data.message);
      } else {
        setAiResponse(data.message || 'Hubo un error en la consulta.');
      }
    } catch (error) {
      setAiResponse('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={singleGlassBoxStyle}>
      <h3 style={titleStyle}>✨ Consulta a nuestra IA</h3>
      
      <div style={actionRowStyle}>
        <input
          type="text"
          placeholder="¿En qué podemos ayudarte hoy?"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskGroq()}
          style={minimalInputStyle}
        />
        <button 
          onClick={handleAskGroq} 
          disabled={isLoading} 
          style={isLoading ? { ...buttonStyle, opacity: 0.5 } : buttonStyle}
        >
          {isLoading ? '...' : 'Consultar'}
        </button>
      </div>

      {aiResponse && (
        <div style={dividerStyle}>
          <p style={responseTextStyle}>{aiResponse}</p>
        </div>
      )}
    </section>
  );
};

// --- ESTILOS DE CAJA ÚNICA (GLASSMORFISM) ---

const singleGlassBoxStyle = {
  width: '100%',
  maxWidth: '800px',
  minWidth: '320px',
  margin: '40px auto',
  padding: '35px',
  boxSizing: 'border-box',
  
  // Efecto Cristal Principal
  background: 'rgba(255, 255, 255, 0.12)', 
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
};

const titleStyle = {
  color: '#2e7d32', 
  marginTop: 0, 
  marginBottom: '25px',
  fontSize: '22px',
  textAlign: 'center',
  fontWeight: '600'
};

const actionRowStyle = {
  display: 'flex',
  gap: '15px',
  background: 'rgba(0, 0, 0, 0.03)', // Un toque sutil de profundidad
  padding: '8px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const minimalInputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  padding: '12px 15px',
  color: '#333',
  fontSize: '16px',
  outline: 'none',
};

const buttonStyle = {
  backgroundColor: '#2e7d32',
  color: 'white',
  border: 'none',
  padding: '12px 25px',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
};

const dividerStyle = {
  marginTop: '30px',
  paddingTop: '25px',
  borderTop: '1px solid rgba(255, 255, 255, 0.3)', // Línea de cristal sutil
};

const responseTextStyle = {
  margin: 0,
  lineHeight: '1.7',
  color: '#1b5e20',
  fontSize: '16px',
  whiteSpace: 'pre-wrap',
  textAlign: 'left'
};

export default GeminiAssistant;