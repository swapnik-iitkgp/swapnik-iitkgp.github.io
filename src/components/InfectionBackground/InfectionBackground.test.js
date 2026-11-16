import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import InfectionBackground from './InfectionBackground';
import { createDiffusionField } from './diffusion';

test('spreads a concentration cloud while its peak decays', () => {
  const field = createDiffusionField(48, 48);
  const pixels = new Uint8ClampedArray(48 * 48 * 4);
  const colouredPixels = () => pixels.filter((value, index) => index % 4 === 3 && value > 0).length;
  field.inject(24, 24);
  field.paint(pixels);
  const initialArea = colouredPixels();
  const initialAlpha = pixels[(24 * 48 + 24) * 4 + 3];

  const peak = field.step(1);
  field.paint(pixels);
  expect(peak).toBeGreaterThan(0);
  expect(peak).toBeLessThan(1);
  expect(colouredPixels()).toBeGreaterThan(initialArea);
  expect(pixels[(24 * 48 + 24) * 4 + 3]).toBeLessThan(initialAlpha);

  field.step(15);
  field.paint(pixels);
  expect(colouredPixels()).toBe(0);
});

test('handles edge clicks and repeated input without making the background opaque', () => {
  const field = createDiffusionField(32, 24);
  const pixels = new Uint8ClampedArray(32 * 24 * 4);
  for (let index = 0; index < 100; index++) {
    field.inject(0, 0);
    field.inject(31, 23);
  }
  field.paint(pixels);
  expect(pixels[3]).toBeGreaterThan(0);
  expect(pixels[pixels.length - 1]).toBeGreaterThan(0);
  expect(Math.max(...pixels.filter((value, index) => index % 4 === 3))).toBeLessThanOrEqual(85);

  field.clear();
  field.paint(pixels);
  expect(pixels.every(value => value === 0)).toBe(true);
});

describe('background interactions', () => {
  const mediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
  const pointer = { button: 0, detail: 1, clientX: 120, clientY: 140 };
  let context;
  let preference;
  let motionChanged;
  let nextFrame;
  let now;
  let hidden;

  beforeEach(() => {
    now = 0;
    hidden = false;
    nextFrame = null;
    preference = {
      matches: false,
      addEventListener: jest.fn((type, listener) => { motionChanged = listener; }),
      removeEventListener: jest.fn(),
    };
    context = {
      createImageData: (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
      putImageData: jest.fn(),
      clearRect: jest.fn(),
    };
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: jest.fn(() => preference) });
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    jest.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      nextFrame = callback;
      return 1;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { nextFrame = null; });
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    jest.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 600, height: 400 });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    if (mediaDescriptor) Object.defineProperty(window, 'matchMedia', mediaDescriptor);
    else delete window.matchMedia;
    window.getSelection().removeAllRanges();
    window.history.replaceState(null, '', '/');
  });

  test('leaves controls usable and only allocates a bounded canvas after a background click', () => {
    const action = jest.fn();
    HTMLCanvasElement.prototype.getBoundingClientRect.mockReturnValue({ left: 0, top: 0, width: 6000, height: 4000 });
    const { container } = render(<>
      <InfectionBackground />
      <button onClick={action}><span>Nested action</span></button>
      <a href="#section" onClick={action}>Link</a>
      <input aria-label="Textbox" />
      <details><summary>More</summary></details>
      <div role="button" tabIndex={0} onClick={action}>Custom action</div>
      <div contentEditable suppressContentEditableWarning role="textbox" aria-label="Rich text">Edit</div>
    </>);
    for (const control of [
      screen.getByText('Nested action'), screen.getByRole('link'),
      screen.getByRole('textbox', { name: 'Textbox' }), screen.getByText('More'),
      screen.getByRole('button', { name: 'Custom action' }), screen.getByRole('textbox', { name: 'Rich text' }),
    ]) fireEvent.click(control, pointer);
    expect(action).toHaveBeenCalledTimes(3);
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();

    fireEvent.click(container, pointer);
    const image = context.putImageData.mock.calls[0][0];
    expect(image.width * image.height).toBeLessThanOrEqual(30000);
    expect(image.data.some((value, index) => index % 4 === 3 && value > 0)).toBe(true);
    expect(nextFrame).toEqual(expect.any(Function));
    fireEvent.click(container, { ...pointer, detail: 2 });
    expect(context.putImageData).toHaveBeenCalledTimes(2);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  test('stops after inactivity and clears on reduced motion, visibility, resize, and unmount', () => {
    const { container, unmount } = render(<InfectionBackground />);
    fireEvent.click(container, pointer);
    now = 4600;
    const callback = nextFrame;
    nextFrame = null;
    act(() => callback(now));
    expect(nextFrame).toBeNull();
    expect(context.clearRect).toHaveBeenCalled();

    fireEvent.click(container, pointer);
    preference.matches = true;
    act(() => motionChanged({ matches: true }));
    expect(nextFrame).toBeNull();
    const paints = context.putImageData.mock.calls.length;
    fireEvent.click(container, pointer);
    expect(context.putImageData).toHaveBeenCalledTimes(paints);

    preference.matches = false;
    act(() => motionChanged({ matches: false }));
    fireEvent.click(container, pointer);
    hidden = true;
    fireEvent(document, new Event('visibilitychange'));
    expect(nextFrame).toBeNull();

    hidden = false;
    fireEvent.click(container, pointer);
    fireEvent(window, new Event('resize'));
    expect(nextFrame).toBeNull();
    fireEvent.click(container, pointer);
    unmount();
    expect(nextFrame).toBeNull();
    const afterUnmount = context.putImageData.mock.calls.length;
    fireEvent.click(document.body, pointer);
    expect(context.putImageData).toHaveBeenCalledTimes(afterUnmount);
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', motionChanged);
  });

  test('ignores reduced motion, text selection, modified clicks, and keyboard activation', () => {
    preference.matches = true;
    const { container } = render(<InfectionBackground />);
    fireEvent.click(container, pointer);
    preference.matches = false;
    const selection = jest.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false });
    fireEvent.click(container, pointer);
    selection.mockReturnValue({ isCollapsed: true });
    for (const modifiers of [{ button: 2 }, { detail: 0 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }]) {
      fireEvent.click(container, { ...pointer, ...modifiers });
    }
    const prevented = new MouseEvent('click', { bubbles: true, cancelable: true, ...pointer });
    prevented.preventDefault();
    fireEvent(container, prevented);
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  test('reports unavailable canvas support instead of silently ignoring clicks', () => {
    HTMLCanvasElement.prototype.getContext.mockReturnValue(null);
    const { container } = render(<InfectionBackground />);
    fireEvent.click(container, pointer);
    expect(screen.getByRole('status')).toHaveTextContent('Background animation unavailable in this browser.');
    fireEvent.click(container, pointer);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });
});
