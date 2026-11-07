jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('@notifee/react-native', () => ({
  default: {
    createChannel: jest.fn(() => Promise.resolve('test-channel')),
    displayNotification: jest.fn(() => Promise.resolve('test-notification-id')),
  },
  AndroidImportance: {
    HIGH: 4,
  },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(() => Promise.resolve()),
    runAsync: jest.fn(() => Promise.resolve()),
    getAllAsync: jest.fn(() => Promise.resolve([])),
  })),
}));
