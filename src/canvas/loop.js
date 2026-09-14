const RAINBOW_DURATION_MS = 10000;
const SPIN_DURATION_MS = 900;
const FACE_SCALE = 0.065;
const AUDIO_SOURCE = './assets/yippeeeeeeeeeeeeee.mp3';
const IDLE_RESET_MS = 10000;
const STABLE_SHAKE_FREQUENCY = 3;
const MAX_SHAKE_FREQUENCY = 22;
const FAST_CLICK_WINDOW_MS = 1200;

function getRainbowHue(timeMs) {
  const progress = (timeMs % RAINBOW_DURATION_MS) / RAINBOW_DURATION_MS;
  const stops = [
    { t: 0.00, hue: 0 },
    { t: 0.12, hue: 25 },
    { t: 0.28, hue: 45 },
    { t: 0.47, hue: 60 },
    { t: 0.62, hue: 120 },
    { t: 0.82, hue: 220 },
    { t: 1.00, hue: 300 },
  ];

  for (let i = 0; i < stops.length - 1; i += 1) {
    const current = stops[i];
    const next = stops[i + 1];

    if (progress >= current.t && progress <= next.t) {
      const localT = (progress - current.t) / (next.t - current.t || 1);
      const startHue = current.hue;
      const endHue = next.hue;
      const diff = ((endHue - startHue + 360) % 360);
      return (startHue + diff * localT) % 360;
    }
  }

  return 300;
}

function drawBackground(ctx, width, height) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
}

function drawSmileyFace(ctx, centerX, centerY, size, color, pulse, rotation, shake) {
  ctx.save();
  ctx.translate(centerX + shake.x, centerY + shake.y);
  ctx.rotate(rotation);

  const glowRadius = size * 1.8;
  const glow = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, glowRadius);
  const glowAlpha = 0.25 + pulse * 0.55;

  glow.addColorStop(0, `hsla(${color.hue}, 100%, 62%, ${glowAlpha})`);
  glow.addColorStop(0.35, `hsla(${color.hue}, 100%, 62%, ${glowAlpha * 0.8})`);
  glow.addColorStop(0.7, `hsla(${color.hue}, 100%, 60%, ${glowAlpha * 0.45})`);
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  const faceGradient = ctx.createRadialGradient(-size * 0.18, -size * 0.35, size * 0.12, 0, 0, size * 1.35);
  faceGradient.addColorStop(0, `hsla(${color.hue}, 100%, 72%, 1)`);
  faceGradient.addColorStop(0.45, `hsla(${color.hue}, 100%, 62%, 1)`);
  faceGradient.addColorStop(1, `hsla(${color.hue}, 100%, 52%, 1)`);

  ctx.fillStyle = faceGradient;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const eyeWidth = size * 0.22;
  const eyeHeight = size * 0.42;
  const eyeY = -size * 0.18;

  ctx.fillStyle = '#101010';
  ctx.beginPath();
  ctx.ellipse(-size * 0.33, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(size * 0.33, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  const smileRadius = size * 0.56;
  const smileCenterY = size * 0.08;
  const leftAngle = 0.22 * Math.PI;
  const rightAngle = 0.78 * Math.PI;
  const leftX = -smileRadius * Math.cos(leftAngle);
  const leftY = smileCenterY + smileRadius * Math.sin(leftAngle);
  const rightX = -smileRadius * Math.cos(rightAngle);
  const rightY = smileCenterY + smileRadius * Math.sin(rightAngle);

  ctx.beginPath();
  ctx.arc(0, smileCenterY, smileRadius, leftAngle, rightAngle);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(leftX, leftY);
  ctx.lineTo(leftX - size * 0.09, leftY - size * 0.12);
  ctx.moveTo(rightX, rightY);
  ctx.lineTo(rightX + size * 0.09, rightY - size * 0.12);
  ctx.stroke();

  ctx.restore();
}

export function animate(scene) {
  const { canvas, ctx, width, height } = scene;
  const state = {
    x: width() / 2,
    y: height() / 2,
    renderedX: width() / 2,
    renderedY: height() / 2,
    tilt: 0,
    hasBeenClicked: false,
    lastClickAt: 0,
    shakeFrequency: STABLE_SHAKE_FREQUENCY,
    targetShakeFrequency: STABLE_SHAKE_FREQUENCY,
    previousFrameAt: 0,
  };
  const activeSounds = new Set();

  function size() {
    return Math.min(width(), height()) * FACE_SCALE;
  }

  function randomCoordinate(length, padding) {
    if (length <= padding * 2) {
      return length / 2;
    }

    return padding + Math.random() * (length - padding * 2);
  }

  function playClickSound() {
    const sound = new Audio(AUDIO_SOURCE);
    activeSounds.add(sound);
    sound.addEventListener('ended', () => activeSounds.delete(sound), { once: true });
    sound.play().catch(() => activeSounds.delete(sound));
  }

  function handleClick(event) {
    const bounds = canvas.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;
    const faceSize = size();

    if (Math.hypot(clickX - state.renderedX, clickY - state.renderedY) > faceSize) {
      return;
    }

    const now = performance.now();
    const clickInterval = state.lastClickAt ? now - state.lastClickAt : IDLE_RESET_MS;
    const clickSpeed = Math.max(0, Math.min(1, 1 - clickInterval / FAST_CLICK_WINDOW_MS));

    state.hasBeenClicked = true;
    state.lastClickAt = now;
    state.targetShakeFrequency = STABLE_SHAKE_FREQUENCY
      + (MAX_SHAKE_FREQUENCY - STABLE_SHAKE_FREQUENCY) * clickSpeed;
    state.x = randomCoordinate(width(), faceSize * 1.8);
    state.y = randomCoordinate(height(), faceSize * 1.8);
    state.tilt = Math.random() * Math.PI * 2;

    playClickSound();
  }

  canvas.addEventListener('click', handleClick);

  function frame(now) {
    const w = width();
    const h = height();
    const faceSize = Math.min(w, h) * FACE_SCALE;
    const elapsedSinceClick = now - state.lastClickAt;
    const delta = state.previousFrameAt ? now - state.previousFrameAt : 0;
    const pulse = 0.75 + 0.25 * Math.sin((now / 700) * Math.PI);
    const color = { hue: getRainbowHue(now) };
    const rotation = state.tilt + (now % SPIN_DURATION_MS) / SPIN_DURATION_MS * Math.PI * 2;
    const settleTarget = elapsedSinceClick >= IDLE_RESET_MS
      ? STABLE_SHAKE_FREQUENCY
      : state.targetShakeFrequency;
    const settleProgress = 1 - Math.exp(-delta / 180);
    const shakeFrequency = state.shakeFrequency += (settleTarget - state.shakeFrequency) * settleProgress;
    const shakeMagnitude = state.hasBeenClicked ? faceSize * 0.12 : 0;
    const shakePhase = now / 1000 * shakeFrequency * Math.PI * 2;
    const shake = {
      x: Math.sin(shakePhase) * shakeMagnitude,
      y: Math.sin(shakePhase * 1.37) * shakeMagnitude * 0.65,
    };

    drawBackground(ctx, w, h);
    drawSmileyFace(ctx, state.x, state.y, faceSize, color, pulse, rotation, shake);

    state.renderedX = state.x + shake.x;
    state.renderedY = state.y + shake.y;
    state.previousFrameAt = now;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
