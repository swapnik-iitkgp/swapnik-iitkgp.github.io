const TAU = Math.PI * 2;

export function reconstructLetter(series, sampleCount, vectorCount) {
  const real = new Float64Array(sampleCount);
  const imaginary = new Float64Array(sampleCount);
  real[0] = series.center[0];
  imaginary[0] = series.center[1];
  for (const [frequency, re, im] of series.coefficients.slice(0, vectorCount)) {
    const index = (frequency + sampleCount) % sampleCount;
    real[index] = re;
    imaginary[index] = im;
  }

  for (let i = 1, j = 0; i < sampleCount; i++) {
    let bit = sampleCount >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imaginary[i], imaginary[j]] = [imaginary[j], imaginary[i]];
    }
  }
  // The supplied coefficients are already normalized; do not divide this inverse FFT again.
  for (let length = 2; length <= sampleCount; length <<= 1) {
    const angle = TAU / length;
    const stepReal = Math.cos(angle);
    const stepImaginary = Math.sin(angle);
    for (let start = 0; start < sampleCount; start += length) {
      let rotationReal = 1;
      let rotationImaginary = 0;
      for (let j = 0; j < length / 2; j++) {
        const a = start + j;
        const b = a + length / 2;
        const re = real[b] * rotationReal - imaginary[b] * rotationImaginary;
        const im = real[b] * rotationImaginary + imaginary[b] * rotationReal;
        real[b] = real[a] - re;
        imaginary[b] = imaginary[a] - im;
        real[a] += re;
        imaginary[a] += im;
        const nextReal = rotationReal * stepReal - rotationImaginary * stepImaginary;
        rotationImaginary = rotationReal * stepImaginary + rotationImaginary * stepReal;
        rotationReal = nextReal;
      }
    }
  }

  const x = new Float64Array(sampleCount + 1);
  const y = new Float64Array(sampleCount + 1);
  for (let i = 0; i < sampleCount; i++) {
    x[i] = real[i] + series.offset[0];
    y[i] = imaginary[i] + series.offset[1];
  }
  x[sampleCount] = x[0];
  y[sampleCount] = y[0];
  return { x, y };
}

export function getFourierTip(letter, progress) {
  const { x, y, strokeIds } = letter;
  const samples = strokeIds.length;
  const position = Math.min(1, Math.max(0, progress)) * samples;
  const index = Math.min(Math.floor(position), samples - 1);
  const stroke = strokeIds[index];
  if (stroke < 0 || stroke !== strokeIds[(index + 1) % samples]) return null;
  const fraction = position - index;
  return {
    x: x[index] + (x[index + 1] - x[index]) * fraction,
    y: y[index] + (y[index + 1] - y[index]) * fraction,
  };
}

export function getFourierFrame(elapsed, drawSeconds, fillSeconds, sampleCount) {
  const progress = Math.min(1, Math.max(0, elapsed / drawSeconds));
  const fillProgress = Math.min(1, Math.max(0, (elapsed - drawSeconds) / fillSeconds));
  return {
    target: Math.floor(progress * sampleCount),
    phase: Math.min(progress, 1 - 1 / sampleCount),
    fill: fillProgress * fillProgress * (3 - 2 * fillProgress),
  };
}

export function extendLetterTrace(context, letter, from, to) {
  let drawing = false;
  const { x, y, strokeIds } = letter;
  const samples = strokeIds.length;
  context.beginPath();
  for (let i = Math.max(1, from + 1); i <= to; i++) {
    const previous = strokeIds[(i - 1) % samples];
    if (previous >= 0 && previous === strokeIds[i % samples]) {
      if (!drawing) context.moveTo(x[i - 1], y[i - 1]);
      context.lineTo(x[i], y[i]);
      drawing = true;
    } else {
      drawing = false;
    }
  }
  context.stroke();
}

export function createFourierGeometry(data) {
  const glyphs = data.series.map(series => {
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const contour of series.contours) {
      for (const [x, y] of contour) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y + series.offset[1]);
        bottom = Math.max(bottom, y + series.offset[1]);
      }
    }
    return { series, left, right, top, bottom };
  });
  const sourceLeft = Math.min(...glyphs.map(glyph => glyph.left + glyph.series.offset[0]));
  const sourceRight = Math.max(...glyphs.map(glyph => glyph.right + glyph.series.offset[0]));
  const capHeight = Math.max(...glyphs.map(glyph => glyph.bottom)) - Math.min(...glyphs.map(glyph => glyph.top));
  const letterGap = capHeight * 0.1;
  let cursor = sourceLeft;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let orbitLeft = Infinity;
  let orbitTop = Infinity;
  let orbitRight = -Infinity;
  let orbitBottom = -Infinity;
  const letters = glyphs.map(glyph => {
    // Position visible glyph edges, not equally spaced centers, so I has no oversized slot.
    const series = { ...glyph.series, offset: [cursor - glyph.left, glyph.series.offset[1]] };
    cursor += glyph.right - glyph.left + letterGap;
    const coefficients = series.coefficients.slice(0, data.terms);
    // Every intermediate circle fits within the sum of the vector magnitudes.
    const reach = coefficients.reduce((sum, [, re, im]) => sum + Math.hypot(re, im), 0);
    const centerX = series.center[0] + series.offset[0];
    const centerY = series.center[1] + series.offset[1];
    orbitLeft = Math.min(orbitLeft, centerX - reach);
    orbitRight = Math.max(orbitRight, centerX + reach);
    orbitTop = Math.min(orbitTop, centerY - reach);
    orbitBottom = Math.max(orbitBottom, centerY + reach);
    const path = series.contours.map(contour => contour.map(([x, y], index) => {
      const px = x + series.offset[0];
      const py = y + series.offset[1];
      left = Math.min(left, px);
      right = Math.max(right, px);
      top = Math.min(top, py);
      bottom = Math.max(bottom, py);
      return `${index === 0 ? 'M' : 'L'}${px} ${py}`;
    }).join(' ') + ' Z').join(' ');
    return { ...series, coefficients, path, ...reconstructLetter(series, data.n, data.terms) };
  });
  const drawingLeft = Math.min(left, orbitLeft) - 12;
  const drawingTop = Math.min(top, orbitTop) - 12;
  const drawingBounds = {
    left: drawingLeft,
    top: drawingTop,
    width: Math.max(right, orbitRight) + 12 - drawingLeft,
    height: Math.max(bottom, orbitBottom) + 12 - drawingTop,
  };
  return {
    letters,
    drawingBounds,
    nameWidthRatio: (right - left + 8) / (sourceRight - sourceLeft + 8),
    // Keep the glyph layout tight while the canvas contains the full circle envelope.
    bounds: {
      left: left - 4,
      top: top - 4,
      width: right - left + 8,
      height: bottom - top + 8,
    },
  };
}
