import React, { useEffect, useState } from 'react';

const StatusToast = ({ message, type = '', duration = 4000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!message) return null;

  return (
    <div className={`status-toast ${visible ? 'show' : ''} ${type}`}>
      {message}
    </div>
  );
};

export default StatusToast;
