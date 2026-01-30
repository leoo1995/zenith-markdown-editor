import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ResizableLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  isZenMode: boolean;
  activeTab: 'editor' | 'preview';
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({ 
  left, 
  right, 
  isZenMode,
  activeTab
}) => {
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Boundaries
      if (newWidth > 15 && newWidth < 85) {
        setLeftWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (isZenMode) {
    return (
      <div className="flex-1 flex justify-center bg-white dark:bg-black transition-all duration-500 overflow-y-auto">
        <div className="w-full max-w-4xl h-full shadow-2xl dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          {left}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
      {/* Resizing Overlay to prevent interaction during drag */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}

      {/* Left Pane (Editor) */}
      <div 
        className={`h-full border-r border-slate-200 dark:border-slate-800 transition-[width] duration-75 ${activeTab === 'editor' ? 'flex' : 'hidden md:flex'}`}
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* Resizer Handle */}
      <div 
        onMouseDown={startResizing}
        className={`resizer-handle hidden md:block border-x border-slate-200/50 dark:border-slate-800/50 transition-colors ${isResizing ? 'active' : ''}`}
      />

      {/* Right Pane (Preview) */}
      <div 
        className={`h-full bg-white dark:bg-black transition-[width] duration-75 ${activeTab === 'preview' ? 'flex' : 'hidden md:block'}`}
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
};