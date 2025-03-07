import MarkdownRuntime from './app/markdown-runtime';
import MarkdownEditor from './app/markdown-editor';

export { MarkdownRuntime, MarkdownEditor };
export default MarkdownEditor;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the editor
  const editor = new MarkdownEditor({
    inputSelector: '#markdown-input',
    previewSelector: '#preview',
    debounceTime: 300 // Debounce for better performance
  });

  // Example of adding a custom pattern (e.g., highlight text)
  editor.addCustomPattern(
    'highlight',
    /==(.+?)==/g,
    '<mark>$1</mark>'
  );
});
