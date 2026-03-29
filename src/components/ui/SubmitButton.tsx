'use client';
import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`flex flex-shrink-0 items-center justify-center gap-2 bg-zinc-900 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:shadow-md hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-70 disabled:hover:scale-100 ${className}`}
    >
      {pending ? 'Saving...' : children}
    </button>
  );
}
