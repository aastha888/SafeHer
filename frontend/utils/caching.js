import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_KEY = 'safeher_contacts_cache';

export const saveContacts = async (contacts) => {
  try {
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (e) {
    // Caching is a nice-to-have; failing silently is fine here
    console.log('Failed to cache contacts:', e.message);
  }
};

export const getCachedContacts = async () => {
  try {
    const json = await AsyncStorage.getItem(CONTACTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const clearContactsCache = async () => {
  try {
    await AsyncStorage.removeItem(CONTACTS_KEY);
  } catch (e) {
    console.log('Failed to clear contacts cache:', e.message);
  }
};