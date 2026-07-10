.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(27, 33, 36, 0.45);
  z-index: 40;
  display: flex;
  align-items: flex-end;
}

.sheet-panel {
  width: 100%;
  max-height: 86vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-2) var(--space-5) var(--space-6);
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
}

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  margin: var(--space-2) auto var(--space-3);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.sheet-header h2 {
  font-size: var(--text-lg);
  font-weight: var(--font-display-weight);
  letter-spacing: var(--font-display-spacing);
  text-transform: uppercase;
}

.sheet-close {
  width: var(--touch-target);
  height: var(--touch-target);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink-muted);
  margin-right: calc(var(--space-3) * -1);
}

@media (prefers-reduced-motion: no-preference) {
  .sheet-panel {
    animation: sheet-up 0.2s ease-out;
  }
}

@keyframes sheet-up {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
