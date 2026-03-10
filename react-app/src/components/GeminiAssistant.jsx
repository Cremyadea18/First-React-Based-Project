import React, { useState } from 'react';

const GeminiAssistant = () => {
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        setAiResponse(data.message || 'Error en la consulta.');
      }
    } catch (error) {
      setAiResponse('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Combinación de estilos base + hover
  const currentCardStyle = isHovered 
    ? { ...cardBaseStyle, ...cardHoverStyle } 
    : cardBaseStyle;

  return (
    <section 
      style={currentCardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={actionRowStyle}>
        <input
          type="text"
          placeholder="Ask Anything..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskGroq()}
          style={inputStyle}
        />
        <button 
          onClick={handleAskGroq} 
          disabled={isLoading} 
          style={glassButtonStyle}
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </div>

      {aiResponse && (
        <div style={responseContainerStyle}>
          <p style={responseTextStyle}>{aiResponse}</p>
        </div>
      )}
    </section>
  );
};



const cardBaseStyle = {
  width: '100%',
  maxWidth: '800px', 
  minWidth: '320px',
  height: '180px',
  margin: '40px auto',
  padding: '25px',
  background: '#121212',
  borderRadius: '22px',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  boxSizing: 'border-box',
};

const cardHoverStyle = {
  transform: 'translateY(-12px) scale(1.01)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.15)',
};

const actionRowStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Línea sutil elegante
  padding: '12px 5px',
  color: '#ffffff',
  fontSize: '16px',
  outline: 'none',
};

const glassButtonStyle = {
  // Estilo Glassmorphism Blanco
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  color: '#ffffff',
  padding: '10px 20px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const responseContainerStyle = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
};

const responseTextStyle = {
  margin: 0,
  lineHeight: '1.6',
  color: 'rgba(255, 255, 255, 0.8)', // Texto blanco suave para no cansar la vista
  fontSize: '15px',
  whiteSpace: 'pre-wrap',
};

export default GeminiAssistant;