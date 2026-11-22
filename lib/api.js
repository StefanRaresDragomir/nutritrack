// lib/api.js
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';

// Suppress known non-critical logs
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Search error:',
  'Network request failed',
]);

/**
 * Determine API Base URL dynamically:
 * In Expo development, Constants provides the host computer IP (e.g. 192.168.x.x:8081).
 * We point to port 3001 on that same host so physical phones on Expo Go connect seamlessly!
 */
export const getBaseUrl = () => {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:3001`;
    }
  } catch (e) {
    console.log('[API] HostUri detection error:', e.message);
  }
  return 'http://localhost:3001';
};

export const API_BASE_URL = getBaseUrl();
console.log('[NutriTrack API Base URL]:', API_BASE_URL);

export const config = {
  endpoint: `${API_BASE_URL}/api`,
  databaseId: 'nutritrack-db',
  userCollectionId: 'users',
  foodsCollectionId: 'foods',
  goalsCollectionId: 'goals',
  dailyLogsCollectionId: 'daily_logs',
  storageId: 'uploads',
};

// In-memory token cache backed by AsyncStorage
let cachedToken = null;

export const getAuthToken = async () => {
  if (cachedToken) return cachedToken;
  try {
    const stored = await AsyncStorage.getItem('nutritrack_auth_token');
    if (stored) {
      cachedToken = stored;
      return stored;
    }
  } catch (err) {
    console.error('Failed to read token from storage:', err);
  }
  return null;
};

export const setAuthToken = async (token) => {
  cachedToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem('nutritrack_auth_token', token);
    } else {
      await AsyncStorage.removeItem('nutritrack_auth_token');
    }
  } catch (err) {
    console.error('Failed to save token to storage:', err);
  }
};

/**
 * Central authenticated HTTP request helper
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || (typeof data === 'string' ? data : 'API Request failed');
    throw new Error(msg);
  }

  return data;
}

// ==========================================
// Authentication APIs
// ==========================================

export const createUser = async (email, password, username) => {
  try {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });

    if (res.token) {
      await setAuthToken(res.token);
    }

    return res.user;
  } catch (error) {
    console.error('createUser error:', error.message);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.token) {
      await setAuthToken(res.token);
    }

    return {
      $id: res.user?.$id || res.user?.accountId,
      userId: res.user?.$id || res.user?.accountId,
      ...res,
    };
  } catch (error) {
    console.error('signIn error:', error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const user = await apiRequest('/api/auth/me', { method: 'GET' });
    return user;
  } catch (error) {
    console.log('[getCurrentUser] Not authenticated or expired session');
    return null;
  }
};

// ==========================================
// Foods APIs
// ==========================================

export const createFood = async (food) => {
  try {
    const newFood = await apiRequest('/api/foods', {
      method: 'POST',
      body: JSON.stringify(food),
    });
    return newFood;
  } catch (error) {
    console.error('createFood error:', error.message);
    throw error;
  }
};

export const searchFoods = async (text) => {
  try {
    const res = await apiRequest(`/api/foods/search?q=${encodeURIComponent(text)}`, {
      method: 'GET',
    });
    return res.documents || [];
  } catch (err) {
    console.error('searchFoods error:', err.message);
    return [];
  }
};

export const searchFoodsByBarcode = async (barcode) => {
  try {
    const res = await apiRequest(`/api/foods/barcode/${encodeURIComponent(barcode)}`, {
      method: 'GET',
    });
    return res.documents || [];
  } catch (err) {
    console.error('searchFoodsByBarcode error:', err.message);
    return [];
  }
};

// ==========================================
// Compatibility: Appwrite Account object
// ==========================================

export const account = {
  get: async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not logged in');
    return {
      $id: user.accountId || user.$id,
      ...user,
    };
  },
  createEmailPasswordSession: async (email, password) => {
    return await signIn(email, password);
  },
  updateEmail: async (email, password) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return await apiRequest(`/api/users/${user.accountId || user.$id}/email`, {
      method: 'PUT',
      body: JSON.stringify({ email, password }),
    });
  },
  updatePassword: async (newPassword, currentPassword) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return await apiRequest(`/api/users/${user.accountId || user.$id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword, currentPassword }),
    });
  },
  updateName: async (name) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return await apiRequest(`/api/users/${user.accountId || user.$id}`, {
      method: 'PUT',
      body: JSON.stringify({ username: name }),
    });
  },
  deleteSession: async () => {
    await setAuthToken(null);
    return { status: true };
  },
};

// ==========================================
// Compatibility: Appwrite Databases object
// ==========================================

export const databases = {
  createDocument: async (databaseId, collectionId, documentId, data) => {
    if (collectionId === config.foodsCollectionId) {
      return await apiRequest('/api/foods', {
        method: 'POST',
        body: JSON.stringify({ id: documentId, ...data }),
      });
    }

    if (collectionId === config.goalsCollectionId) {
      return await apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify({ id: documentId, ...data }),
      });
    }

    if (collectionId === config.dailyLogsCollectionId) {
      return await apiRequest('/api/daily-logs', {
        method: 'POST',
        body: JSON.stringify({ id: documentId, ...data }),
      });
    }

    if (collectionId === config.userCollectionId) {
      return await apiRequest(`/api/users/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }

    throw new Error(`Unknown collectionId: ${collectionId}`);
  },

  listDocuments: async (databaseId, collectionId, queries = []) => {
    // Parse Appwrite Query filters
    const queryMap = {};
    if (Array.isArray(queries)) {
      queries.forEach((q) => {
        if (q && q.attr) {
          queryMap[q.attr] = q;
        }
      });
    }

    if (collectionId === config.userCollectionId) {
      const user = await getCurrentUser();
      if (!user) return { total: 0, documents: [] };
      return { total: 1, documents: [user] };
    }

    if (collectionId === config.foodsCollectionId) {
      if (queryMap['barcode']) {
        const barcode = queryMap['barcode'].val;
        return await apiRequest(`/api/foods/barcode/${encodeURIComponent(barcode)}`, { method: 'GET' });
      }
      return await apiRequest('/api/foods', { method: 'GET' });
    }

    if (collectionId === config.goalsCollectionId) {
      const userId = queryMap['userId'] ? queryMap['userId'].val : '';
      const url = userId ? `/api/goals?userId=${encodeURIComponent(userId)}` : '/api/goals';
      return await apiRequest(url, { method: 'GET' });
    }

    if (collectionId === config.dailyLogsCollectionId) {
      const userId = queryMap['userId'] ? queryMap['userId'].val : '';
      let url = `/api/daily-logs?userId=${encodeURIComponent(userId)}`;

      if (queryMap['date']) {
        if (queryMap['date'].type === 'gte') {
          url += `&startDate=${encodeURIComponent(queryMap['date'].val)}`;
        } else if (queryMap['date'].type === 'lte') {
          url += `&endDate=${encodeURIComponent(queryMap['date'].val)}`;
        }
      }

      // Check if multiple date filters were passed
      const dateQueries = queries.filter((q) => q && q.attr === 'date');
      dateQueries.forEach((q) => {
        if (q.type === 'gte') {
          url += `&startDate=${encodeURIComponent(q.val)}`;
        } else if (q.type === 'lte') {
          url += `&endDate=${encodeURIComponent(q.val)}`;
        }
      });

      return await apiRequest(url, { method: 'GET' });
    }

    return { total: 0, documents: [] };
  },

  updateDocument: async (databaseId, collectionId, documentId, data) => {
    if (collectionId === config.userCollectionId) {
      return await apiRequest(`/api/users/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }

    if (collectionId === config.dailyLogsCollectionId) {
      return await apiRequest(`/api/daily-logs/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }

    if (collectionId === config.foodsCollectionId) {
      return await apiRequest(`/api/foods/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }

    throw new Error(`Unknown collectionId for update: ${collectionId}`);
  },

  deleteDocument: async (databaseId, collectionId, documentId) => {
    if (collectionId === config.dailyLogsCollectionId) {
      return await apiRequest(`/api/daily-logs/${documentId}`, { method: 'DELETE' });
    }
    return { status: true };
  },
};

// ==========================================
// Compatibility: Appwrite Storage object
// ==========================================

export const storage = {
  createFile: async (bucketId, fileId, fileObj) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileObj.uri,
      type: fileObj.type || 'image/jpeg',
      name: fileObj.name || 'avatar.jpg',
    });

    const res = await apiRequest('/api/upload/avatar', {
      method: 'POST',
      body: formData,
    });

    return {
      $id: res.fileId || res.$id,
      ...res,
    };
  },

  deleteFile: async (bucketId, fileId) => {
    return await apiRequest(`/api/upload/${fileId}`, { method: 'DELETE' });
  },

  getFileView: (bucketId, fileId) => {
    return {
      href: `${API_BASE_URL}/api/uploads/${fileId}`,
    };
  },
};

// ==========================================
// Compatibility: Avatars helper
// ==========================================

export const avatars = {
  getInitials: (username) => {
    const clean = encodeURIComponent(username || 'U');
    return {
      href: `https://ui-avatars.com/api/?name=${clean}&background=C0C0C0&color=fff&size=200`,
    };
  },
};

// ==========================================
// Compatibility: Query builder
// ==========================================

export const Query = {
  equal: (attr, val) => ({ type: 'equal', attr, val }),
  greaterThanEqual: (attr, val) => ({ type: 'gte', attr, val }),
  lessThanEqual: (attr, val) => ({ type: 'lte', attr, val }),
  limit: (val) => ({ type: 'limit', val }),
};

// ==========================================
// Compatibility: ID generator & Permissions
// ==========================================

export const ID = {
  unique: () => 'id_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
};

export const Permission = {
  read: (role) => `read("${role}")`,
  write: (role) => `write("${role}")`,
};

export const Role = {
  user: (id) => `user:${id}`,
  any: () => 'any',
};

export default {
  config,
  createUser,
  signIn,
  getCurrentUser,
  createFood,
  searchFoods,
  searchFoodsByBarcode,
  account,
  databases,
  storage,
  avatars,
  Query,
  ID,
  Permission,
  Role,
};
