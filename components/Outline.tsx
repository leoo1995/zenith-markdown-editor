import React, { useMemo } from 'react';
import { extractHeadings } from '../utils';

interface OutlineProps {
  markdown: string;
  onSelect: (lineNumber: number) => void;
  isOpen: boolean;
}

export const Outline: React.FC<OutlineProps> = ({ markdown, onSelect, isOpen }) => {
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);

  return (
    <div 
      className={`
        h-full border-r border-slate-200 dark:border-slate-800 bg-gray-50/50 dark:bg-darker/50 
        hidden lg:flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-r-0'}
      `}
    >
      {/* Inner container with fixed width to prevent text squashing during animation */}
      <div className="min-w-[16rem] w-64 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Outline
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {headings.length === 0 ? (
            <p className="text-xs text-slate-400 p-2 italic">No headings found</p>
          ) : (
            <div className="space-y-0.5">
              {headings.map((heading, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(heading.line)}
                  className={`
                    w-full text-left py-1.5 px-2 rounded-md text-sm transition-colors duration-200
                    text-slate-600 dark:text-slate-300
                    hover:bg-black/5 dark:hover:bg-white/10
                    focus:outline-none focus:bg-black/5 dark:focus:bg-white/10
                    truncate
                    ${heading.level === 1 ? 'font-semibold' : 'font-normal'}
                    ${heading.level === 2 ? 'pl-4 text-[0.95em]' : ''}
                    ${heading.level === 3 ? 'pl-8 text-[0.9em] text-slate-500 dark:text-slate-400' : ''}
                  `}
                  title={heading.text}
                >
                  {heading.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};