export function createCanvasScene() {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    const backingWidth = Math.max(1, Math.round(width * dpr));
    const backingHeight = Math.max(1, Math.round(height * dpr));

    canvas.width = backingWidth;
    canvas.height = backingHeight;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  return {
    canvas,
    ctx,
    width: () => canvas.getBoundingClientRect().width,
    height: () => canvas.getBoundingClientRect().height,
  };
}
