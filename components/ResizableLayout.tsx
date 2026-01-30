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
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (isZenMode) {
    return (
      <div className="flex-1 w-full bg-white dark:bg-black flex justify-center overflow-y-auto">
        {left}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden relative w-full h-full">
      {/* Resizing Overlay */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}

      {/* Editor Pane */}
      <div 
        className={`h-full flex-col shrink-0 overflow-hidden ${activeTab === 'editor' ? 'flex' : 'hidden md:flex'}`}
        style={{ width: window.innerWidth < 768 ? '100%' : `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* Handle */}
      <div 
        onMouseDown={startResizing}
        className={`resizer-handle hidden md:block border-x border-slate-200/50 dark:border-slate-800/50 transition-colors ${isResizing ? 'active bg-blue-500' : 'hover:bg-blue-400/20'}`}
      />

      {/* Preview Pane */}
      <div 
        className={`h-full flex-col flex-1 overflow-hidden bg-white dark:bg-black ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}`}
      >
        {right}
      </div>
    </div>
  );
};