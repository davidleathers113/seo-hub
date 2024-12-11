/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/**/*.test.[jt]s?(x)'],
      moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
        '^@/(.*)$': '<rootDir>/client/src/$1'
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
        '^.+\\.jsx?$': ['babel-jest', { configFile: './.babelrc' }]
      },
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '@testing-library/jest-dom'
      ]
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.test.[jt]s?(x)'],
      moduleNameMapper: {
        '^@server/(.*)$': '<rootDir>/server/$1'
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
        '^.+\\.jsx?$': ['babel-jest', { configFile: './.babelrc' }]
      },
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js'
      ]
    }
  ],

  // Common configuration
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],

  // Test timeout
  testTimeout: 30000,

  // Global setup
  globalSetup: '<rootDir>/test/globalSetup.js',
  globalTeardown: '<rootDir>/test/globalTeardown.js',

  // Verbose output
  verbose: true,

  // Support both module systems
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-to-be-transformed)/)',
  ],

  // Allow ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};

export default config;