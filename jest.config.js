/** @type {import('jest').Config} */
const config = {
  projects: [
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
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
    },
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
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
    }
  ],

  // Common configuration
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  // Coverage settings
  collectCoverageFrom: [
    'server/**/*.{js,jsx,ts,tsx}',
    'client/src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],

  // Test timeout
  testTimeout: 30000,

  // Support both module systems
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-to-be-transformed)/)',
  ],

  // Allow ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};

export default config;