"use client"

import { useState } from "react"
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
import { BookOpen, Mail, Lock, Eye, EyeOff, User, ArrowLeft } from "lucide-react-native"
import { validateEmail, validatePassword, validateName } from "./utils/validation"
import { registerUser, saveCurrentUser } from "./utils/storage"

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form validation states
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  const validateForm = () => {
    let isValid = true

    // Validate name
    const nameValidation = validateName(name)
    setNameError(nameValidation)
    if (nameValidation) isValid = false

    // Validate email
    const emailValidation = validateEmail(email)
    setEmailError(emailValidation)
    if (emailValidation) isValid = false

    // Validate password
    const passwordValidation = validatePassword(password)
    setPasswordError(passwordValidation)
    if (passwordValidation) isValid = false

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match")
      isValid = false
    }

    return isValid
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      // Register new user
      const newUser = await registerUser({
        name,
        email,
        password,
      })

      if (!newUser) {
        Alert.alert("Registration Failed", "An account with this email already exists.")
        setLoading(false)
        return
      }

      // Save as current user
      await saveCurrentUser(newUser)

      Alert.alert("Registration Successful", "Your account has been created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Dashboard"),
        },
      ])
    } catch (error) {
      console.error("Registration error:", error)
      Alert.alert("Error", "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ImageBackground source={{ uri: "https://via.placeholder.com/600/f5f0e6" }} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#5E4B3E" size={24} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <BookOpen color="#5E4B3E" size={40} />
            </View>
            <Text style={styles.logoText}>PaperPal</Text>
            <Text style={styles.tagline}>Your vintage reading companion</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.decorativeLine} />

            <Text style={styles.welcomeText}>Create Account</Text>

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

            {/* Email Input */}
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

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                <Lock color={passwordError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#A89B8C"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (passwordError) setPasswordError("")
                    if (confirmPasswordError && text === confirmPassword) {
                      setConfirmPasswordError("")
                    }
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color="#8D7B6A" size={18} /> : <Eye color="#8D7B6A" size={18} />}
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputWrapper, confirmPasswordError ? styles.inputError : null]}>
                <Lock color={confirmPasswordError ? "#B25B4C" : "#8D7B6A"} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#A89B8C"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (confirmPasswordError && text === password) {
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
              style={[styles.registerButton, loading ? styles.registerButtonDisabled : null]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#F5F0E6" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <View style={styles.dividerOrnament} />
              <View style={styles.divider} />
            </View>
              <View style={styles.divider} />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
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
    backgroundColor: "#F5F0E6",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(232, 223, 208, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5E4B3E",
    marginTop: 12,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  tagline: {
    fontSize: 14,
    color: "#8D7B6A",
    marginTop: 4,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  formContainer: {
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 24,
    marginVertical: 10,
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
  registerButton: {
    backgroundColor: "#8D7B6A",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#7A6A5A",
  },
  registerButtonDisabled: {
    backgroundColor: "#A89B8C",
    borderColor: "#A89B8C",
  },
  registerButtonText: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#5E4B3E",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  loginLink: {
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
