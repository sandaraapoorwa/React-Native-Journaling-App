"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { validateEmail, validatePassword } from "./utils/validation"

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form validation states
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Check for saved credentials on component mount
  useEffect(() => {
    const checkSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("paperpal_email")
        const savedRememberMe = await AsyncStorage.getItem("paperpal_remember_me")

        if (savedEmail && savedRememberMe === "true") {
          setEmail(savedEmail)
          setRememberMe(true)

          // Optionally load password if remember me was checked
          const savedPassword = await AsyncStorage.getItem("paperpal_password")
          if (savedPassword) {
            setPassword(savedPassword)
          }
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error)
      }
    }

    checkSavedCredentials()
  }, [])

  const validateForm = () => {
    let isValid = true

    // Validate email
    const emailValidation = validateEmail(email)
    setEmailError(emailValidation)
    if (emailValidation) isValid = false

    // Validate password
    const passwordValidation = validatePassword(password)
    setPasswordError(passwordValidation)
    if (passwordValidation) isValid = false

    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      // Check if user exists in AsyncStorage
      const usersJSON = await AsyncStorage.getItem("paperpal_users")
      const users = usersJSON ? JSON.parse(usersJSON) : []

      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        Alert.alert("Login Failed", "No account found with this email. Please register first.")
        setLoading(false)
        return
      }

      if (user.password !== password) {
        Alert.alert("Login Failed", "Incorrect password. Please try again.")
        setLoading(false)
        return
      }

      // Save credentials if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem("paperpal_email", email)
        await AsyncStorage.setItem("paperpal_password", password)
        await AsyncStorage.setItem("paperpal_remember_me", "true")
      } else {
        // Clear saved credentials if remember me is unchecked
        await AsyncStorage.removeItem("paperpal_password")
        await AsyncStorage.removeItem("paperpal_remember_me")
      }

      // Save current user info
      await AsyncStorage.setItem("paperpal_current_user", JSON.stringify(user))

      // Navigate to dashboard
      navigation.navigate("Details")
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert("Error", "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // For a simple implementation, we'll just show an alert
    Alert.alert(
      "Reset Password",
      "In a real app, this would send a password reset email. For this demo, please use the registration page to create a new account.",
      [{ text: "OK" }],
    )
  }

  return (
    <ImageBackground source={{ uri: "https://via.placeholder.com/600/f5f0e6" }} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <BookOpen color="#5E4B3E" size={40} />
            </View>
            <Text style={styles.logoText}>PaperPal</Text>
            <Text style={styles.tagline}>Your vintage reading companion</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.decorativeLine} />

            <Text style={styles.welcomeText}>Welcome Back</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                <Mail color={emailError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#A89B8C"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    if (emailError) setEmailError("")
                  }}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                <Lock color={passwordError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor="#A89B8C"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (passwordError) setPasswordError("")
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color="#8D7B6A" size={18} /> : <Eye color="#8D7B6A" size={18} />}
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading ? styles.loginButtonDisabled : null]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#F5F0E6" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <View style={styles.dividerOrnament} />
              <View style={styles.divider} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signupLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>PaperPal © 2025</Text>
            <Text style={styles.footerText}>Bringing vintage reading to life</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E6", // Vintage paper color
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#5E4B3E",
    marginTop: 16,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  tagline: {
    fontSize: 14,
    color: "#8D7B6A",
    marginTop: 8,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  formContainer: {
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 24,
    marginVertical: 20,
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
    marginBottom: 20,
    borderRadius: 1,
  },
  welcomeText: {
    fontSize: 24,
    color: "#5E4B3E",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  inputContainer: {
    marginBottom: 20,
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#8D7B6A",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#8D7B6A",
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: "#F5F0E6",
    borderRadius: 2,
  },
  checkboxLabel: {
    color: "#5E4B3E",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  forgotPassword: {
    color: "#8D7B6A",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  loginButton: {
    backgroundColor: "#8D7B6A",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#7A6A5A",
  },
  loginButtonDisabled: {
    backgroundColor: "#A89B8C",
    borderColor: "#A89B8C",
  },
  loginButtonText: {
    color: "#F5F0E6",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "center",
  },
  divider: {
    width: "30%",
    height: 1,
    backgroundColor: "#D9CAB9",
  },
  dividerOrnament: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8D7B6A",
    marginHorizontal: 10,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signupText: {
    color: "#5E4B3E",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  signupLink: {
    color: "#8D7B6A",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  footerContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#8D7B6A",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    marginBottom: 4,
  },
})
