import React, { useEffect } from 'react';
import { FaCheck, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

function Toast({ message, type = 'success', duration = 4000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200'
  };

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800'
  };

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600'
  };

  const Icon = {
    success: FaCheck,
    error: FaExclamationCircle,
    info: FaInfoCircle,
    warning: FaExclamationCircle
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 animate-slideInUp max-w-md z-[9999]`}>
      <div className={`flex items-center gap-4 p-4 rounded-lg border ${bgColor[type]} shadow-lg`}>
        <Icon className={`text-xl flex-shrink-0 ${iconColor[type]}`} />
        <p className={`flex-grow ${textColor[type]} font-medium text-sm`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 hover:opacity-70 transition ${textColor[type]}`}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

export default Toast;
