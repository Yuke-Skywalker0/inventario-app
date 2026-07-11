.fab {
  position: fixed;
  right: var(--space-4);
  bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + var(--space-4));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-accent-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-float);
  z-index: 21;
}

.fab:active {
  transform: scale(0.94);
}
