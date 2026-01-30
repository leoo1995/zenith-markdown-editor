import React from 'react';
import { FileText, FileCode, FileDown } from 'lucide-react';

interface ExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (type: 'pdf' | 'docx' | 'html') => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ isOpen, onClose, onAction }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Absolute High-priority invisible backdrop for outside clicks */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose} 
      />
      
      {/* Strictly Floating Menu Container */}
      <div 
        className="
          absolute top-full right-0 mt-3 z-[9999] w-64 
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
          rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] 
          border border-slate-200 dark:border-white/20 
          overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 origin-top-right
        "
      >
        <div className="py-3">
          <div className="px-5 py-2 mb-2 border-b border-slate-100 dark:border-white/10">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">
              Export Format
            </span>
          </div>
          
          <button
            onClick={() => onAction('pdf')}
            className="w-full text-left px-5 py-4 flex items-center gap-4 text-sm text-slate-700 dark:text-slate-100 hover:bg-red-50 dark:hover:bg-red-900/40 transition-all group"
          >
            <div className="p-2.5 bg-red-100/50 dark:bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileDown size={20} className="text-red-500 dark:text-red-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold">PDF Document</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Professional Printing</span>
            </div>
          </button>
          
          <button
            onClick={() => onAction('docx')}
            className="w-full text-left px-5 py-4 flex items-center gap-4 text-sm text-slate-700 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all group"
          >
            <div className="p-2.5 bg-blue-100/50 dark:bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileText size={20} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold">Word Document</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Microsoft Office</span>
            </div>
          </button>
          
          <button
            onClick={() => onAction('html')}
            className="w-full text-left px-5 py-4 flex items-center gap-4 text-sm text-slate-700 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-orange-900/40 transition-all group"
          >
            <div className="p-2.5 bg-orange-100/50 dark:bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileCode size={20} className="text-orange-500 dark:text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold">Static Webpage</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Clean HTML5 File</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};