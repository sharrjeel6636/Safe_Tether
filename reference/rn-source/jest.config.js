/** Unit tests for the plain-TypeScript logic (no React Native needed). */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', moduleResolution: 'node10', target: 'es2022', strict: true, ignoreDeprecations: '6.0', esModuleInterop: true, types: ['jest'] }, diagnostics: false }],
  },
};
