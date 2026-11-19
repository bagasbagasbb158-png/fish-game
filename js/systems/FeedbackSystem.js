// FeedbackSystem.js
// Browser-side feedback inbox. Reports are retained in localStorage and exported
// as JSONL so a developer can place/append them to the project's feedback folder.
const STORAGE_KEY = 'hungerFish.feedbackInbox.v1';

export class FeedbackSystem {
    constructor() {
        this.modal = document.getElementById('feedbackModal');
        this.form = document.getElementById('feedbackForm');
        this.status = document.getElementById('feedbackStatus');
        this.message = document.getElementById('feedbackMessage');
        this.openButton = document.getElementById('openFeedback');
        this.closeButton = document.getElementById('closeFeedback');
        this.context = document.getElementById('feedbackContext');
        this.lastErrors = [];

        this.openButton?.addEventListener('click', () => this.open());
        this.closeButton?.addEventListener('click', () => this.close());
        this.modal?.addEventListener('click', (event) => {
            if (event.target === this.modal) this.close();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal && !this.modal.hidden) this.close();
        });
        this.form?.addEventListener('submit', (event) => this.handleSubmit(event));

        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'javascript',
                message: event.message || 'Unknown JavaScript error',
                source: event.filename || '',
                line: event.lineno || null,
                column: event.colno || null,
                stack: event.error?.stack || ''
            });
        });
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            this.recordError({
                type: 'unhandledrejection',
                message: reason?.message || String(reason || 'Unhandled promise rejection'),
                stack: reason?.stack || ''
            });
        });
    }

    open() {
        if (!this.modal) return;
        this.modal.hidden = false;
        this.status.textContent = '';
        this.context.textContent = `Game version: ${this.getVersion()}. Error otomatis yang tertangkap: ${this.lastErrors.length}.`;
        this.message?.focus();
    }

    close() {
        if (this.modal) this.modal.hidden = true;
    }

    getVersion() {
        return document.querySelector('meta[name="game-version"]')?.content || 'unknown';
    }

    recordError(error) {
        this.lastErrors.push({ ...error, timestamp: new Date().toISOString() });
        if (this.lastErrors.length > 20) this.lastErrors.shift();
        // Preserve a lightweight diagnostic trail even if the player doesn't submit.
        try {
            const existing = JSON.parse(localStorage.getItem('hungerFish.recentErrors') || '[]');
            existing.push(this.lastErrors[this.lastErrors.length - 1]);
            localStorage.setItem('hungerFish.recentErrors', JSON.stringify(existing.slice(-20)));
        } catch (_) {
            // Storage may be disabled; the current-session buffer still works.
        }
    }

    readInbox() {
        try {
            const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(reports) ? reports : [];
        } catch (_) {
            return [];
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(this.form);
        const message = String(data.get('message') || '').trim();
        if (!message) {
            this.status.textContent = 'Detail laporan wajib diisi.';
            return;
        }

        const report = {
            id: (globalThis.crypto?.randomUUID?.() || `feedback-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
            submittedAt: new Date().toISOString(),
            game: 'Hunger Fish',
            version: this.getVersion(),
            type: String(data.get('type') || 'other'),
            message,
            contact: String(data.get('contact') || '').trim() || null,
            page: location.href,
            userAgent: navigator.userAgent,
            screen: { width: window.innerWidth, height: window.innerHeight, pixelRatio: window.devicePixelRatio || 1 },
            recentErrors: this.lastErrors.slice(-10)
        };

        const inbox = this.readInbox();
        inbox.push(report);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(inbox));
        } catch (_) {
            this.status.textContent = 'Browser tidak mengizinkan penyimpanan lokal. File laporan tetap akan diunduh.';
        }

        this.downloadInbox(inbox);
        this.form.reset();
        this.status.textContent = `Laporan tersimpan (${inbox.length} laporan dalam inbox browser) dan file JSONL diunduh. Masukkan file itu ke folder feedback/ di project VSCode.`;
    }

    downloadInbox(reports) {
        const contents = reports.map((report) => JSON.stringify(report)).join('\n') + (reports.length ? '\n' : '');
        const blob = new Blob([contents], { type: 'application/x-ndjson;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'feedback-inbox.jsonl';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}
