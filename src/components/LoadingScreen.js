import React from 'react';

const LoadingScreen = ({ message }) => {
  return (
    <div className="loading-screen">
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring spinner-ring-inner"></div>
      </div>
      <p className="loading-message">{message || 'Loading...'}</p>
    </div>
  );
};

export default LoadingScreen;
