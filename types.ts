export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';
export type Tab = 'editor' | 'preview';

export interface Position {
  x: number;
  y: number;
}

export interface SelectionRange {
  start: number;
  end: number;
}

export interface I18nSchema {
  toolbar: {
    file: string;
    new: string;
    open: string;
    save: string;
    exportPdf: string;
    exportHtml: string;
    insert: string;
    format: string;
    view: string;
  };
  editor: {
    placeholder: string;
  };
  preview: {
    placeholder: string;
  };
  contextMenu: {
    copy: string;
    cut: string;
    paste: string;
    insertLink: string;
    format: string;
  };
}

export interface EditorContextProps {
  markdown: string;
  setMarkdown: (md: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: I18nSchema;
}