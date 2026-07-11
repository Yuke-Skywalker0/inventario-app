.location-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.location-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink-muted);
}

.location-field input {
  height: var(--touch-target);
  padding: 0 var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-ink);
  font-size: var(--text-base);
}

.location-field input:focus-visible {
  border-color: var(--color-accent);
}

.type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.type-chip {
  height: 40px;
  padding: 0 var(--space-4);
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-ink-muted);
  font-size: var(--text-sm);
  font-weight: 600;
}

.type-chip.is-selected {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-ink);
}

.location-error {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
}

.location-submit {
  height: var(--touch-target);
  background: var(--color-accent);
  color: var(--color-accent-ink);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-base);
}

.location-submit:disabled {
  opacity: 0.6;
}
