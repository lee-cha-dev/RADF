import { useEffect, useRef } from 'react';

const CollapsiblePanel = ({
  side = 'left',
  title,
  onClose,
  children,
  width,
  minWidth = 240,
  maxWidth = 520,
  onResize,
}) => {
  const panelRef = useRef(null);
  const cleanupRef = useRef(null);
  const maxWidthLimit =
    typeof window === 'undefined'
      ? maxWidth
      : Math.min(maxWidth, Math.floor(window.innerWidth * 0.96));
  const safeWidth = width ? Math.min(width, maxWidthLimit) : undefined;

  useEffect(() => () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
  }, []);

  const handleResizeStart = (event) => {
    if (!onResize || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const panelWidth =
      width ?? panelRef.current?.getBoundingClientRect().width ?? 320;
    const handleMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth =
        side === 'right' ? panelWidth - delta : panelWidth + delta;
      const effectiveMaxWidth =
        typeof window === 'undefined'
          ? maxWidth
          : Math.min(maxWidth, Math.floor(window.innerWidth * 0.98));
      const clamped = Math.min(
        effectiveMaxWidth,
        Math.max(minWidth, Math.round(nextWidth))
      );
      onResize(clamped);
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      document.body.classList.remove('lazy-editor-resizing');
      cleanupRef.current = null;
    };
    document.body.classList.add('lazy-editor-resizing');
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    cleanupRef.current = handleUp;
  };

  return (
    <div
      className={`lazy-editor-panel lazy-editor-panel--${side}`}
      style={safeWidth ? { width: safeWidth } : undefined}
      ref={panelRef}
    >
      <div className="lazy-editor-panel__header">
        <h2 className="lazy-editor-panel__title">{title}</h2>
        <button
          className="lazy-editor-panel__minimize"
          type="button"
          onClick={onClose}
          aria-label="Minimize panel"
        >
          -
        </button>
      </div>
      <div className="lazy-editor-panel__content">{children}</div>
      <div
        className="lazy-editor-panel__resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default CollapsiblePanel;
