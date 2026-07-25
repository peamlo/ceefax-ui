// <cf-loader>LOADING PAGE 102…</cf-loader>
// The one interactive widget: a hard on/off block-cursor blink.
// Framework-agnostic custom element. Blink gated behind prefers-reduced-motion.
class CfLoader extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'status');
    this.setAttribute('aria-live', 'polite');
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host{display:inline-flex;align-items:center;gap:.6ch;font-family:'Space Mono','Courier New',monospace;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.08em}
        .cursor{display:inline-block;width:1ch;height:1.05em;background:currentColor}
        @media (prefers-reduced-motion: no-preference){
          .cursor{animation:cf-blink 1s steps(1,end) infinite}
        }
        @keyframes cf-blink{50%{opacity:0}}
      </style>
      <slot></slot><span class="cursor" aria-hidden="true"></span>`;
  }
}
if (!customElements.get('cf-loader')) customElements.define('cf-loader', CfLoader);
export { CfLoader };
