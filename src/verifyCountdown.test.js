import { verifyCountdown } from './verifyCountdown';

test.each(['(7 - 3) * 6', '6*(7-3)', '(7 \u2212 3) \u00d7 6'])('accepts a valid solution: %s', expression => {
  expect(verifyCountdown(expression)).toEqual({
    valid: true,
    message: 'Verified! Result = 24. All three numbers used exactly once.',
  });
});

test('uses arithmetic precedence and reports the calculated wrong result', () => {
  expect(verifyCountdown('7-3*6')).toEqual({
    valid: false,
    message: 'Result = -11. The target is 24. Try again.',
  });
});

test.each([
  '24', '7+7+3+6', '7+3', 'Math.pow(7,3)+6',
  '(7-3)*6)', '7(3+6)', '((7-3)*6', '', '7**3+6',
])('rejects invalid numbers, syntax, or executable code: %s', expression => {
  expect(verifyCountdown(expression).valid).toBe(false);
  expect(verifyCountdown(expression).message).toEqual(expect.any(String));
});

test.each([null, ' '.repeat(101) + '(7-3)*6'])('rejects non-text or overlong input', input => {
  expect(verifyCountdown(input)).toEqual({
    valid: false,
    message: 'Enter an arithmetic expression of at most 100 characters.',
  });
});
