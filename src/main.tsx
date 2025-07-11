import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

function RootComponent() {
  const [showTerminal, setShowTerminal] = useState(true);

  const handleOpenTerminal = () => {
    setShowTerminal(true);
  };

  const handleCloseTerminal = () => {
    setShowTerminal(false);
  };

  return (
    <React.StrictMode>
      {showTerminal ? (
        <App onClose={handleCloseTerminal} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div onClick={handleOpenTerminal} style={{ cursor: 'pointer', display: 'inline-block' }}>
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" stroke="#f8f8f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10L9 13L6 16" stroke="#f8f8f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H16" stroke="#f8f8f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ color: '#f8f8f2', fontSize: '1.2em' }}>Abrir Terminal</p>
          </div>
        </div>
      )}
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RootComponent />
);