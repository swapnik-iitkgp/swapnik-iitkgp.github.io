class ExpressionError extends Error {}

// Parse arithmetic directly; never evaluate JavaScript or user code.
export function verifyCountdown(input) {
  if (typeof input !== 'string' || input.length > 100) {
    return { valid: false, message: 'Enter an arithmetic expression of at most 100 characters.' };
  }

  try {
    const source = input.replace(/\u00d7/g, '*').replace(/\u00f7/g, '/').replace(/\u2212/g, '-').replace(/\s/g, '');
    if (!source || /[^0-9+*/()-]/.test(source)) {
      throw new ExpressionError('Use only the given numbers, arithmetic operators, and parentheses.');
    }
    const tokens = source.match(/\d+|[+*/()-]/g);
    const used = tokens.filter(token => /^\d+$/.test(token)).map(Number).sort((a, b) => a - b);
    if (used.join(',') !== '3,6,7') {
      throw new ExpressionError('Use 7, 3, and 6 exactly once each.');
    }

    let position = 0;
    const factor = () => {
      const token = tokens[position++];
      if (token === '(') {
        const value = sum();
        if (tokens[position++] !== ')') throw new ExpressionError('Check your parentheses.');
        return value;
      }
      if (!token || !/^\d+$/.test(token)) {
        throw new ExpressionError('Check the expression: a number or parenthesis is missing.');
      }
      return Number(token);
    };
    const product = () => {
      let value = factor();
      while (tokens[position] === '*' || tokens[position] === '/') {
        const operator = tokens[position++];
        const other = factor();
        if (operator === '/' && other === 0) throw new ExpressionError('Division by zero is not allowed.');
        value = operator === '*' ? value * other : value / other;
      }
      return value;
    };
    const sum = () => {
      let value = product();
      while (tokens[position] === '+' || tokens[position] === '-') {
        const operator = tokens[position++];
        const other = product();
        value = operator === '+' ? value + other : value - other;
      }
      return value;
    };
    const value = sum();
    if (position !== tokens.length || !Number.isFinite(value)) {
      throw new ExpressionError('Check the expression for missing operators.');
    }
    return Math.abs(value - 24) < 1e-8
      ? { valid: true, message: 'Verified! Result = 24. All three numbers used exactly once.' }
      : { valid: false, message: `Result = ${Number(value.toFixed(6))}. The target is 24. Try again.` };
  } catch (error) {
    if (!(error instanceof ExpressionError)) throw error;
    return { valid: false, message: error.message };
  }
}
