import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'default' }) => {
  const sizeMap = {
    small: '24px',
    default: '36px',
    large: '48px'
  };

  const dim = sizeMap[size] || sizeMap.default;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      gap: '1rem',
      color: 'var(--text-secondary)'
    }}>
      <svg
        style={{
          width: dim,
          height: dim,
          animation: 'spin 0.8s linear infinite'
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--accent-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {text && (
        <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.01em' }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
