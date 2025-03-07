// Import our MarkdownRuntime class
import MarkdownRuntime from './markdown-runtime';

// Define interfaces for editor configuration
interface EditorConfig {
  inputSelector: string;
  previewSelector: string;
  initialMarkdown?: string;
  debounceTime?: number;
}

class MarkdownEditor {
  private md: MarkdownRuntime;
  private input: HTMLTextAreaElement;
  private preview: HTMLElement;
  private debounceTime: number;
  private debounceTimer: number | null = null;

  constructor(config: EditorConfig) {
    this.md = new MarkdownRuntime();

    // Get DOM elements
    const inputElement = document.querySelector(config.inputSelector);
    const previewElement = document.querySelector(config.previewSelector);

    if (!inputElement || !(inputElement instanceof HTMLTextAreaElement)) {
      throw new Error(`Input element not found or not a textarea: ${config.inputSelector}`);
    }

    if (!previewElement || !(previewElement instanceof HTMLElement)) {
      throw new Error(`Preview element not found: ${config.previewSelector}`);
    }

    this.input = inputElement;
    this.preview = previewElement;
    this.debounceTime = config.debounceTime || 0;

    // Set initial markdown if provided
    if (config.initialMarkdown) {
      this.input.value = config.initialMarkdown;
    }

    // Initial render
    this.renderMarkdown();

    // Set up event listeners
    this.setupEventListeners();
  }

  private renderMarkdown(): void {
    this.md.renderToElement(this.input.value, this.preview);
  }

  private setupEventListeners(): void {
    this.input.addEventListener('input', () => {
      if (this.debounceTime > 0) {
        this.debounceRender();
      } else {
        this.renderMarkdown();
      }
    });
  }

  private debounceRender(): void {
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.renderMarkdown();
      this.debounceTimer = null;
    }, this.debounceTime);
  }

  // Public methods to extend functionality
  public addCustomPattern(name: string, pattern: RegExp, replacement: string | ((match: string, ...args: string[]) => string)): void {
    this.md.addPattern(name, { regex: pattern, replacement });
  }

  public getMarkdown(): string {
    return this.input.value;
  }

  public getHtml(): string {
    return this.preview.innerHTML;
  }

  public setMarkdown(markdown: string): void {
    this.input.value = markdown;
    this.renderMarkdown();
  }
}

export default MarkdownEditor;
