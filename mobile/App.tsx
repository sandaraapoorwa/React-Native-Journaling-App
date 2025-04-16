"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

// Screens
import HomeScreen from "./screens/HomeScreen"
import DetailsScreen from "./screens/Details"
import LoginScreen from "./screens/Login"
import RegisterScreen from "./screens/registerScreen"
import SplashScreen from "./screens/SplashScreen"
import ProfileScreen from "./screens/profilePage"

// Auth Context
import { AuthProvider, useAuth } from "./screens/context/auth-context"

const Stack = createNativeStackNavigator()

// Navigation component that handles auth state
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  useEffect(() => {
    // Check if we should skip the splash screen (not on first launch)
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("paperpal_has_launched")
        setInitialRoute(hasLaunched ? (isAuthenticated ? "Home" : "Login") : "SplashScreen")

        // Set the flag for future launches
        await AsyncStorage.setItem("paperpal_has_launched", "true")
      } catch (error) {
        console.error("Error checking first launch:", error)
        setInitialRoute("SplashScreen")
      }
    }

    checkFirstLaunch()
  }, [isAuthenticated])

  // Show splash screen while loading auth state or determining initial route
  if (isLoading || !initialRoute) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        {!isAuthenticated ? (
          // Unauthenticated routes
          <>
            <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          // Authenticated routes
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Details"
              component={DetailsScreen}
              options={{
                title: "Entry Details",
                headerStyle: {
                  backgroundColor: "#F5F0E6",
                },
                headerTintColor: "#5E4B3E",
                headerTitleStyle: {
                  fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
                },
              }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}
