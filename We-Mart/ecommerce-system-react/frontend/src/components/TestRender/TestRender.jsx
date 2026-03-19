import React from 'react';

// Simple test component to verify React is rendering
const TestRender = () => {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '1rem' }}>
        ✅ React is Rendering!
      </h1>
      <p style={{ color: '#666' }}>
        If you see this, React is working correctly.
      </p>
      <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '1rem' }}>
        Check the browser console for any errors.
      </p>
    </div>
  );
};

export default TestRender;

