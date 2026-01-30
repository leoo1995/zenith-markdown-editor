import React, { useState, useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Outline } from './components/Outline';
import { ResizableLayout } from './components/ResizableLayout';
import { Button } from './components/ui/Button';
import { Minimize2, Eye, PenTool } from 'lucide-react';
import { TRANSLATIONS, DEFAULT_MARKDOWN } from './constants';
import { Language, Theme, Tab } from './types';

function App() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [fileName, setFileName] = useState<string>('untitled');
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [showOutline, setShowOutline] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>('editor');

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('zenith-theme') as Theme) || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZenMode(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('zenith-theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const t = TRANSLATIONS[language];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-black transition-colors duration-400">
      {/* Toolbar Area */}
      {!isZenMode && (
        <div className="z-50 shrink-0 overflow-visible">
          <Toolbar 
            markdown={markdown}
            setMarkdown={setMarkdown}
            fileName={fileName}
            setFileName={setFileName}
            editorRef={editorRef}
            theme={theme}
            toggleTheme={toggleTheme}
            language={language}
            setLanguage={setLanguage}
            t={t.toolbar}
            showOutline={showOutline}
            setShowOutline={setShowOutline}
            onNewFile={() => setMarkdown('')}
            onUndo={() => {}} 
            onRedo={() => {}}
            canUndo={false}
            canRedo={false}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(true)}
          />
        </div>
      )}

      {/* Zen Mode Exit Button */}
      {isZenMode && (
        <div className="fixed top-8 right-8 z-[100] animate-in fade-in duration-500">
           <Button onClick={() => setIsZenMode(false)} variant="icon" className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full w-12 h-12 border border-slate-200 dark:border-white/10 shadow-2xl" tooltip="Exit Zen Mode (Esc)">
              <Minimize2 size={24} className="text-slate-800 dark:text-white" />
           </Button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative w-full">
        {!isZenMode && (
          <Outline 
              markdown={markdown} 
              onSelect={(line) => {
                if (editorRef.current) {
                  editorRef.current.scrollTop = line * 24;
                }
              }} 
              isOpen={showOutline} 
          />
        )}

        <ResizableLayout
          isZenMode={isZenMode}
          activeTab={activeTab}
          left={
            <div className={`h-full flex flex-col ${isZenMode ? 'max-w-3xl mx-auto w-full pt-12 md:pt-24' : 'w-full'}`}>
              <Editor 
                value={markdown} 
                onChange={setMarkdown} 
                onScroll={() => {}}
                editorRef={editorRef}
                t={t}
                hideLineNumbers={isZenMode}
              />
            </div>
          }
          right={
            <Preview 
              content={markdown} 
              previewRef={previewRef}
              t={t}
            />
          }
        />

        {/* Mobile Tab Switcher */}
        {!isZenMode && (
          <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white/80 dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-2xl z-50">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === 'editor' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <PenTool size={18} />
              <span className="text-sm font-medium">Editor</span>
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === 'preview' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Eye size={18} />
              <span className="text-sm font-medium">Preview</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;