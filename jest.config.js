const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@components/(.*)$': '<rootDir>/client/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/client/src/lib/$1',
    '^@hooks/(.*)$': '<rootDir>/client/src/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/client/src/contexts/$1',
    '^@utils/(.*)$': '<rootDir>/client/src/utils/$1',
    '^@api/(.*)$': '<rootDir>/client/src/api/$1',
    '^@config/(.*)$': '<rootDir>/client/src/config/$1',
    '^@types/(.*)$': '<rootDir>/client/src/types/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|@radix-ui|@hookform|next|react-day-picker))',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx,ts,tsx}',
    '!client/src/**/*.d.ts',
    '!client/src/**/*.stories.{js,jsx,ts,tsx}',
    '!client/src/types/**/*',
    '!client/src/**/index.{js,ts}',
    '!client/src/pages/_*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
    React: require('react'),
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
}

module.exports = createJestConfig(config)