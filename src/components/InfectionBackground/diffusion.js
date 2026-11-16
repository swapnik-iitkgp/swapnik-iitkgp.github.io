const COLOURS = [
  [7, 65, 80],
  [17, 122, 142],
  [42, 151, 108],
  [183, 174, 67],
  [230, 85, 66],
];

const palette = new Uint8ClampedArray(256 * 4);
for (let index = 1; index < 256; index++) {
  const value = index / 255;
  const segment = Math.min(3, Math.floor(value * 4));
  const mix = value * 4 - segment;
  for (let channel = 0; channel < 3; channel++) {
    palette[index * 4 + channel] = COLOURS[segment][channel] * (1 - mix) + COLOURS[segment + 1][channel] * mix;
  }
  palette[index * 4 + 3] = 255 * 0.32 * Math.sqrt(value);
}

export function createDiffusionField(width, height) {
  let current = new Float32Array(width * height);
  let next = new Float32Array(width * height);
  const windX = new Float32Array(height);
  const windY = new Float32Array(width);
  let time = 0;

  return {
    inject(x, y) {
      const centerX = Math.max(0, Math.min(width - 1, x));
      const centerY = Math.max(0, Math.min(height - 1, y));
      for (let row = Math.max(0, Math.floor(centerY - 10)); row <= Math.min(height - 1, Math.ceil(centerY + 10)); row++) {
        for (let column = Math.max(0, Math.floor(centerX - 10)); column <= Math.min(width - 1, Math.ceil(centerX + 10)); column++) {
          const distance = (column - centerX) ** 2 + (row - centerY) ** 2;
          const index = row * width + column;
          current[index] = Math.min(1, current[index] + Math.exp(-distance / 20));
        }
      }
    },

    step(seconds) {
      // Upwind transport and short substeps keep diffusion and decay non-negative.
      const steps = Math.max(1, Math.ceil(seconds * 60));
      const delta = seconds / steps;
      let peak = 0;
      for (let step = 0; step < steps; step++) {
        time += delta;
        for (let row = 0; row < height; row++) windX[row] = 0.9 + 0.55 * Math.sin(row / height * Math.PI * 2 + time * 0.3);
        for (let column = 0; column < width; column++) windY[column] = 0.45 * Math.cos(column / width * Math.PI * 2 - time * 0.25);
        peak = 0;
        for (let row = 0; row < height; row++) {
          for (let column = 0; column < width; column++) {
            const index = row * width + column;
            const value = current[index];
            const west = current[column > 0 ? index - 1 : index];
            const east = current[column < width - 1 ? index + 1 : index];
            const north = current[row > 0 ? index - width : index];
            const south = current[row < height - 1 ? index + width : index];
            const upwind = windY[column] >= 0 ? north : south;
            next[index] = value + delta * (
              8 * (west + east + north + south - 4 * value) -
              windX[row] * (value - west) -
              Math.abs(windY[column]) * (value - upwind) -
              0.6 * value
            );
            peak = Math.max(peak, next[index]);
          }
        }
        [current, next] = [next, current];
      }
      return peak;
    },

    paint(pixels, fade = 1) {
      for (let index = 0; index < current.length; index++) {
        const colour = Math.min(255, Math.round(current[index] * 3 * 255)) * 4;
        const offset = index * 4;
        pixels[offset] = palette[colour];
        pixels[offset + 1] = palette[colour + 1];
        pixels[offset + 2] = palette[colour + 2];
        pixels[offset + 3] = palette[colour + 3] * fade;
      }
    },

    clear() {
      current.fill(0);
      next.fill(0);
      time = 0;
    },
  };
}
