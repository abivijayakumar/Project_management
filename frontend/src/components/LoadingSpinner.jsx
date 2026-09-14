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
        className="animate-spin"
        style={{
          width: dim,
          height: dim
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#e2e8f0"
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
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner;
