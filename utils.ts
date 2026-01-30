import { EMOJI_MAP } from './constants';

/**
 * Inserts text into a string at specific indices or wraps selection
 */
export const insertTextAtCursor = (
  original: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string = ''
): { text: string; newCursor: number } => {
  const before = original.substring(0, start);
  const selection = original.substring(start, end);
  const after = original.substring(end);

  const newText = before + prefix + selection + suffix + after;
  const newCursor = start + prefix.length + selection.length + suffix.length;

  return { text: newText, newCursor };
};

/**
 * Inserts text at the beginning of the line where the cursor is currently located.
 */
export const insertAtLineStart = (
  original: string,
  cursorIndex: number,
  insertion: string
): { text: string; newCursor: number } => {
  const lastNewline = original.lastIndexOf('\n', cursorIndex - 1);
  const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;
  
  const before = original.substring(0, insertPos);
  const after = original.substring(insertPos);
  
  const newText = before + insertion + after;
  const newCursor = cursorIndex + insertion.length;

  return { text: newText, newCursor };
};

/**
 * Handles Tab indentation.
 */
export const indentSelection = (
  original: string,
  start: number,
  end: number
): { text: string; newStart: number; newEnd: number } => {
  const INDENT = '  '; 
  if (start === end) {
    const before = original.substring(0, start);
    const after = original.substring(end);
    return {
      text: before + INDENT + after,
      newStart: start + INDENT.length,
      newEnd: start + INDENT.length
    };
  }

  const lastNewlineBefore = original.lastIndexOf('\n', start - 1);
  const lineStart = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;
  
  const beforeBlock = original.substring(0, lineStart);
  const block = original.substring(lineStart, end);
  const afterBlock = original.substring(end);

  const indentedBlock = block.split('\n').map(line => INDENT + line).join('\n');
  
  return {
    text: beforeBlock + indentedBlock + afterBlock,
    newStart: start + INDENT.length, 
    newEnd: start + (indentedBlock.length - block.length) 
  };
};

/**
 * Inserts a list marker. If the line has content, it pushes to a new line.
 */
export const insertListMarker = (
  markdown: string,
  cursorIndex: number,
  marker: string
): { text: string; newCursor: number } => {
  const lastNewline = markdown.lastIndexOf('\n', cursorIndex - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const currentLineContent = markdown.substring(lineStart, cursorIndex);
  
  const isLineEmpty = currentLineContent.trim().length === 0;
  const prefix = isLineEmpty ? marker : `\n${marker}`;

  const before = markdown.substring(0, cursorIndex);
  const after = markdown.substring(cursorIndex);

  return {
    text: before + prefix + after,
    newCursor: cursorIndex + prefix.length
  };
};

/**
 * Smart Enter Logic: Handles auto-continuation or termination of lists/quotes
 */
export const getSmartEnter = (
  value: string,
  cursor: number
): { text: string; newCursor: number; handled: boolean } => {
  const lastNewline = value.lastIndexOf('\n', cursor - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const currentLine = value.substring(lineStart, cursor); 
  
  const match = currentLine.match(/^(\s*)([-*]|\d+\.|>)(\s+)(.*)$/);

  if (!match) return { text: value, newCursor: cursor, handled: false };

  const [_, indent, marker, space, content] = match;

  if (content.trim().length > 0) {
    let nextMarker = marker;
    if (/^\d+\.$/.test(marker)) {
      const num = parseInt(marker);
      nextMarker = `${num + 1}.`;
    }
    const insertion = `\n${indent}${nextMarker}${space}`;
    const before = value.substring(0, cursor);
    const after = value.substring(cursor);
    return {
      text: before + insertion + after,
      newCursor: cursor + insertion.length,
      handled: true
    };
  } 
  
  const lineEnd = value.indexOf('\n', cursor);
  const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
  const beforeLine = value.substring(0, lineStart);
  const afterLine = value.substring(actualLineEnd);
  
  return {
    text: beforeLine + '\n' + afterLine,
    newCursor: lineStart + 1,
    handled: true
  };
};

/**
 * Formats markdown document: trims lines and fixes spacing between blocks
 */
export const formatMarkdown = (text: string): string => {
  let formatted = text;
  formatted = formatted.split('\n').map(line => line.trimEnd()).join('\n');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
  return formatted.trim();
};

/**
 * Extracts headings for Outline
 */
export interface Heading {
  level: number;
  text: string;
  line: number;
}

export const extractHeadings = (markdown: string): Heading[] => {
  const lines = markdown.split('\n');
  const headings: Heading[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2],
        line: index
      });
    }
  });
  return headings;
};

/**
 * Generates a filename based on the content or current date
 */
export const generateFilename = (content: string): string => {
  const lines = content.trim().split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      const title = line.substring(2).trim();
      const safeTitle = title.replace(/[^a-z0-9\s-_]/gi, '').replace(/\s+/g, '-').toLowerCase();
      if (safeTitle.length > 0) {
        return `${safeTitle}.md`;
      }
    }
  }
  const date = new Date().toISOString().split('T')[0];
  return `${date}-zenith.md`;
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generates a standard light-themed HTML wrapper for exports.
 */
export const generateHtml = (title: string, content: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
body{font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;max-width:800px;margin:3rem auto;line-height:1.7;padding:0 2rem; color: #1a1a1b; background: #ffffff;}
img{max-width:100%; height: auto; display: block; margin: 1.5rem auto; border-radius: 8px;}
pre{background:#f8f9fa;padding:1.25rem;border-radius:6px;border:1px solid #e9ecef;overflow-x:auto; margin: 1.5rem 0;}
code{background:#f1f3f5;padding:0.2rem 0.4rem;border-radius:4px;font-family:Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 0.9em;}
pre code { background: transparent; padding: 0; }
blockquote{border-left:5px solid #007bff;margin:1.5rem 0;padding:0.5rem 0 0.5rem 1.5rem;color:#495057; background: #f8f9fa;}
table{border-collapse:collapse;width:100%; margin: 1.5rem 0;}
th,td{border:1px solid #dee2e6;padding:12px; text-align: left;}
th{background-color:#f1f3f5; font-weight: 600;}
h1,h2,h3,h4{color: #212529; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.2;}
h1{font-size: 2.5rem; border-bottom: 2px solid #f1f3f5; padding-bottom: 0.5rem;}
h2{font-size: 1.8rem; border-bottom: 1px solid #f1f3f5; padding-bottom: 0.3rem;}
p{margin-bottom: 1.25rem;}
ul, ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
li { margin-bottom: 0.5rem; }
</style>
</head>
<body>
${content}
</body>
</html>`;
};

// --- Emoji Utils ---
export interface EmojiMatch {
  id: string;
  char: string;
}

export const filterEmojis = (query: string): EmojiMatch[] => {
  const q = query.toLowerCase();
  return Object.entries(EMOJI_MAP)
    .filter(([key]) => key.includes(q))
    .map(([id, char]) => ({ id, char }))
    .slice(0, 10);
};

/**
 * Calculates the pixel coordinates of the caret in a textarea.
 */
export const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
  const div = document.createElement('div');
  const style = window.getComputedStyle(element);
  Array.from(style).forEach((prop) => {
    div.style.setProperty(prop, style.getPropertyValue(prop));
  });
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.top = '0';
  div.style.left = '0';
  div.textContent = element.value.substring(0, position);
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop + parseInt(style.borderTopWidth),
    left: span.offsetLeft + parseInt(style.borderLeftWidth),
    height: parseInt(style.lineHeight)
  };
  document.body.removeChild(div);
  return coordinates;
};

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

// --- PDF Export ---
export const exportToPdf = async (elementId: string, filename: string) => {
  if (!(window as any).html2pdf) {
     try {
       await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
     } catch (e) {
       console.error("Failed to load html2pdf library", e);
       alert("Could not load PDF library. Please check your connection.");
       return;
     }
  }
  const element = document.getElementById(elementId);
  if (!element) return;
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const opt = {
    margin: 10,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      onclone: (clonedDoc: Document) => {
         clonedDoc.documentElement.classList.remove('dark');
         clonedDoc.body.classList.remove('dark');
         clonedDoc.body.style.backgroundColor = '#ffffff';
         clonedDoc.body.style.color = '#1a1a1a';
         const clonedElement = clonedDoc.getElementById(elementId);
         if (clonedElement) {
           clonedElement.style.height = 'auto';
           clonedElement.style.overflow = 'visible';
           clonedElement.style.backgroundColor = '#ffffff';
           clonedElement.style.color = '#1a1a1a';
         }
      }
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  // @ts-ignore
  (window as any).html2pdf().set(opt).from(element).save();
};

// --- HTML Export ---
export const exportToHtml = (content: string, title: string) => {
    const html = generateHtml(title, content);
    downloadFile(html, `${title}.html`, 'text/html');
};

// --- DOCX Export (Native Implementation) ---
export const exportToDocx = async (markdown: string, title: string) => {
    try {
        const docxModule = await import('https://esm.sh/docx@9.0.0');
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docxModule;

        const children: any[] = [];
        const lines = markdown.split('\n');

        const parseInline = (text: string) => {
            const runs: any[] = [];
            let lastIndex = 0;
            const regex = /(\*\*\*|___|\*\*|__|\*|_)(.*?)\1/g;
            let match;

            while ((match = regex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    runs.push(new TextRun({ text: text.substring(lastIndex, match.index) }));
                }
                const marker = match[1];
                const content = match[2];
                runs.push(new TextRun({
                    text: content,
                    bold: marker.includes('**') || marker.includes('__'),
                    italic: marker.length === 1 || marker.length === 3
                }));
                lastIndex = regex.lastIndex;
            }

            if (lastIndex < text.length) {
                runs.push(new TextRun({ text: text.substring(lastIndex) }));
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
                children.push(new Paragraph({ children: parseInline(trimmed.substring(2)), bullet: { level: 0 }, spacing: { after: 100 } }));
            } else if (/^\d+\.\s/.test(trimmed)) {
                children.push(new Paragraph({ children: parseInline(trimmed.replace(/^\d+\.\s/, '')), spacing: { after: 100 } }));
            } else if (trimmed.startsWith('> ')) {
                children.push(new Paragraph({ children: parseInline(trimmed.substring(2)), indent: { left: 720 }, spacing: { before: 200, after: 200 } }));
            } else {
                children.push(new Paragraph({ children: parseInline(trimmed), spacing: { after: 150 } }));
            }
        });

        const doc = new Document({ sections: [{ children }] });
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("DOCX Export Error:", e);
        alert("Failed to export DOCX. Check console for details.");
    }
};