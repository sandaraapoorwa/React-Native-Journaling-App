"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Save, LogOut } from "lucide-react-native"
import { useAuth } from "./context/auth-context"
import { updateUserProfile } from "./utils/storage"
import { validateName, validatePassword } from "./utils/validation"

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth()

  const [name, setName] = useState(user?.name || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form validation states
  const [nameError, setNameError] = useState("")
  const [currentPasswordError, setCurrentPasswordError] = useState("")
  const [newPasswordError, setNewPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  const validateForm = () => {
    let isValid = true

    // Validate name
    if (name !== user?.name) {
      const nameValidation = validateName(name)
      setNameError(nameValidation)
      if (nameValidation) isValid = false
    }

    // Only validate password fields if user is trying to change password
    if (currentPassword || newPassword || confirmPassword) {
      // Validate current password
      if (!currentPassword) {
        setCurrentPasswordError("Current password is required")
        isValid = false
      } else if (currentPassword !== user?.password) {
        setCurrentPasswordError("Current password is incorrect")
        isValid = false
      }

      // Validate new password
      if (newPassword) {
        const passwordValidation = validatePassword(newPassword)
        setNewPasswordError(passwordValidation)
        if (passwordValidation) isValid = false
      }

      // Validate confirm password
      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Passwords don't match")
        isValid = false
      }
    }

    return isValid
  }

  const handleUpdateProfile = async () => {
    if (!validateForm() || !user) return

    setLoading(true)

    try {
      const updates: { name?: string; password?: string } = {}

      // Only update what has changed
      if (name !== user.name) {
        updates.name = name
      }

      if (newPassword) {
        updates.password = newPassword
      }

      // Only make the API call if there are updates
      if (Object.keys(updates).length > 0) {
        const updatedUser = await updateUserProfile(user.id, updates)

        if (!updatedUser) {
          Alert.alert("Update Failed", "Failed to update profile. Please try again.")
          return
        }

        Alert.alert("Success", "Your profile has been updated successfully.")

        // Reset password fields
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        Alert.alert("No Changes", "No changes were made to your profile.")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      Alert.alert("Error", "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout()
        },
      },
    ])
  }

  return (
    <ImageBackground source={{ uri: "https://via.placeholder.com/600/f5f0e6" }} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#5E4B3E" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#5E4B3E" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color="#5E4B3E" size={40} />
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.decorativeLine} />
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputWrapper, nameError ? styles.inputError : null]}>
                <User color={nameError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#A89B8C"
                  value={name}
                  onChangeText={(text) => {
                    setName(text)
                    if (nameError) setNameError("")
                  }}
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* Email Input (disabled) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Mail color="#8D7B6A" size={18} style={styles.inputIcon} />
                <TextInput style={[styles.input, styles.inputTextDisabled]} value={user?.email} editable={false} />
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.decorativeLine} />
            <Text style={styles.sectionTitle}>Change Password</Text>

            {/* Current Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={[styles.inputWrapper, currentPasswordError ? styles.inputError : null]}>
                <Lock color={currentPasswordError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor="#A89B8C"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text)
                    if (currentPasswordError) setCurrentPasswordError("")
                  }}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIcon}>
                  {showCurrentPassword ? <EyeOff color="#8D7B6A" size={18} /> : <Eye color="#8D7B6A" size={18} />}
                </TouchableOpacity>
              </View>
              {currentPasswordError ? <Text style={styles.errorText}>{currentPasswordError}</Text> : null}
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={[styles.inputWrapper, newPasswordError ? styles.inputError : null]}>
                <Lock color={newPasswordError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#A89B8C"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text)
                    if (newPasswordError) setNewPasswordError("")
                    if (confirmPasswordError && text === confirmPassword) {
                      setConfirmPasswordError("")
                    }
                  }}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                  {showNewPassword ? <EyeOff color="#8D7B6A" size={18} /> : <Eye color="#8D7B6A" size={18} />}
                </TouchableOpacity>
              </View>
              {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={[styles.inputWrapper, confirmPasswordError ? styles.inputError : null]}>
                <Lock color={confirmPasswordError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#A89B8C"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (confirmPasswordError && text === newPassword) {
                      setConfirmPasswordError("")
                    }
                  }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  {showConfirmPassword ? <EyeOff color="#8D7B6A" size={18} /> : <Eye color="#8D7B6A" size={18} />}
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading ? styles.saveButtonDisabled : null]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#F5F0E6" />
              ) : (
                <>
                  <Save color="#F5F0E6" size={18} style={styles.saveButtonIcon} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(169, 150, 113, 0.3)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(232, 223, 208, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(232, 223, 208, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  profileContainer: {
    marginBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5E4B3E",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  userEmail: {
    fontSize: 16,
    color: "#8D7B6A",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  formContainer: {
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#D9CAB9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  decorativeLine: {
    height: 2,
    backgroundColor: "#D9CAB9",
    width: "40%",
    alignSelf: "center",
    marginVertical: 20,
    borderRadius: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5E4B3E",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#5E4B3E",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9CAB9",
    borderRadius: 8,
    backgroundColor: "#F5F0E6",
    paddingHorizontal: 12,
  },
  inputDisabled: {
    backgroundColor: "#EAE5DC",
  },
  inputTextDisabled: {
    color: "#A89B8C",
  },
  inputError: {
    borderColor: "#B25B4C",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#B25B4C",
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontStyle: "italic",
  },
  helperText: {
    color: "#8D7B6A",
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontStyle: "italic",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#5E4B3E",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  eyeIcon: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: "#8D7B6A",
    borderRadius: 8,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#7A6A5A",
  },
  saveButtonDisabled: {
    backgroundColor: "#A89B8C",
    borderColor: "#A89B8C",
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#F5F0E6",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
})
