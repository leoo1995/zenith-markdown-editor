
import { EMOJI_MAP } from './constants';
import saveAs from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import html2pdf from 'html2pdf.js';

export const insertTextAtCursor = (original: string, start: number, end: number, prefix: string, suffix: string = '') => {
  const before = original.substring(0, start);
  const selection = original.substring(start, end);
  const after = original.substring(end);
  const newText = before + prefix + selection + suffix + after;
  const newCursor = start + prefix.length + selection.length + suffix.length;
  return { text: newText, newCursor };
};

export const insertAtLineStart = (original: string, cursorIndex: number, insertion: string) => {
  const lastNewline = original.lastIndexOf('\n', cursorIndex - 1);
  const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;
  const before = original.substring(0, insertPos);
  const after = original.substring(insertPos);
  return { text: before + insertion + after, newCursor: cursorIndex + insertion.length };
};

export const insertListMarker = (markdown: string, cursorIndex: number, marker: string) => {
  const lastNewline = markdown.lastIndexOf('\n', cursorIndex - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const currentLineContent = markdown.substring(lineStart, cursorIndex);
  const prefix = currentLineContent.trim().length === 0 ? marker : `\n${marker}`;
  return { text: markdown.substring(0, cursorIndex) + prefix + markdown.substring(cursorIndex), newCursor: cursorIndex + prefix.length };
};

export const extractHeadings = (markdown: string) => {
  const lines = markdown.split('\n');
  const headings: any[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) headings.push({ level: match[1].length, text: match[2], line: index });
  });
  return headings;
};

export const generateFilename = (content: string) => {
  const date = new Date().toISOString().split('T')[0];
  return `${date}-zenith.md`;
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  saveAs(blob, filename);
};

export const exportToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // Added 'as const' to orientation to satisfy TypeScript union type requirement
  const opt = { 
    margin: 10, 
    filename: `${filename}.pdf`, 
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 }, 
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const } 
  };
  
  html2pdf().set(opt).from(element).save();
};

export const exportToHtml = (content: string, title: string) => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}pre{background:#f4f4f4;padding:1rem;border-radius:4px;overflow-x:auto}code{font-family:monospace;background:#f4f4f4;padding:0.2rem 0.4rem;border-radius:3px}blockquote{border-left:4px solid #ddd;padding-left:1rem;margin:1rem 0;color:#666}</style></head><body>${content}</body></html>`;
    downloadFile(html, `${title}.html`, 'text/html');
};

/**
 * NATIVE DOCX EXPORT
 * Professional mapping of Markdown elements to native docx objects.
 */
export const exportToDocx = async (markdown: string, title: string) => {
    try {
        const children: any[] = [];
        const lines = markdown.split('\n');

        const parseInlineStyles = (text: string) => {
            const runs: any[] = [];
            let lastIdx = 0;
            const regex = /(\*\*|__|\*|_)(.*?)\1/g;
            let match;

            while ((match = regex.exec(text)) !== null) {
                if (match.index > lastIdx) {
                    runs.push(new TextRun({ text: text.substring(lastIdx, match.index) }));
                }
                const marker = match[1];
                const content = match[2];
                runs.push(new TextRun({
                    text: content,
                    bold: marker.length === 2,
                    italics: marker.length === 1
                }));
                lastIdx = regex.lastIndex;
            }

            if (lastIdx < text.length) {
                runs.push(new TextRun({ text: text.substring(lastIdx) }));
            }
            return runs.length > 0 ? runs : [new TextRun({ text })];
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                children.push(new Paragraph({ text: "" }));
                return;
            }

            if (trimmed.startsWith('# ')) {
                children.push(new Paragraph({ text: trimmed.substring(2), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
            } else if (trimmed.startsWith('## ')) {
                children.push(new Paragraph({ text: trimmed.substring(3), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }));
            } else if (trimmed.startsWith('### ')) {
                children.push(new Paragraph({ text: trimmed.substring(4), heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }));
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                children.push(new Paragraph({ children: parseInlineStyles(trimmed.substring(2)), bullet: { level: 0 } }));
            } else if (trimmed.startsWith('> ')) {
                children.push(new Paragraph({ children: parseInlineStyles(trimmed.substring(2)), indent: { left: 720 }, spacing: { before: 200, after: 200 } }));
            } else {
                children.push(new Paragraph({ children: parseInlineStyles(trimmed), spacing: { after: 120 } }));
            }
        });

        const doc = new Document({ 
            title: title,
            sections: [{ 
                properties: {},
                children 
            }] 
        });
        
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${title}.docx`);
    } catch (e) {
        console.error("DOCX Export Error", e);
        alert("Error exporting DOCX. Please check the console.");
    }
};

export const filterEmojis = (query: string) => {
    const q = query.toLowerCase();
    return Object.entries(EMOJI_MAP)
        .filter(([key]) => key.includes(q))
        .map(([id, char]) => ({ id, char }))
        .slice(0, 10);
};

export const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);
    Array.from(style).forEach(prop => div.style.setProperty(prop, style.getPropertyValue(prop)));
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.textContent = element.value.substring(0, position);
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    document.body.appendChild(div);
    const coords = { top: span.offsetTop, left: span.offsetLeft };
    document.body.removeChild(div);
    return coords;
};

export const getSmartEnter = (value: string, cursor: number) => {
    return { text: value, newCursor: cursor, handled: false };
};
export const formatMarkdown = (text: string) => text.trim();
