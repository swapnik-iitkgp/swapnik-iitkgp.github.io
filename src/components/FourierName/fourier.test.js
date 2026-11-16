import { act, render } from '@testing-library/react';
import FourierName from './FourierName';
import { createFourierGeometry, extendLetterTrace, getFourierFrame, getFourierTip, reconstructLetter } from './fourier';
import data from '../../data/fourier-name.json';

test('gives narrow and wide glyphs equal visible gaps without modifying the source offsets', () => {
  const sourceOffsets = data.series.map(series => [...series.offset]);
  const originalEdges = data.series.map(series => {
    const xs = series.contours.flat().map(([x]) => x + series.offset[0]);
    return { left: Math.min(...xs), right: Math.max(...xs) };
  });
  const { letters, bounds, nameWidthRatio } = createFourierGeometry(data);
  const edges = letters.map(letter => {
    const xs = letter.contours.flat().map(([x]) => x + letter.offset[0]);
    return { left: Math.min(...xs), right: Math.max(...xs) };
  });
  const gaps = edges.slice(1).map((edge, index) => edge.left - edges[index].right);
  expect(Math.min(...gaps)).toBeGreaterThan(0);
  expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(1e-8);
  expect(data.series.map(series => series.offset)).toEqual(sourceOffsets);
  const originalWidth = Math.max(...originalEdges.map(edge => edge.right)) - Math.min(...originalEdges.map(edge => edge.left)) + 8;
  expect(bounds.width / nameWidthRatio).toBeCloseTo(originalWidth, 8);
});

test('contains every rotating circle independently of the letter layout', () => {
  const { letters, bounds, drawingBounds } = createFourierGeometry(data);
  const clipped = [];
  for (const phase of [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]) {
    for (const letter of letters) {
      let x = letter.center[0] + letter.offset[0];
      let y = letter.center[1] + letter.offset[1];
      for (const [frequency, re, im] of letter.coefficients) {
        const radius = Math.hypot(re, im);
        if (
          (x - radius < drawingBounds.left || x + radius > drawingBounds.left + drawingBounds.width ||
           y - radius < drawingBounds.top || y + radius > drawingBounds.top + drawingBounds.height) &&
          clipped.length < 5
        ) {
          clipped.push({ letter: letter.letter, phase, frequency });
        }
        const angle = 2 * Math.PI * frequency * phase;
        x += re * Math.cos(angle) - im * Math.sin(angle);
        y += re * Math.sin(angle) + im * Math.cos(angle);
      }
    }
  }
  expect(clipped).toEqual([]);
  expect(drawingBounds.left).toBeLessThan(bounds.left);
  expect(drawingBounds.width).toBeGreaterThan(bounds.width);
  expect(drawingBounds.top).toBeLessThan(bounds.top);
  expect(drawingBounds.height).toBeGreaterThan(bounds.height);
});

test('fits all visible letters without reserving the circle envelope as vertical whitespace', () => {
  const { bounds } = createFourierGeometry(data);
  const heights = data.series.flatMap(series => series.contours.flatMap(contour => contour.map(([, y]) => y + series.offset[1])));
  const top = Math.min(...heights);
  const bottom = Math.max(...heights);

  expect(bounds.top).toBeLessThanOrEqual(top);
  expect(bounds.top + bounds.height).toBeGreaterThanOrEqual(bottom);
  expect(bounds.height).toBeLessThan((bottom - top) * 1.05);
});

test('starts with no trace or fill and only draws the elapsed portion', () => {
  expect(getFourierFrame(0, 8, 0.6, 4096)).toMatchObject({ target: 0, fill: 0 });
  expect(getFourierFrame(4, 8, 0.6, 4096)).toMatchObject({ target: 2048, fill: 0 });
  expect(getFourierFrame(8, 8, 0.6, 4096)).toMatchObject({ target: 4096, fill: 0 });
});

test('fills the letters only after their Fourier paths have finished', () => {
  expect(getFourierFrame(8.3, 8, 0.6, 4096).fill).toBeCloseTo(0.5);
  expect(getFourierFrame(8.6, 8, 0.6, 4096).fill).toBeCloseTo(1);
  expect(getFourierFrame(9.5, 8, 0.6, 4096).fill).toBe(1);
});

test('draws and fills in 4.3 seconds and restarts after 5.05 seconds of active playback', () => {
  const pathDescriptor = Object.getOwnPropertyDescriptor(window, 'Path2D');
  const word = {};
  const fills = [];
  const noop = () => {};
  const context = {
    save: noop, restore: noop, setTransform: noop, clearRect: noop,
    beginPath: noop, arc: noop, stroke: noop, moveTo: noop, lineTo: noop, drawImage: noop,
    fill(path) {
      if (path === word) fills.push(this.globalAlpha);
    },
  };
  let now = 0;
  let nextFrame = null;
  let view;
  const advance = timestamp => {
    now = timestamp;
    expect(nextFrame).toEqual(expect.any(Function));
    const callback = nextFrame;
    nextFrame = null;
    act(() => callback(timestamp));
  };

  try {
    Object.defineProperty(window, 'Path2D', { configurable: true, value: jest.fn(() => word) });
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    jest.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 560, height: 140 });
    jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      nextFrame = callback;
      return 1;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { nextFrame = null; });

    view = render(<FourierName headingId="name" paused={false} />);
    advance(4000);
    expect(fills).toEqual([]);
    advance(4150);
    expect(fills).toHaveLength(1);
    expect(fills[0]).toBeCloseTo(0.5);
    advance(4300);
    expect(fills[fills.length - 1]).toBeCloseTo(1);

    view.rerender(<FourierName headingId="name" paused />);
    expect(nextFrame).toBeNull();
    now = 8000;
    view.rerender(<FourierName headingId="name" paused={false} />);
    advance(8700);
    expect(fills[fills.length - 1]).toBeCloseTo(1);
    fills.length = 0;
    advance(8750);
    expect(fills).toEqual([]);
    expect(nextFrame).toEqual(expect.any(Function));
  } finally {
    view?.unmount();
    jest.restoreAllMocks();
    if (pathDescriptor) Object.defineProperty(window, 'Path2D', pathDescriptor);
    else delete window.Path2D;
  }
});

test('extends only the new strokes and lifts the pen between contours', () => {
  const context = { beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), stroke: jest.fn() };
  const letter = {
    x: [0, 1, 2, 3, 4, 5, 0],
    y: [10, 11, 12, 13, 14, 15, 10],
    strokeIds: [0, 0, -1, 1, 1, -1],
  };
  extendLetterTrace(context, letter, 0, 1);
  extendLetterTrace(context, letter, 1, 6);
  expect(context.moveTo.mock.calls).toEqual([[0, 10], [3, 13]]);
  expect(context.lineTo.mock.calls).toEqual([[1, 11], [4, 14]]);
});

test.each([1, -1])('reconstructs frequency %s with the original scale, center, and letter offset', frequency => {
  const series = { center: [2, -1], offset: [10, 20], coefficients: [[frequency, 3, 4]] };
  const result = reconstructLetter(series, 8, 1);
  for (const sample of [0, 1, 3, 7]) {
    const angle = 2 * Math.PI * frequency * sample / 8;
    expect(result.x[sample]).toBeCloseTo(12 + 3 * Math.cos(angle) - 4 * Math.sin(angle), 10);
    expect(result.y[sample]).toBeCloseTo(19 + 3 * Math.sin(angle) + 4 * Math.cos(angle), 10);
  }
  expect(result.x[8]).toBe(result.x[0]);
  expect(result.y[8]).toBe(result.y[0]);
});

test('uses only the requested vectors without changing another letter', () => {
  const first = { center: [0, 0], offset: [100, 0], coefficients: [[1, 10, 0], [2, 100, 0]] };
  const second = { center: [0, 0], offset: [-100, 0], coefficients: [[-1, 5, 0]] };
  const a = reconstructLetter(first, 8, 1);
  const b = reconstructLetter(second, 8, 1);
  expect(a.x[0]).toBeCloseTo(110);
  expect(b.x[0]).toBeCloseTo(-95);
  expect(reconstructLetter(first, 8, 2).x[0]).toBeCloseTo(210);
});

test('interpolates the moving highlight along the reconstructed Fourier path', () => {
  const letter = {
    x: [0, 10, 20, 30, 0],
    y: [0, 20, 0, -20, 0],
    strokeIds: [0, 0, -1, 1],
  };
  expect(getFourierTip(letter, 0.125)).toEqual({ x: 5, y: 10 });
});

test('does not highlight pen-up moves or bridge separate contours', () => {
  const letter = { x: [0, 1, 2, 3, 0], y: [0, 1, 2, 3, 0], strokeIds: [0, 0, -1, 1] };
  for (const progress of [0.375, 0.625, 0.875]) {
    expect(getFourierTip(letter, progress)).toBeNull();
  }
});
