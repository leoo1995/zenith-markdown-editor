import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import { I18nSchema } from '../types';

interface PreviewProps {
  content: string;
  previewRef: React.RefObject<HTMLDivElement>;
  t: I18nSchema;
  onToggleTask?: (lineIndex: number, checked: boolean) => void;
}

const PreBlock = ({ children }: { children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (preRef.current) {
      const codeText = preRef.current.innerText;
      navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <pre ref={preRef} className="relative group">
      <button
        onClick={handleCopy}
        className="
          absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200
          bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10
          text-slate-500 dark:text-slate-300
          opacity-0 group-hover:opacity-100 focus:opacity-100
          hover:bg-black/10 dark:hover:bg-white/20
        "
        title="Copy code"
        aria-label="Copy code"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
      {children}
    </pre>
  );
};

export const Preview: React.FC<PreviewProps> = ({ content, previewRef, t, onToggleTask }) => {
  return (
    <div 
      ref={previewRef}
      id="preview-pane"
      className="w-full h-full p-6 md:p-10 overflow-y-auto bg-white dark:bg-black text-slate-900 dark:text-white transition-colors selection:bg-blue-100 dark:selection:bg-blue-900/40"
    >
      {content ? (
        <div className="prose prose-slate dark:prose-invert max-w-none 
          prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl
          dark:prose-headings:text-white dark:text-white prose-p:dark:text-white">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              pre: PreBlock,
              img: ({node, ...props}) => (
                <span className="block my-6">
                  <img 
                    {...props} 
                    className="rounded-xl shadow-2xl max-w-full mx-auto border border-slate-100 dark:border-slate-800"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://picsum.photos/400/300?grayscale&blur=2";
                      target.alt = "Image not found";
                    }}
                  />
                </span>
              ),
              a: ({node, ...props}) => (
                <a {...props} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold" target="_blank" rel="noopener noreferrer" />
              ),
              input: (props: any) => {
                if (props.type === 'checkbox') {
                    return (
                        <input
                            type="checkbox"
                            checked={props.checked}
                            disabled={false}
                            className="cursor-pointer mr-2 accent-blue-600 dark:accent-blue-400 w-5 h-5 align-text-bottom transition-all"
                            onChange={() => {
                                const line = props.node?.position?.start.line;
                                if (line !== undefined && onToggleTask) {
                                    onToggleTask(line - 1, props.checked);
                                }
                            }}
                        />
                    );
                }
                return <input {...props} />;
              },
              li: ({node, children, ...props}) => (
                  <li {...props} className={`${props.className} dark:text-white`}>
                      {children}
                  </li>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
           <svg className="w-20 h-20 mb-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
           <p className="text-xl font-medium tracking-tight">{t.preview.placeholder}</p>
        </div>
      )}
    </div>
  );
};