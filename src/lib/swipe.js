const SWIPE_MIN = 60;

/** @param {HTMLElement} node @param {{onnext: () => void, onprev: () => void}} handlers */
export function swipe(node, handlers) {
  let h = handlers;
  let start = null;

  const down = (e) => {
    start = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  };
  const up = (e) => {
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    (dx < 0 ? h.onnext : h.onprev)();
  };
  const cancel = () => (start = null);

  node.addEventListener('touchstart', down, { passive: true });
  node.addEventListener('touchend', up);
  node.addEventListener('touchcancel', cancel);
  return {
    update(next) {
      h = next;
    },
    destroy() {
      node.removeEventListener('touchstart', down);
      node.removeEventListener('touchend', up);
      node.removeEventListener('touchcancel', cancel);
    },
  };
}
