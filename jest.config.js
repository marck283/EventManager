import dotenv from 'dotenv';

dotenv.config();

export default {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleFileExtensions: [
    "js",
    "json",
    "mjs",
    //   "jsx",
    //   "ts",
    //   "tsx",
    //   "node"
  ],
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"],
  slowTestThreshold: 10,
  testEnvironment: "jest-environment-node",
  testMatch: [
    '**/spec/**/*.js?(x)', '**/?(*.)(spec|test).js?(x)',
    '**/spec/**/*.mjs', '**/?(*.)(spec|test).mjs'
  ],
  fakeTimers: {
    timerLimit: 10000
  },
  transform: {
    "^.+\\.m?jsx?$": "babel-jest"
  },
  verbose: true
};