.app-shell {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + var(--space-5));
}
