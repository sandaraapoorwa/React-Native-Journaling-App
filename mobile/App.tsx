import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, View } from "react-native";
import { AuthProvider } from "./screens/context/auth-context"; // Import AuthProvider

// Screens
import DetailsScreen from "./screens/Details";
import LoginScreen from "./screens/Login";
import RegisterScreen from "./screens/registerScreen";
import SplashScreen from "./screens/SplashScreen";
import ProfileScreen from "./screens/profilePage";
import HomeScreen from "./screens/HomeScreen";

// Define RootStackParamList
type RootStackParamList = {
  SplashScreen: undefined;
  Login: undefined;
  Register: undefined;
  Details: { entry: DiaryEntry };
  Profile: undefined;
  Home: undefined;
};

// Define DiaryEntry type
type DiaryEntry = {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  category: string;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("paperpal_has_launched");
        setInitialRoute(hasLaunched ? "Login" : "SplashScreen");
        await AsyncStorage.setItem("paperpal_has_launched", "true");
      } catch (error) {
        console.error("Error checking first launch:", error);
        setInitialRoute("SplashScreen");
      }
    };
    checkFirstLaunch();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E6" }}>
        <SplashScreen />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "Diary Entries",
              headerStyle: { backgroundColor: "#F5F0E6" },
              headerTintColor: "#5E4B3E",
              headerTitleStyle: {
                fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
              },
            }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{
              title: "Entry Details",
              headerStyle: { backgroundColor: "#F5F0E6" },
              headerTintColor: "#5E4B3E",
              headerTitleStyle: {
                fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
              },
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default function App() {
  return <AppNavigator />;
}