'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 마운트 후 fade in
    setTimeout(() => setVisible(true), 10);

    const timer = setTimeout(() => {
      // fade out 후 onClose
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`bg-button text-text-reverse-base fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-bold transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
