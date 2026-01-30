import React, { forwardRef } from 'react';
import { Bold, Italic, Strikethrough, Link2, Copy, Scissors, Clipboard, Link, Wand2 } from 'lucide-react';
import { Position, I18nSchema } from '../types';

interface BubbleMenuProps {
  position: Position | null;
  onAction: (action: string) => void;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({ position, onAction }) => {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-1 p-1 bg-dark/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl text-white transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-200 ease-out"
      style={{ left: position.x, top: position.y - 10 }}
      onMouseDown={(e) => e.preventDefault()} // Prevent stealing focus
    >
      <button onClick={() => onAction('bold')} className="p-2 hover:bg-white/10 rounded transition-colors duration-150">
        <Bold size={16} />
      </button>
      <button onClick={() => onAction('italic')} className="p-2 hover:bg-white/10 rounded transition-colors duration-150">
        <Italic size={16} />
      </button>
      <button onClick={() => onAction('strikethrough')} className="p-2 hover:bg-white/10 rounded transition-colors duration-150">
        <Strikethrough size={16} />
      </button>
      <div className="w-px h-4 bg-slate-600 mx-1" />
      <button onClick={() => onAction('link')} className="p-2 hover:bg-white/10 rounded transition-colors duration-150">
        <Link2 size={16} />
      </button>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-dark/90 dark:bg-slate-800/90 rotate-45" />
    </div>
  );
};

interface ContextMenuProps {
  position: Position | null;
  onClose: () => void;
  onAction: (action: string) => void;
  t: I18nSchema['contextMenu'];
}

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(({ position, onClose, onAction, t }, ref) => {
  if (!position) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 w-52 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-md shadow-lg border border-slate-200/50 dark:border-slate-700/50 py-1.5 text-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out origin-top-left"
      style={{ left: position.x, top: position.y }}
    >
      <button 
        onClick={() => onAction('copy')} 
        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors duration-150"
      >
        <Copy size={14} /> {t.copy}
      </button>
      <button 
        onClick={() => onAction('cut')} 
        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors duration-150"
      >
        <Scissors size={14} /> {t.cut}
      </button>
      <button 
        onClick={() => onAction('paste')} 
        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors duration-150"
      >
        <Clipboard size={14} /> {t.paste}
      </button>
      <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1" />
      <button 
        onClick={() => onAction('link')} 
        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors duration-150"
      >
        <Link size={14} /> {t.insertLink}
      </button>
      <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1" />
      <button 
        onClick={() => onAction('format')} 
        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors duration-150"
      >
        <Wand2 size={14} /> {t.format}
      </button>
    </div>
  );
});

ContextMenu.displayName = 'ContextMenu';