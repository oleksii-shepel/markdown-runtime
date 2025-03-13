import init, { parse_markdown } from '../public/assets/markdown_wasm';

async function run() {
    await init();
    const input = (document.getElementById('markdown-input') as HTMLTextAreaElement)!.value;
    const output = parse_markdown(input);
    document.getElementById('html-output')!.innerHTML = output;

    document.getElementById('markdown-input')!.addEventListener("input", () => {
        const input = (document.getElementById('markdown-input') as HTMLTextAreaElement)!.value;
        const output = parse_markdown(input);
        document.getElementById('html-output')!.innerHTML = output;
    });
}

run();
