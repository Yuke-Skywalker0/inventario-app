.offline-badge {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-ink);
  color: var(--color-bg);
  font-size: var(--text-xs);
  font-weight: 600;
  text-align: center;
  justify-content: center;
}

.offline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
}
