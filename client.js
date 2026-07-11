.transfer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.transfer-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink-muted);
}

.transfer-field input,
.transfer-field select {
  height: var(--touch-target);
  padding: 0 var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-ink);
  font-size: var(--text-base);
}

.transfer-quantity-row {
  display: flex;
  gap: var(--space-2);
}

.transfer-quantity-row input {
  flex: 1;
  min-width: 0;
}

.transfer-all-button {
  flex-shrink: 0;
  height: var(--touch-target);
  padding: 0 var(--space-3);
  border: 1.5px solid var(--color-info);
  color: var(--color-info);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
}

.transfer-error {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
}

.transfer-submit {
  height: var(--touch-target);
  background: var(--color-accent);
  color: var(--color-accent-ink);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-base);
}

.transfer-submit:disabled {
  opacity: 0.6;
}

.transfer-empty {
  color: var(--color-ink-muted);
  font-size: var(--text-sm);
  text-align: center;
  padding: var(--space-5) 0;
}
