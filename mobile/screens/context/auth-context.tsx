"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// User type definition
export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

// Storage keys
const KEYS = {
  USERS: "paperpal_users",
  CURRENT_USER: "paperpal_current_user",
  REMEMBER_ME: "paperpal_remember_me",
  EMAIL: "paperpal_email",
  PASSWORD: "paperpal_password",
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  updateProfile: (updates: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedInUser = async () => {
      try {
        const userJSON = await AsyncStorage.getItem(KEYS.CURRENT_USER)
        if (userJSON) {
          setUser(JSON.parse(userJSON))
        }
      } catch (error) {
        console.error("Error checking logged in user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkLoggedInUser()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Get all users
      const usersJSON = await AsyncStorage.getItem(KEYS.USERS)
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : []

      // Find user by email
      const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      // Check if user exists and password matches
      if (!foundUser || foundUser.password !== password) {
        return false
      }

      // Save current user
      await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(foundUser))

      // Save remember me preferences
      if (rememberMe) {
        await AsyncStorage.setItem(KEYS.EMAIL, email)
        await AsyncStorage.setItem(KEYS.PASSWORD, password)
        await AsyncStorage.setItem(KEYS.REMEMBER_ME, "true")
      } else {
        await AsyncStorage.removeItem(KEYS.PASSWORD)
        await AsyncStorage.removeItem(KEYS.REMEMBER_ME)
      }

      setUser(foundUser)
      return true
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert("Error", "An unexpected error occurred during login.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Get all users
      const usersJSON = await AsyncStorage.getItem(KEYS.USERS)
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : []

      // Check if user already exists
      const userExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase())
      if (userExists) {
        return false
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
      }

      // Save to storage
      const updatedUsers = [...users, newUser]
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers))
      await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser))

      setUser(newUser)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      Alert.alert("Error", "An unexpected error occurred during registration.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    try {
      // Get all users
      const usersJSON = await AsyncStorage.getItem(KEYS.USERS)
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : []

      // Find user index
      const userIndex = users.findIndex((u) => u.id === user.id)
      if (userIndex === -1) return false

      // Update user
      const updatedUser = { ...users[userIndex], ...updates }
      users[userIndex] = updatedUser

      // Save updated users
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users))

      // Update current user
      await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser))

      setUser(updatedUser)
      return true
    } catch (error) {
      console.error("Update profile error:", error)
      Alert.alert("Error", "An unexpected error occurred while updating your profile.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await AsyncStorage.removeItem(KEYS.CURRENT_USER)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      Alert.alert("Error", "An unexpected error occurred during logout.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper functions for storage operations
export const getRememberMe = async (): Promise<{ email: string; password: string; remember: boolean } | null> => {
  try {
    const email = await AsyncStorage.getItem(KEYS.EMAIL)
    const password = await AsyncStorage.getItem(KEYS.PASSWORD)
    const remember = await AsyncStorage.getItem(KEYS.REMEMBER_ME)

    if (email && remember === "true") {
      return {
        email,
        password: password || "",
        remember: true,
      }
    }

    return null
  } catch (error) {
    console.error("Error getting remember me preferences:", error)
    return null
  }
}
