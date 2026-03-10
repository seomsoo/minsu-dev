'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!mounted) return null;
  const currentIcon =
    {
      light: Sun,
      dark: Moon,
      system: Monitor,
    }[theme ?? 'system'] ?? Monitor;
  const Icon = currentIcon;

  const options = [
    { value: 'light', label: 'light', icon: Sun },
    { value: 'dark', label: 'dark', icon: Moon },
    { value: 'system', label: 'system', icon: Monitor },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-text-secondary hover:text-text-primary cursor-pointer font-mono underline transition-colors"
      >
        <Icon size={24} />
      </button>
      {open && (
        <div className="border-border bg-background absolute top-full right-0 mt-2 flex flex-col rounded-md border py-1 shadow-sm">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={`flex cursor-pointer items-center gap-2 px-4 py-1.5 text-left font-mono text-sm transition-colors ${
                theme === opt.value
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
