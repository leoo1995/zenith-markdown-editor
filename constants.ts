import { I18nSchema, Language } from './types';

export const DEFAULT_MARKDOWN = `# Welcome to Zenith Editor

Start typing in the **editor** on the left, and see the *magic* happen on the right.

## Features

- [x] Live Preview
- [x] Syntax Highlighting
- [x] Sync Scrolling
- [x] Dark Mode

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci
`;

export const TRANSLATIONS: Record<Language, I18nSchema> = {
  en: {
    toolbar: {
      file: 'File',
      new: 'New File',
      open: 'Open...',
      save: 'Save',
      exportPdf: 'Export PDF',
      exportHtml: 'Export HTML',
      insert: 'Insert',
      format: 'Format',
      view: 'View',
    },
    editor: {
      placeholder: 'Type your markdown here...',
    },
    preview: {
      placeholder: 'Preview will appear here...',
    },
    contextMenu: {
      copy: 'Copy',
      cut: 'Cut',
      paste: 'Paste',
      insertLink: 'Insert Link',
      format: 'Format Document',
    },
  },
  es: {
    toolbar: {
      file: 'Archivo',
      new: 'Nuevo Archivo',
      open: 'Abrir...',
      save: 'Guardar',
      exportPdf: 'Exportar PDF',
      exportHtml: 'Exportar HTML',
      insert: 'Insertar',
      format: 'Formato',
      view: 'Vista',
    },
    editor: {
      placeholder: 'Escribe tu markdown aquí...',
    },
    preview: {
      placeholder: 'La vista previa aparecerá aquí...',
    },
    contextMenu: {
      copy: 'Copiar',
      cut: 'Cortar',
      paste: 'Pegar',
      insertLink: 'Insertar Enlace',
      format: 'Formatear Documento',
    },
  },
};

export const EMOJI_MAP: Record<string, string> = {
  // Faces
  'smile': '😄', 'happy': '😃', 'grin': '😁', 'joy': '😂', 'wink': '😉',
  'cool': '😎', 'love': '😍', 'kiss': '😘', 'thinking': '🤔', 'neutral': '😐',
  'sad': '😢', 'cry': '😭', 'angry': '😠', 'rage': '😡', 'mindblown': '🤯',
  'sunglasses': '😎', 'clown': '🤡', 'ghost': '👻', 'skull': '💀', 'alien': '👽',
  
  // Hands
  'thumbsup': '👍', '+1': '👍', 'thumbsdown': '👎', '-1': '👎',
  'ok': '👌', 'clap': '👏', 'wave': '👋', 'pray': '🙏', 'muscle': '💪',
  'point_up': '☝️', 'point_down': '👇', 'point_left': '👈', 'point_right': '👉',

  // Animals
  'dog': '🐶', 'cat': '🐱', 'mouse': '🐭', 'hamster': '🐹', 'rabbit': '🐰',
  'fox': '🦊', 'bear': '🐻', 'panda': '🐼', 'tiger': '🐯', 'lion': '🦁',
  'chicken': '🐔', 'penguin': '🐧', 'frog': '🐸', 'monkey': '🐵', 'unicorn': '🦄',

  // Nature
  'fire': '🔥', 'star': '⭐', 'sparkles': '✨', 'sun': '☀️', 'moon': '🌙',
  'cloud': '☁️', 'rain': '🌧️', 'lightning': '⚡', 'snowflake': '❄️',
  'tree': '🌳', 'flower': '🌺', 'rose': '🌹', 'earth': '🌍',

  // Objects
  'computer': '💻', 'desktop': '🖥️', 'phone': '📱', 'camera': '📷',
  'book': '📖', 'pencil': '✏️', 'pen': '🖊️', 'lock': '🔒', 'key': '🔑',
  'hammer': '🔨', 'wrench': '🔧', 'gear': '⚙️', 'gem': '💎', 'bell': '🔔',
  'search': '🔍', 'gift': '🎁', 'balloon': '🎈', 'tada': '🎉', 'confetti': '🎊',
  
  // Symbols
  'check': '✅', 'x': '❌', 'warning': '⚠️', 'info': 'ℹ️', 'question': '❓',
  'heart': '❤️', 'blue_heart': '💙', 'green_heart': '💚', 'yellow_heart': '💛',
  'purple_heart': '💜', 'exclamation': '❗', 'idea': '💡', 'zzz': '💤',
  
  // Dev
  'bug': '🐛', 'rocket': '🚀', 'chart': '📊', 'calendar': '📅', 'memo': '📝'
};