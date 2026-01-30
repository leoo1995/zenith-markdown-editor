import React, { useMemo } from 'react';
import { I18nSchema } from '../types';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  t: I18nSchema;
  hideLineNumbers?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  onScroll, 
  editorRef, 
  t, 
  hideLineNumbers = false 
}) => {
  const lines = useMemo(() => value.split('\n'), [value]);

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-black flex overflow-hidden transition-colors duration-400">
      {!hideLineNumbers && (
        <div 
          className="w-12 py-6 pr-3 text-right bg-slate-100/50 dark:bg-zinc-900/10 text-slate-400 font-mono text-sm select-none border-r border-slate-200 dark:border-slate-900 shrink-0"
        >
          {lines.map((_, i) => (
            <div key={i} className="h-6 leading-6">{i + 1}</div>
          ))}
        </div>
      )}

      <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={onScroll}
          className={`
            flex-1 p-6 md:p-10 resize-none outline-none font-mono text-base md:text-lg
            bg-transparent text-slate-800 dark:text-white leading-relaxed
            selection:bg-blue-200 dark:selection:bg-blue-900/60
            ${hideLineNumbers ? 'text-center md:text-left' : ''}
          `}
          placeholder={t.editor.placeholder}
          spellCheck={false}
          autoFocus
      />
    </div>
  );
};