import React, { useEffect, useState } from 'react';

interface CustomAlertProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function CustomAlert({ message, type, onClose }: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger fade-in when component mounts
    setIsVisible(true);
    console.log('CustomAlert rendered with message:', message, 'and type:', type);

    // Set up auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setIsExiting(true); // Start fade-out
    }, 2000);

    // Handle fade-out completion
    const fadeOutTimer = setTimeout(() => {
      onClose();
    }, 2300); // 3 seconds + 0.3 seconds for fade-out

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeOutTimer);
    };
  }, [message, onClose, type]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${isExiting ? 'opacity-0' : ''}`}
      style={{ transitionProperty: 'opacity' }}
    >
      <div className={`bg-white border border-gray-300 p-4 w-full max-w-sm shadow-md rounded-2xl`}>
        <h2
          className={`text-center text-base font-semibold mb-2 ${
            type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {type === 'success' ? 'Éxito' : 'Error'}
        </h2>
        <p className="text-center text-sm text-gray-700">{message}</p>
      </div>
    </div>
  );
}