// Define types for our patterns and processors
interface MarkdownPattern {
  regex: RegExp;
  replacement: string | ReplacementFunction;
  preprocessing?: PreprocessingFunction;
}

interface PatternDictionary {
  [key: string]: MarkdownPattern;
}

type ReplacementFunction = (match: string, ...args: string[]) => string;
type PreprocessingFunction = (markdown: string) => string;

class MarkdownRuntime {
  private patterns: PatternDictionary;

  constructor() {
    // Regular expressions for common Markdown patterns
    this.patterns = {
      // Headers
      h1: { regex: /^# (.+)$/gm, replacement: '<h1>$1</h1>' },
      h2: { regex: /^## (.+)$/gm, replacement: '<h2>$1</h2>' },
      h3: { regex: /^### (.+)$/gm, replacement: '<h3>$1</h3>' },
      h4: { regex: /^#### (.+)$/gm, replacement: '<h4>$1</h4>' },
      h5: { regex: /^##### (.+)$/gm, replacement: '<h5>$1</h5>' },
      h6: { regex: /^###### (.+)$/gm, replacement: '<h6>$1</h6>' },

      // Emphasis
      bold: { regex: /\*\*(.+?)\*\*/g, replacement: '<strong>$1</strong>' },
      italic: { regex: /\*(.+?)\*/g, replacement: '<em>$1</em>' },

      // Lists
      unorderedList: {
        regex: /^\s*[-*+]\s+(.+)$/gm,
        preprocessing: this._preprocessLists.bind(this),
        replacement: '<li>$1</li>'
      },
      orderedList: {
        regex: /^\s*\d+\.\s+(.+)$/gm,
        preprocessing: this._preprocessLists.bind(this),
        replacement: '<li>$1</li>'
      },

      // Links and images
      link: { regex: /\[(.+?)\]\((.+?)\)/g, replacement: '<a href="$2">$1</a>' },
      image: { regex: /!\[(.+?)\]\((.+?)\)/g, replacement: '<img src="$2" alt="$1">' },

      // Code blocks
      codeBlock: {
        regex: /```([a-z]*)\n([\s\S]*?)\n```/g,
        replacement: (match: string, lang: string, code: string): string => {
          const language = lang ? ` class="language-${lang}"` : '';
          return `<pre><code${language}>${this._escapeHTML(code)}</code></pre>`;
        }
      },
      inlineCode: { regex: /`(.+?)`/g, replacement: '<code>$1</code>' },

      // Blockquotes
      blockquote: {
        regex: /^>\s+(.+)$/gm,
        preprocessing: this._preprocessBlockquotes.bind(this),
        replacement: '<blockquote>$1</blockquote>'
      },

      // Horizontal rule
      hr: { regex: /^---$/gm, replacement: '<hr>' },

      // Paragraphs (should be processed last)
      paragraph: {
        regex: /^(?!<[a-z][^>]*>)(.+)$/gm,
        replacement: '<p>$1</p>'
      }
    };
  }

  // Helper method to escape HTML in code blocks
  private _escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Helper method to preprocess lists
  private _preprocessLists(markdown: string): string {
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;
    const lines = markdown.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line is an unordered list item
      if (/^\s*[-*+]\s+/.test(line)) {
        if (!inList || listType !== 'ul') {
          lines[i] = '<ul>' + line;
          inList = true;
          listType = 'ul';
        }
      }
      // Check if line is an ordered list item
      else if (/^\s*\d+\.\s+/.test(line)) {
        if (!inList || listType !== 'ol') {
          lines[i] = '<ol>' + line;
          inList = true;
          listType = 'ol';
        }
      }
      // If not a list item but we were in a list, close it
      else if (inList) {
        lines[i-1] += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
    }

    // Close list if it's the last element
    if (inList) {
      lines[lines.length-1] += listType === 'ul' ? '</ul>' : '</ol>';
    }

    return lines.join('\n');
  }

  // Helper method to preprocess blockquotes
  private _preprocessBlockquotes(markdown: string): string {
    let inBlockquote = false;
    const lines = markdown.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line is a blockquote
      if (/^>\s+/.test(line)) {
        if (!inBlockquote) {
          lines[i] = line.replace(/^>\s+(.+)$/, '<blockquote>$1');
          inBlockquote = true;
        } else {
          lines[i] = line.replace(/^>\s+(.+)$/, '$1');
        }
      }
      // If not a blockquote but we were in one, close it
      else if (inBlockquote) {
        lines[i-1] += '</blockquote>';
        inBlockquote = false;
      }
    }

    // Close blockquote if it's the last element
    if (inBlockquote) {
      lines[lines.length-1] += '</blockquote>';
    }

    return lines.join('\n');
  }

  // Main conversion method
  public render(markdown: string): string {
    let html = markdown;

    // Preprocess special blocks
    for (const pattern of Object.values(this.patterns)) {
      if (pattern.preprocessing) {
        html = pattern.preprocessing(html);
      }
    }

    // Apply regex replacements
    for (const pattern of Object.values(this.patterns)) {
      if (typeof pattern.replacement === 'string') {
        html = html.replace(pattern.regex, pattern.replacement);
      } else if (typeof pattern.replacement === 'function') {
        html = html.replace(pattern.regex, pattern.replacement as any);
      }
    }

    return html;
  }

  // Real-time rendering method with DOM update
  public renderToElement(markdownText: string, targetElement: HTMLElement): string {
    const html = this.render(markdownText);
    targetElement.innerHTML = html;
    return html;
  }

  // Add a custom pattern
  public addPattern(name: string, pattern: MarkdownPattern): void {
    this.patterns[name] = pattern;
  }
}

export default MarkdownRuntime;
