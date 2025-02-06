export class ErrorBoundary extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['has-error'];
    }

    /**
     * @param {Error} error - The error that occurred
     */
    handleError(error) {
        console.error('Component error:', error);
        this.setAttribute('has-error', 'true');
        this.render();
    }

    render() {
        const hasError = this.hasAttribute('has-error');
        if (hasError) {
            this.shadowRoot.innerHTML = `
                <div class="error-boundary">
                    <h3>Something went wrong</h3>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }
}

customElements.define('error-boundary', ErrorBoundary);
