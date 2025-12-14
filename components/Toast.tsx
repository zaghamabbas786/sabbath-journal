'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose,
  duration = 4000 
}) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsLeaving(false);
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isLeaving) return null;

  const icons = {
    success: <CheckIcon />,
    error: <ErrorIcon />,
    info: <InfoIcon />,
  };

  const styles = {
    success: 'bg-stone-50 border-gold text-ink',
    error: 'bg-red-50 border-red-400 text-red-800',
    info: 'bg-stone-50 border-stone-300 text-stone-700',
  };

  const iconStyles = {
    success: 'text-gold bg-gold/10',
    error: 'text-red-500 bg-red-100',
    info: 'text-stone-500 bg-stone-100',
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <div 
        className={`
          flex items-center gap-4 px-6 py-4 
          border-l-4 rounded-sm shadow-xl
          backdrop-blur-sm
          ${styles[type]}
          ${isLeaving ? 'animate-toast-out' : 'animate-toast-in'}
        `}
      >
        <div className={`p-2 rounded-full ${iconStyles[type]}`}>
          {icons[type]}
        </div>
        <p className="font-serif text-lg pr-4">{message}</p>
        <button 
          onClick={() => {
            setIsLeaving(true);
            setTimeout(onClose, 300);
          }}
          className="text-stone-400 hover:text-stone-600 transition-colors ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast Hook for easier usage
interface ToastState {
  isVisible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
};


