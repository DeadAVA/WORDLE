import { useEffect, useRef, useState } from 'react';
import type { ToastMessage } from '../types';

interface Props {
  messages: ToastMessage[];
}

export function Toast({ messages }: Props) {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {messages.map(m => (
        <div key={m.id} className="toast-item">
          {m.text}
        </div>
      ))}
    </div>
  );
}

let toastCounter = 0;

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = (text: string, duration = 1800) => {
    const id = ++toastCounter;
    setMessages(prev => [...prev, { id, text, duration }]);
    const timer = setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id));
      timersRef.current.delete(id);
    }, duration);
    timersRef.current.set(id, timer);
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  return { messages, showToast };
}
