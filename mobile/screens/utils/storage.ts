import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const KEYS = {
  USERS: "paperpal_users",
  CURRENT_USER: "paperpal_current_user",
  REMEMBER_ME: "paperpal_remember_me",
  EMAIL: "paperpal_email",
  PASSWORD: "paperpal_password",
  ENTRIES: "paperpal_entries",
};

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// DiaryEntry type definition
export interface DiaryEntry {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  category: string;
}

/**
 * Get all users from storage
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersJSON = await AsyncStorage.getItem(KEYS.USERS);
    return usersJSON ? JSON.parse(usersJSON) : [];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

/**
 * Save users to storage
 */
export const saveUsers = async (users: User[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Error saving users:", error);
    return false;
  }
};

/**
 * Get current logged in user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJSON = await AsyncStorage.getItem(KEYS.CURRENT_USER);
    return userJSON ? JSON.parse(userJSON) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Save current user
 */
export const saveCurrentUser = async (user: User): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("Error saving current user:", error);
    return false;
  }
};

/**
 * Clear current user (logout)
 */
export const clearCurrentUser = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error("Error clearing current user:", error);
    return false;
  }
};

/**
 * Register a new user
 */
export const registerUser = async (userData: Omit<User, "id" | "createdAt">): Promise<User | null> => {
  try {
    const users = await getUsers();
    const userExists = users.some((user) => user.email.toLowerCase() === userData.email.toLowerCase());
    if (userExists) {
      return null;
    }
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
    return newUser;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};

/**
 * Login user
 */
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const users = await getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      await saveCurrentUser(user);
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error logging in user:", error);
    return null;
  }
};

/**
 * Save remember me preferences
 */
export const saveRememberMe = async (email: string, password: string, remember: boolean): Promise<void> => {
  try {
    if (remember) {
      await AsyncStorage.setItem(KEYS.EMAIL, email);
      await AsyncStorage.setItem(KEYS.PASSWORD, password);
      await AsyncStorage.setItem(KEYS.REMEMBER_ME, "true");
    } else {
      await AsyncStorage.removeItem(KEYS.PASSWORD);
      await AsyncStorage.removeItem(KEYS.REMEMBER_ME);
    }
  } catch (error) {
    console.error("Error saving remember me preferences:", error);
  }
};

/**
 * Get remember me preferences
 */
export const getRememberMe = async (): Promise<{ email: string; password: string; remember: boolean } | null> => {
  try {
    const email = await AsyncStorage.getItem(KEYS.EMAIL);
    const password = await AsyncStorage.getItem(KEYS.PASSWORD);
    const remember = await AsyncStorage.getItem(KEYS.REMEMBER_ME);

    if (email && remember === "true") {
      return {
        email,
        password: password || "",
        remember: true,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting remember me preferences:", error);
    return null;
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const currentUser = await getCurrentUser();
  return currentUser !== null;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<boolean> => {
  try {
    await clearCurrentUser();
    return true;
  } catch (error) {
    console.error("Error logging out user:", error);
    return false;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> => {
  try {
    const users = await getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return null;
    }

    const updatedUser = {
      ...users[userIndex],
      ...updates,
    };

    users[userIndex] = updatedUser;
    await saveUsers(users);

    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      await saveCurrentUser(updatedUser);
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

/**
 * Get all diary entries from storage
 */
export const getDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const entriesJSON = await AsyncStorage.getItem(KEYS.ENTRIES);
    return entriesJSON ? JSON.parse(entriesJSON) : [];
  } catch (error) {
    console.error("Error getting diary entries:", error);
    return [];
  }
};

/**
 * Save a diary entry (create or update)
 */
export const saveDiaryEntry = async (entry: DiaryEntry): Promise<boolean> => {
  try {
    const entries = await getDiaryEntries();
    const entryIndex = entries.findIndex((e) => e.id === entry.id);

    if (entryIndex !== -1) {
      entries[entryIndex] = entry; // Update existing entry
    } else {
      entries.push(entry); // Add new entry
    }

    await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error("Error saving diary entry:", error);
    return false;
  }
};

/**
 * Delete a diary entry
 */
export const deleteDiaryEntry = async (entryId: number): Promise<boolean> => {
  try {
    const entries = await getDiaryEntries();
    const updatedEntries = entries.filter((e) => e.id !== entryId);

    await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    return false;
  }
};