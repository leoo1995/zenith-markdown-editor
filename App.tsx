import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Outline } from './components/Outline';
import { Button } from './components/ui/Button';
import { ConfirmationModal } from './components/ui/ConfirmationModal';
import { ResizableLayout } from './components/ResizableLayout';
import { Eye, PenTool, Minimize2 } from 'lucide-react';
import { TRANSLATIONS, DEFAULT_MARKDOWN } from './constants';
import { Language, Theme, Tab } from './types';

function App() {
  // --- State ---
  const [markdown, setMarkdown] = useState<string>('');
  const [fileName, setFileName] = useState<string>('untitled');
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [showOutline, setShowOutline] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // --- History State ---
  const [history, setHistory] = useState<string[]>([DEFAULT_MARKDOWN]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastHistoryTimeRef = useRef<number>(Date.now());

  // --- Refs for Scroll Sync ---
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);

  // --- Initialization & Persistence ---
  useEffect(() => {
    // Load preferences
    const savedTheme = (localStorage.getItem('zenith-theme') as Theme) || 'light';
    const savedLang = (localStorage.getItem('zenith-lang') as Language) || 'en';
    const savedContent = localStorage.getItem('zenith-md-content');

    setTheme(savedTheme);
    setLanguage(savedLang);
    
    // Initialize content and history
    const initialContent = savedContent !== null ? savedContent : DEFAULT_MARKDOWN;
    setMarkdown(initialContent);
    setHistory([initialContent]);
    setHistoryIndex(0);

    // Apply theme immediately
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // --- Handlers ---
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('zenith-theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('zenith-lang', lang);
  };

  const toggleZenMode = () => {
    setIsZenMode(!isZenMode);
    if (!isZenMode) {
      setShowOutline(false);
    }
  };

  // --- History Management (Smart Debounce) ---
  const handleMarkdownChange = (newValue: string) => {
    setMarkdown(newValue);

    const now = Date.now();
    const timeDiff = now - lastHistoryTimeRef.current;
    
    if (timeDiff > 1000 || historyIndex < history.length - 1) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newValue);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        lastHistoryTimeRef.current = now;
    } else {
        setHistory(prev => {
            const copy = [...prev];
            copy[historyIndex] = newValue;
            return copy;
        });
        lastHistoryTimeRef.current = now; 
    }
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setMarkdown(history[newIndex]);
        lastHistoryTimeRef.current = 0; 
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setMarkdown(history[newIndex]);
        lastHistoryTimeRef.current = 0;
    }
  }, [history, historyIndex]);

  // --- Task Toggle Logic ---
  const handleTaskToggle = (lineIndex: number, currentChecked: boolean) => {
      const lines = markdown.split('\n');
      if (lineIndex < 0 || lineIndex >= lines.length) return;
      const line = lines[lineIndex];
      const regex = /^(\s*[-*+]\s\[)([ xX])(\].*)$/;
      const match = line.match(regex);

      if (match) {
          const newStatus = currentChecked ? ' ' : 'x'; 
          const newLine = match[1] + newStatus + match[3];
          lines[lineIndex] = newLine;
          const newMarkdown = lines.join('\n');
          handleMarkdownChange(newMarkdown);
          lastHistoryTimeRef.current = 0; 
      }
  };

  const handleNewFileRequest = () => {
    const isDirty = markdown.trim() !== '' && markdown !== DEFAULT_MARKDOWN;
    if (isDirty) {
      setIsConfirmModalOpen(true);
    } else {
      clearEditor();
    }
  };

  const clearEditor = () => {
    setMarkdown('');
    setFileName('untitled');
    setShowOutline(false);
    setHistory(['']);
    setHistoryIndex(0);
    localStorage.setItem('zenith-md-content', '');
    setIsConfirmModalOpen(false);
  };

  // --- Scroll Synchronization Logic ---
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (isScrollingRef.current === 'preview') return;
    isScrollingRef.current = 'editor';
    const textarea = e.currentTarget;
    const preview = previewRef.current;
    if (preview) {
      const percentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    }
    setTimeout(() => { isScrollingRef.current = null; }, 50);
  };

  const handleOutlineClick = (lineNumber: number) => {
    if (editorRef.current) {
        const LINE_HEIGHT = 24; 
        const targetScroll = lineNumber * LINE_HEIGHT;
        editorRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
        if (previewRef.current) {
             const textarea = editorRef.current;
             const percentage = targetScroll / (textarea.scrollHeight - textarea.clientHeight);
             previewRef.current.scrollTo({
                top: percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight),
                behavior: 'smooth'
             });
        }
    }
  };

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) redo(); else undo();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        }
        if (e.key === 'Escape' && isZenMode) {
            setIsZenMode(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, isZenMode]);


  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-black">
      {!isZenMode && (
        <Toolbar 
          markdown={markdown}
          setMarkdown={handleMarkdownChange}
          fileName={fileName}
          setFileName={setFileName}
          editorRef={editorRef}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          setLanguage={changeLanguage}
          t={t.toolbar}
          showOutline={showOutline}
          setShowOutline={setShowOutline}
          onNewFile={handleNewFileRequest}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          isZenMode={isZenMode}
          onToggleZen={toggleZenMode}
        />
      )}

      {/* Floating Exit Zen Button */}
      {isZenMode && (
        <div className="fixed top-6 right-6 z-[100] opacity-20 hover:opacity-100 transition-opacity">
           <Button onClick={toggleZenMode} variant="secondary" className="rounded-full w-10 h-10 p-0 shadow-lg" tooltip="Exit Zen Mode (Esc)">
              <Minimize2 size={18} />
           </Button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title={language === 'es' ? '¿Crear nuevo archivo?' : 'Create new file?'}
        message={language === 'es' 
          ? 'Se perderán los cambios que no hayas guardado. ¿Deseas continuar?' 
          : 'Unsaved changes will be lost. Do you wish to continue?'}
        confirmText={language === 'es' ? 'Confirmar y Limpiar' : 'Confirm and Clear'}
        cancelText={language === 'es' ? 'Cancelar' : 'Cancel'}
        onConfirm={clearEditor}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Outline 
            markdown={markdown} 
            onSelect={handleOutlineClick} 
            isOpen={showOutline && !isZenMode} 
        />

        <ResizableLayout
          isZenMode={isZenMode}
          activeTab={activeTab}
          left={
            <Editor 
              value={markdown} 
              onChange={handleMarkdownChange} 
              onScroll={handleEditorScroll}
              editorRef={editorRef}
              t={t}
            />
          }
          right={
            <Preview 
              content={markdown} 
              previewRef={previewRef}
              t={t}
              onToggleTask={handleTaskToggle}
            />
          }
        />

        {/* Mobile Floating Tab Switcher */}
        {!isZenMode && (
          <div className="md:hidden absolute bottom-6 right-6 flex gap-2 no-print">
            <Button 
              onClick={() => setActiveTab('editor')} 
              active={activeTab === 'editor'}
              variant="primary"
              className="rounded-full w-12 h-12 shadow-lg"
            >
              <PenTool size={20} />
            </Button>
            <Button 
              onClick={() => setActiveTab('preview')} 
              active={activeTab === 'preview'}
              variant="primary"
              className="rounded-full w-12 h-12 shadow-lg"
            >
              <Eye size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;