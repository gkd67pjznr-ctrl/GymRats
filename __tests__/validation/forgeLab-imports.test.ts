/**
 * Validation test to check that Forge Lab modules can be imported
 */

// Test that we can import the main modules without syntax errors
describe('Forge Lab Module Imports', () => {
  it('should import types module', () => {
    expect(() => {
      require('../../src/lib/forgeLab/types');
    }).not.toThrow();
  });

  it('should import calculator module', () => {
    expect(() => {
      require('../../src/lib/forgeLab/calculator');
    }).not.toThrow();
  });

  it('should import store module', () => {
    expect(() => {
      require('../../src/lib/forgeLab/store');
    }).not.toThrow();
  });

  it('should import hooks module', () => {
    expect(() => {
      require('../../src/lib/forgeLab/useForgeLab');
    }).not.toThrow();
  });

  it('should import chart utilities', () => {
    expect(() => {
      require('../../src/lib/forgeLab/chartUtils');
    }).not.toThrow();
  });
});