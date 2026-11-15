const mockAsyncStorageStore = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key, value) => {
    mockAsyncStorageStore.set(key, value);
    return Promise.resolve();
  }),
  getItem: jest.fn((key) => {
    return Promise.resolve(mockAsyncStorageStore.get(key) || null);
  }),
  removeItem: jest.fn((key) => {
    mockAsyncStorageStore.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockAsyncStorageStore.clear();
    return Promise.resolve();
  }),
}));

const mockSqliteStore = new Map();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(() => Promise.resolve()),
    runAsync: jest.fn((sql, params) => {
      if (params && params.length >= 7) {
        mockSqliteStore.set(params[0], {
          id: params[0],
          type: params[1],
          title: params[2],
          message: params[3],
          timestamp: params[4],
          severity: params[5],
          resolved: params[6],
        });
      }
      return Promise.resolve();
    }),
    getAllAsync: jest.fn(() => {
      return Promise.resolve(Array.from(mockSqliteStore.values()));
    }),
  })),
}));

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    isScanning: jest.fn(() => false),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(() => Promise.resolve({ discoverAllServicesAndCharacteristics: jest.fn() })),
    destroy: jest.fn(),
  })),
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

jest.mock('@react-native-firebase/app', () => ({
  default: {
    app: jest.fn(() => ({})),
  },
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  reauthenticateWithCredential: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  default: jest.fn(() => ({})),
}));
