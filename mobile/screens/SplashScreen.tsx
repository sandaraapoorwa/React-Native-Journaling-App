"use client"

import type React from "react"
import { useEffect } from "react"
import { View, StyleSheet, ImageBackground, Dimensions, Platform } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring } from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { BookOpen } from "lucide-react-native"

const { width, height } = Dimensions.get("window")

// Define custom easing config to avoid using Easing functions directly
const timingConfig = {
  duration: 800,
}

const springConfig = {
  damping: 10,
  stiffness: 100,
}

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const fadeAnim = useSharedValue(0)
  const scaleAnim = useSharedValue(0.9)
  const logoOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.5)
  const lineWidth = useSharedValue(0)
  const subtitleOpacity = useSharedValue(0)

  useEffect(() => {
    // Animate logo first - using withTiming with simple config
    logoOpacity.value = withTiming(1, { duration: 800 })
    // Use withSpring for scale animation instead of elastic easing
    logoScale.value = withSpring(1, springConfig)

    // Then animate title
    fadeAnim.value = withDelay(400, withTiming(1, timingConfig))
    scaleAnim.value = withDelay(400, withTiming(1, timingConfig))

    // Animate decorative line
    lineWidth.value = withDelay(800, withTiming(width * 0.6, { duration: 600 }))

    // Finally animate subtitle
    subtitleOpacity.value = withDelay(1000, withTiming(1, timingConfig))

    // Navigate to login after animation completes
    const timer = setTimeout(() => navigation.replace("Login"), 2800)
    return () => clearTimeout(timer)
  }, [navigation])

  const titleStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth.value,
  }))

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }))

  return (
    <ImageBackground
      source={{ uri: "https://www.transparenttextures.com/patterns/old-paper.png" }}
      style={styles.container}
    >
      <View style={styles.overlay} />

      {/* Vintage paper edge decorations */}
      <View style={styles.leftEdge} />
      <View style={styles.rightEdge} />
      <View style={styles.topEdge} />
      <View style={styles.bottomEdge} />

      {/* Corner decorations */}
      <View style={[styles.cornerDecoration, styles.topLeftCorner]} />
      <View style={[styles.cornerDecoration, styles.topRightCorner]} />
      <View style={[styles.cornerDecoration, styles.bottomLeftCorner]} />
      <View style={[styles.cornerDecoration, styles.bottomRightCorner]} />

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoCircle}>
            <BookOpen color="#5E4B3E" size={50} />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, titleStyle]}>PaperPal</Animated.Text>

        <Animated.View style={[styles.decorativeLine, lineStyle]} />

        <Animated.Text style={[styles.subtitle, subtitleStyle]}>Your vintage reading companion</Animated.Text>

        <Animated.Text style={[styles.tagline, subtitleStyle]}>Est. 2025</Animated.Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F0E6",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245, 240, 230, 0.7)",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#5E4B3E",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    textAlign: "center",
  },
  decorativeLine: {
    height: 2,
    backgroundColor: "#8D7B6A",
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#8D7B6A",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontStyle: "italic",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#A89B8C",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    marginTop: 8,
  },
  // Vintage paper edge decorations
  leftEdge: {
    position: "absolute",
    left: 0,
    top: height * 0.1,
    bottom: height * 0.1,
    width: 2,
    backgroundColor: "rgba(169, 150, 113, 0.4)",
  },
  rightEdge: {
    position: "absolute",
    right: 0,
    top: height * 0.1,
    bottom: height * 0.1,
    width: 2,
    backgroundColor: "rgba(169, 150, 113, 0.4)",
  },
  topEdge: {
    position: "absolute",
    top: 0,
    left: width * 0.1,
    right: width * 0.1,
    height: 2,
    backgroundColor: "rgba(169, 150, 113, 0.4)",
  },
  bottomEdge: {
    position: "absolute",
    bottom: 0,
    left: width * 0.1,
    right: width * 0.1,
    height: 2,
    backgroundColor: "rgba(169, 150, 113, 0.4)",
  },
  // Corner decorations
  cornerDecoration: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "rgba(169, 150, 113, 0.6)",
  },
  topLeftCorner: {
    top: 20,
    left: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRightCorner: {
    top: 20,
    right: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeftCorner: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRightCorner: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
})

export default SplashScreen
