import React, { useState, useRef } from 'react';
import { 
  FileText, Save, FolderOpen, Sun, Moon, 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  List, ListOrdered, Code, Quote, Image, Link, Table as TableIcon, Minus,
  PanelLeft, Check, Undo2, Redo2, Loader2, Share, Maximize2
} from 'lucide-react';
import { Button } from './ui/Button';
import { ExportMenu } from './ExportMenu';
import { I18nSchema, Language, Theme } from '../types';
import { 
  insertTextAtCursor, 
  insertAtLineStart, 
  insertListMarker, 
  downloadFile, 
  generateFilename,
  exportToPdf,
  exportToDocx,
  exportToHtml
} from '../utils';

interface ToolbarProps {
  markdown: string;
  setMarkdown: (s: string) => void;
  fileName: string;
  setFileName: (s: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: I18nSchema['toolbar'];
  showOutline: boolean;
  setShowOutline: (v: boolean) => void;
  onNewFile: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isZenMode: boolean;
  onToggleZen: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  markdown,
  setMarkdown,
  fileName,
  setFileName,
  editorRef,
  theme,
  toggleTheme,
  language,
  setLanguage,
  t,
  showOutline,
  setShowOutline,
  onNewFile,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleZen
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [themeAnimate, setThemeAnimate] = useState(false);

  const focusEditor = () => {
    setTimeout(() => {
        editorRef.current?.focus();
    }, 0);
  };

  const handleToggleTheme = () => {
    setThemeAnimate(true);
    toggleTheme();
    setTimeout(() => setThemeAnimate(false), 400);
  };

  const handleUndoClick = () => {
    onUndo();
    focusEditor();
  };

  const handleRedoClick = () => {
    onRedo();
    focusEditor();
  };

  const handleInsert = (prefix: string, suffix: string = '', cursorOffset: number = 0) => {
    if (!editorRef.current) return;
    const { selectionStart, selectionEnd } = editorRef.current;
    const result = insertTextAtCursor(markdown, selectionStart, selectionEnd, prefix, suffix);
    setMarkdown(result.text);
    
    setTimeout(() => {
      editorRef.current?.focus();
      const finalCursor = result.newCursor + cursorOffset;
      editorRef.current?.setSelectionRange(finalCursor, finalCursor);
    }, 0);
  };

  const handleLinePrefix = (prefix: string) => {
    if (!editorRef.current) return;
    const { selectionStart } = editorRef.current;
    
    const result = insertAtLineStart(markdown, selectionStart, prefix);
    setMarkdown(result.text);

    setTimeout(() => {
        editorRef.current?.focus();
        editorRef.current?.setSelectionRange(result.newCursor, result.newCursor);
    }, 0);
  };

  const handleList = (marker: string) => {
    if (!editorRef.current) return;
    const { selectionStart } = editorRef.current;

    const result = insertListMarker(markdown, selectionStart, marker);
    setMarkdown(result.text);

    setTimeout(() => {
        editorRef.current?.focus();
        editorRef.current?.setSelectionRange(result.newCursor, result.newCursor);
    }, 0);
  };

  const handleOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.replace('.md', ''));
      const reader = new FileReader();
      reader.onload = (ev) => setMarkdown(ev.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    localStorage.setItem('zenith-md-content', markdown);
    const downloadName = generateFilename(markdown);
    downloadFile(markdown, downloadName, 'text/markdown');
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleExportAction = async (type: 'pdf' | 'docx' | 'html') => {
    if (isExporting) return;
    setShowExportMenu(false);
    setIsExporting(true);
    
    const safeName = (fileName || 'untitled').replace(/[^a-z0-9-_]/gi, '-');
    const previewElement = document.getElementById('preview-pane');

    try {
        if (type === 'pdf') {
            await exportToPdf('preview-pane', safeName);
        } else if (type === 'docx') {
            await exportToDocx(markdown, safeName);
        } else if (type === 'html') {
            exportToHtml(previewElement?.innerHTML || '', safeName);
        }
    } catch (e) {
        console.error("Export failed", e);
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="no-print min-h-[3.5rem] py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0A0A] flex flex-wrap items-center px-4 justify-between sticky top-0 z-[60] shadow-sm overflow-visible">
      <div className="flex flex-wrap items-center gap-1 md:gap-2">
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <Button onClick={() => setShowOutline(!showOutline)} active={showOutline} tooltip="Toggle Outline" variant="icon" className="hidden lg:flex"><PanelLeft size={18} /></Button>
          <div className="w-px h-6 bg-transparent" />
          
          <Button onClick={onNewFile} tooltip={t.new} variant="icon"><FileText size={18} /></Button>
          <div className="relative">
            <Button onClick={() => fileInputRef.current?.click()} tooltip={t.open} variant="icon"><FolderOpen size={18} /></Button>
            <input type="file" ref={fileInputRef} onChange={handleOpen} accept=".md,.txt" className="hidden" />
          </div>
          
          <Button 
            onClick={handleSave} 
            tooltip={isSaving ? "Saved!" : t.save} 
            variant="icon"
            className={isSaving ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" : ""}
          >
            {isSaving ? <Check size={18} className="animate-in zoom-in spin-in-180 duration-300" /> : <Save size={18} />}
          </Button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <Button onClick={handleUndoClick} disabled={!canUndo} tooltip="Undo (Ctrl+Z)" variant="icon"><Undo2 size={18} /></Button>
          <Button onClick={handleRedoClick} disabled={!canRedo} tooltip="Redo (Ctrl+Shift+Z)" variant="icon"><Redo2 size={18} /></Button>
        </div>

        <div className="hidden md:flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <Button onClick={() => handleLinePrefix('# ')} tooltip="H1" variant="icon"><Heading1 size={18} /></Button>
          <Button onClick={() => handleLinePrefix('## ')} tooltip="H2" variant="icon"><Heading2 size={18} /></Button>
          <Button onClick={() => handleLinePrefix('### ')} tooltip="H3" variant="icon"><Heading3 size={18} /></Button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <Button onClick={() => handleInsert('**', '**')} tooltip="Bold" variant="icon"><Bold size={18} /></Button>
          <Button onClick={() => handleInsert('*', '*')} tooltip="Italic" variant="icon"><Italic size={18} /></Button>
          <Button onClick={() => handleInsert('~~', '~~')} tooltip="Strike" variant="icon"><Strikethrough size={18} /></Button>
          <Button onClick={() => handleInsert('`', '`')} tooltip="Code" variant="icon"><Code size={18} /></Button>
        </div>

        <div className="hidden lg:flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
            <Button onClick={() => handleLinePrefix('> ')} tooltip="Quote" variant="icon"><Quote size={18} /></Button>
            <Button onClick={() => handleList('- ')} tooltip="List" variant="icon"><List size={18} /></Button>
            <Button onClick={() => handleList('1. ')} tooltip="Ordered List" variant="icon"><ListOrdered size={18} /></Button>
            <Button onClick={() => handleInsert('![Alt text](', ')', -1) } tooltip="Image" variant="icon"><Image size={18} /></Button>
            <Button onClick={() => handleInsert('[', ']()', -1)} tooltip="Link" variant="icon"><Link size={18} /></Button>
             <Button onClick={() => handleInsert('\n| Col 1 | Col 2 |\n|---|---|\n| Val 1 | Val 2 |', '')} tooltip="Table" variant="icon"><TableIcon size={18} /></Button>
             <Button onClick={() => handleInsert('\n---\n', '')} tooltip="Divider" variant="icon"><Minus size={18} /></Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
             <Button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className="text-xs min-w-[90px] gap-2"
                disabled={isExporting}
                variant="secondary"
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Share size={14} />}
                Export
              </Button>
              <ExportMenu 
                isOpen={showExportMenu} 
                onClose={() => setShowExportMenu(false)} 
                onAction={handleExportAction} 
              />
        </div>

        <Button onClick={onToggleZen} tooltip="Zen Mode (Focus)" variant="icon" className="hidden md:flex">
          <Maximize2 size={18} />
        </Button>

        <Button onClick={handleToggleTheme} variant="icon">
          {theme === 'dark' ? (
            <Sun size={18} className={themeAnimate ? 'theme-icon-animate' : ''} />
          ) : (
            <Moon size={18} className={themeAnimate ? 'theme-icon-animate' : ''} />
          )}
        </Button>
        <Button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} variant="icon" className="font-bold text-xs w-8">
          {language.toUpperCase()}
        </Button>
      </div>
    </div>
  );
};