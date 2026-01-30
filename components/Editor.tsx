import React, { useRef, useState, useEffect, useMemo } from 'react';
import { I18nSchema, Position } from '../types';
import { BubbleMenu, ContextMenu } from './Menus';
import { insertTextAtCursor, indentSelection, getSmartEnter, formatMarkdown, filterEmojis, getCaretCoordinates, EmojiMatch } from '../utils';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  t: I18nSchema;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, onScroll, editorRef, t }) => {
  const [bubblePos, setBubblePos] = useState<Position | null>(null);
  const [contextPos, setContextPos] = useState<Position | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  
  const [emojiQuery, setEmojiQuery] = useState<string | null>(null);
  const [emojiMenuPos, setEmojiMenuPos] = useState<Position | null>(null);
  const [emojiResults, setEmojiResults] = useState<EmojiMatch[]>([]);
  const [emojiSelectedIndex, setEmojiSelectedIndex] = useState<number>(0);
  
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => value.split('\n'), [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextPos && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextPos(null);
      }
      if (bubblePos && !window.getSelection()?.toString()) {
         setBubblePos(null);
      }
      if (emojiQuery !== null) {
          setEmojiQuery(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextPos, bubblePos, emojiQuery]);

  const updateCurrentLine = (textarea: HTMLTextAreaElement) => {
    const cursor = textarea.selectionStart;
    const textUpToCursor = textarea.value.substring(0, cursor);
    const lineIndex = textUpToCursor.split('\n').length - 1;
    setCurrentLineIndex(lineIndex);
  };

  const handleScrollWrapper = (e: React.UIEvent<HTMLTextAreaElement>) => {
    onScroll(e);
    if (lineNumberRef.current) {
      lineNumberRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    updateCurrentLine(target);

    if (target.selectionStart !== target.selectionEnd) {
      setSelection({ start: target.selectionStart, end: target.selectionEnd });
    } else {
      setBubblePos(null);
      setSelection(null);
    }
    
    const cursor = target.selectionStart;
    const textBefore = target.value.substring(0, cursor);
    const match = textBefore.match(/:([a-z0-9_+-]{2,})$/i);

    if (match) {
      const query = match[1];
      const results = filterEmojis(query);
      if (results.length > 0) {
        setEmojiQuery(query);
        setEmojiResults(results);
        setEmojiSelectedIndex(0);
        const coords = getCaretCoordinates(target, cursor);
        const top = coords.top - target.scrollTop;
        const left = coords.left;
        setEmojiMenuPos({ x: left, y: top + 24 });
      } else {
        setEmojiQuery(null);
      }
    } else {
      setEmojiQuery(null);
    }
  };

  const insertEmoji = (emoji: EmojiMatch) => {
    if (!editorRef.current || !emojiQuery) return;
    const textarea = editorRef.current;
    const cursor = textarea.selectionStart;
    const start = cursor - emojiQuery.length - 1;
    const end = cursor;
    
    const result = insertTextAtCursor(value, start, end, emoji.char, '');
    onChange(result.text);
    setEmojiQuery(null);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(result.newCursor, result.newCursor);
    }, 0);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLTextAreaElement;
    if (e.button === 2) return;

    if (target.selectionStart !== target.selectionEnd) {
      setBubblePos({ x: e.clientX, y: e.clientY - 10 });
    } else {
      setBubblePos(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextPos({ x: e.clientX, y: e.clientY });
    setBubblePos(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd } = textarea;

    if (emojiQuery) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setEmojiSelectedIndex(i => (i + 1) % emojiResults.length);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setEmojiSelectedIndex(i => (i - 1 + emojiResults.length) % emojiResults.length);
            return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertEmoji(emojiResults[emojiSelectedIndex]);
            return;
        }
        if (e.key === 'Escape' || e.key === ' ') {
            setEmojiQuery(null);
            if(e.key === 'Escape') e.preventDefault();
            return;
        }
    }

    if (e.key === 'Tab' && !emojiQuery) {
      e.preventDefault();
      const result = indentSelection(value, selectionStart, selectionEnd);
      onChange(result.text);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(result.newStart, result.newEnd);
      }, 0);
      return;
    }

    if (e.key === 'Enter' && !emojiQuery) {
        const smartEnter = getSmartEnter(value, selectionStart);
        if (smartEnter.handled) {
            e.preventDefault();
            onChange(smartEnter.text);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(smartEnter.newCursor, smartEnter.newCursor);
                updateCurrentLine(textarea);
            }, 0);
            return;
        }
    }

    if (selectionStart !== selectionEnd) {
      const pairMap: Record<string, string> = {
        '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`', '~': '~',
      };
      if (pairMap[e.key]) {
        e.preventDefault();
        const open = e.key;
        const close = pairMap[e.key];
        const result = insertTextAtCursor(value, selectionStart, selectionEnd, open, close);
        onChange(result.text);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(selectionStart + open.length, result.newCursor - close.length);
        }, 0);
      }
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setTimeout(() => updateCurrentLine(textarea), 0);
    }
  };

  const handleMenuAction = async (action: string) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = selection ? selection.start : textarea.selectionStart;
    const end = selection ? selection.end : textarea.selectionEnd;
    let result;
    let cursorOffset = 0;
    try {
        switch (action) {
        case 'bold': result = insertTextAtCursor(value, start, end, '**', '**'); break;
        case 'italic': result = insertTextAtCursor(value, start, end, '*', '*'); break;
        case 'strikethrough': result = insertTextAtCursor(value, start, end, '~~', '~~'); break;
        case 'link': result = insertTextAtCursor(value, start, end, '[', ']()'); cursorOffset = -1; break;
        case 'copy': 
            await navigator.clipboard.writeText(value.substring(start, end)); 
            setContextPos(null); 
            return;
        case 'cut':
            await navigator.clipboard.writeText(value.substring(start, end));
            const before = value.substring(0, start);
            const after = value.substring(end);
            onChange(before + after);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start, start);
            }, 0);
            setContextPos(null);
            return;
        case 'paste':
            const text = await navigator.clipboard.readText();
            result = insertTextAtCursor(value, start, end, text, '');
            break;
        case 'format':
            const formatted = formatMarkdown(value);
            onChange(formatted);
            setContextPos(null);
            return;
        default: return;
        }
        if (result) {
          onChange(result.text);
          setTimeout(() => {
              textarea.focus();
              const finalCursor = result.newCursor + cursorOffset;
              textarea.setSelectionRange(finalCursor, finalCursor);
          }, 0);
        }
    } catch (err) {
        console.error("Clipboard action failed", err);
    }
    setBubblePos(null);
    setContextPos(null);
  };

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-black flex group overflow-hidden">
      <BubbleMenu position={bubblePos} onAction={handleMenuAction} />
      <ContextMenu 
        ref={contextMenuRef}
        position={contextPos} 
        onClose={() => {}} 
        onAction={handleMenuAction} 
        t={t.contextMenu}
      />

      {emojiQuery && emojiMenuPos && (
          <div 
             className="
                absolute z-50 w-64 max-h-48 overflow-y-auto 
                bg-white/95 dark:bg-slate-900/95 backdrop-blur-md 
                border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl 
                flex flex-col origin-top-left
                animate-in fade-in zoom-in-95 duration-200
             "
             style={{ top: emojiMenuPos.y, left: Math.min(emojiMenuPos.x, window.innerWidth - 300) }}
          >
             {emojiResults.length > 0 ? emojiResults.map((emoji, idx) => (
                 <button
                    key={emoji.id}
                    className={`
                        flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors duration-150
                        ${idx === emojiSelectedIndex ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                    `}
                    onClick={() => insertEmoji(emoji)}
                    onMouseEnter={() => setEmojiSelectedIndex(idx)}
                 >
                    <span className="text-xl">{emoji.char}</span>
                    <span className="text-slate-700 dark:text-slate-300">:{emoji.id}:</span>
                 </button>
             )) : (
                 <div className="p-2 text-xs text-slate-400 italic">No matching emojis</div>
             )}
          </div>
      )}
      
      <div 
        ref={lineNumberRef}
        className="
          hidden md:block w-12 py-6 pr-3 text-right overflow-hidden select-none z-10
          bg-slate-200/50 dark:bg-slate-900/40 border-r border-slate-300 dark:border-slate-800
          text-slate-400 dark:text-slate-600 font-mono text-sm md:text-base leading-relaxed
        "
        aria-hidden="true"
      >
        {lines.map((_, i) => (
          <div 
            key={i} 
            className={`transition-colors duration-200 ease-in-out ${i === currentLineIndex ? 'text-blue-500 dark:text-blue-400 font-bold' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="flex-1 relative h-full">
        <div 
            ref={backdropRef}
            className="absolute inset-0 pointer-events-none p-6 font-mono text-sm md:text-base leading-relaxed whitespace-pre z-0 overflow-hidden"
            aria-hidden="true"
        >
            {lines.map((_, i) => (
                <div 
                    key={i} 
                    className={`w-full transition-colors duration-200 ease-in-out ${i === currentLineIndex ? 'bg-black/[0.04] dark:bg-white/[0.07]' : 'bg-transparent'}`}
                >
                    &#8203;
                </div>
            ))}
        </div>

        <textarea
            ref={editorRef}
            value={value}
            onChange={(e) => {
                onChange(e.target.value);
                setTimeout(() => updateCurrentLine(e.target), 0);
            }}
            onScroll={handleScrollWrapper}
            onSelect={handleSelect}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
            onKeyDown={handleKeyDown}
            onClick={(e) => updateCurrentLine(e.currentTarget)}
            className="
            absolute inset-0 w-full h-full p-6 resize-none outline-none 
            font-mono text-sm md:text-base 
            bg-transparent text-slate-800 dark:text-slate-50 
            leading-relaxed whitespace-pre
            selection:bg-blue-200 dark:selection:bg-blue-900/60
            z-10
            "
            placeholder={t.editor.placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
        />
      </div>
    </div>
  );
};