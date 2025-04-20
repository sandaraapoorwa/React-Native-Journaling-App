import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Platform,
  Alert,
  Animated,
  Share,
  Dimensions,
  Modal,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { NavigationProp, RouteProp, useFocusEffect } from "@react-navigation/native";
import {
  Smile,
  Sun,
  Cloud,
  CloudRain,
  Save,
  Trash2,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Image as ImageIcon,
  Lock,
  Unlock,
  Tag,
  Edit3,
  ChevronLeft,
  X,
  Plus,
  Star,
  Heart,
  Bookmark,
  AlertTriangle,
  Moon,
  CloudLightning,
  CloudSnow,
  Wind,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { PanGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler";

// RootStackParamList
type RootStackParamList = {
  SplashScreen: undefined;
  Login: undefined;
  Register: undefined;
  Details: { entry: DiaryEntry; isNew?: boolean };
  Profile: undefined;
  Home: undefined;
  Map: { entries: DiaryEntry[] };
  Calendar: undefined;
  Settings: undefined;
};

type DiaryEntry = {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  category: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: string[];
  audioRecording?: string;
  weather?: {
    temperature?: number;
    condition?: string;
    humidity?: number;
  };
  tags?: string[];
  isPrivate?: boolean;
  lastEdited?: string;
  reminderDate?: string;
  isFavorite?: boolean;
};

type Tag = {
  id: string;
  name: string;
};

type DetailsScreenRouteProp = RouteProp<RootStackParamList, "Details">;
type DetailsScreenNavigationProp = NavigationProp<RootStackParamList>;

interface DetailsScreenProps {
  route: DetailsScreenRouteProp;
  navigation: DetailsScreenNavigationProp;
}

const DetailsScreen: React.FC<DetailsScreenProps> = ({ route, navigation }) => {
  const { entry, isNew = false } = route.params || {};
  const [isEditing, setIsEditing] = useState(isNew);
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [mood, setMood] = useState(entry?.mood || "happy");
  const [category, setCategory] = useState(entry?.category || "daily");
  const [location, setLocation] = useState(entry?.location || null);
  const [images, setImages] = useState<string[]>(entry?.images || []);
  const [audioRecording, setAudioRecording] = useState<string | null>(entry?.audioRecording || null);
  const [weather, setWeather] = useState(entry?.weather || null);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [isPrivate, setIsPrivate] = useState(entry?.isPrivate || false);
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite || false);
  const [reminderDate, setReminderDate] = useState<string | null>(entry?.reminderDate || null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerHeight = useRef(new Animated.Value(200)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);
  const playbackTimer = useRef<NodeJS.Timeout | null>(null);

  const moodOptions = [
    { label: "Happy", value: "happy", icon: <Smile color="#5E4B3E" size={24} /> },
    { label: "Excited", value: "excited", icon: <Sun color="#5E4B3E" size={24} /> },
    { label: "Calm", value: "calm", icon: <Cloud color="#5E4B3E" size={24} /> },
    { label: "Sad", value: "sad", icon: <CloudRain color="#5E4B3E" size={24} /> },
    { label: "Angry", value: "angry", icon: <CloudLightning color="#5E4B3E" size={24} /> },
    { label: "Tired", value: "tired", icon: <Moon color="#5E4B3E" size={24} /> },
    { label: "Cold", value: "cold", icon: <CloudSnow color="#5E4B3E" size={24} /> },
    { label: "Windy", value: "windy", icon: <Wind color="#5E4B3E" size={24} /> },
  ];

  const categoryOptions = ["daily", "books", "travel", "food", "weather", "work", "health", "family", "friends"];

  // Entry validation
  const validateEntry = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your diary entry.");
      titleInputRef.current?.focus();
      return false;
    }
    if (!content.trim()) {
      Alert.alert("Missing Content", "Please write some content for your diary entry.");
      contentInputRef.current?.focus();
      return false;
    }
    return true;
  };

  // Load all tags from storage
  const loadTags = async () => {
    try {
      const tagsJSON = await AsyncStorage.getItem("paperpal_tags");
      if (tagsJSON) {
        setAllTags(JSON.parse(tagsJSON));
      }
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  };

  // Save a new tag
  const saveTag = async (tagName: string) => {
    if (!tagName.trim()) return;
    
    try {
      const newTagObj = { id: Date.now().toString(), name: tagName.trim() };
      const updatedTags = [...allTags, newTagObj];
      await AsyncStorage.setItem("paperpal_tags", JSON.stringify(updatedTags));
      setAllTags(updatedTags);
      setNewTag("");
      
      // Add to current entry tags if not already included
      if (!tags.includes(tagName.trim())) {
        setTags([...tags, tagName.trim()]);
        setUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error saving tag:", error);
      Alert.alert("Error", "Failed to save tag.");
    }
  };

  // Toggle a tag selection
  const toggleTag = (tagName: string) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter(t => t !== tagName));
    } else {
      setTags([...tags, tagName]);
    }
    setUnsavedChanges(true);
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to add your current location.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const addressStr = address 
        ? `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`
        : "Unknown location";
      
      setLocation({
        latitude,
        longitude,
        address: addressStr
      });
      
      // Get weather data for the location
      fetchWeatherData(latitude, longitude);
      
      setUnsavedChanges(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your current location.");
    }
  };

  // Fetch weather data
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      // This would normally use a real weather API
      // For demo purposes, we'll use mock data
      const mockWeatherData = {
        temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
        condition: ["Sunny", "Cloudy", "Rainy", "Stormy", "Snowy"][Math.floor(Math.random() * 5)],
        humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
      };
      
      setWeather(mockWeatherData);
      setUnsavedChanges(true);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  // Pick images from gallery
  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera roll permission is required to add images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        const newImages = [...images];
        result.assets.forEach(asset => {
          if (newImages.length < 10) { // Limit to 10 images
            newImages.push(asset.uri);
          }
        });
        setImages(newImages);
        setUnsavedChanges(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images.");
    }
  };

  // Take a photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, result.assets[0].uri]);
        setUnsavedChanges(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    setUnsavedChanges(true);
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      
      if (uri) {
        setAudioRecording(uri);
        setUnsavedChanges(true);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Failed to save recording.");
    }
  };

  const playSound = async () => {
    if (!audioRecording) return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioRecording },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
      Alert.alert("Error", "Failed to play recording.");
    }
  };

  const stopSound = async () => {
    if (!sound) return;
    
    try {
      await sound.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
        playbackTimer.current = null;
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 0);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        if (playbackTimer.current) {
          clearInterval(playbackTimer.current);
          playbackTimer.current = null;
        }
      }
    }
  };

  const deleteRecording = () => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this audio recording?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setAudioRecording(null);
            setUnsavedChanges(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
      ]
    );
  };

  // Format time for audio player
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Share entry
  const shareEntry = async () => {
    try {
      let shareContent = `${title}\n\n${content}\n\nMood: ${mood}\nCategory: ${category}`;
      
      if (location?.address) {
        shareContent += `\nLocation: ${location.address}`;
      }
      
      if (weather) {
        shareContent += `\nWeather: ${weather.temperature}°C, ${weather.condition}`;
      }
      
      if (tags.length > 0) {
        shareContent += `\nTags: ${tags.join(', ')}`;
      }
      
      await Share.share({
        message: shareContent,
        title: "My Diary Entry"
      });
    } catch (error) {
      console.error("Error sharing entry:", error);
      Alert.alert("Error", "Failed to share entry.");
    }
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setUnsavedChanges(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Toggle private status
  const togglePrivate = () => {
    setIsPrivate(!isPrivate);
    setUnsavedChanges(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Save entry
  const handleSave = async () => {
    if (!validateEntry()) return;

    const currentDate = new Date();
    const updatedEntry: DiaryEntry = {
      id: entry?.id || Date.now(),
      date: entry?.date || currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      title,
      content,
      mood,
      category,
      location,
      images,
      audioRecording,
      weather,
      tags,
      isPrivate,
      isFavorite,
      lastEdited: currentDate.toISOString(),
      reminderDate,
    };

    try {
      const entriesJSON = await AsyncStorage.getItem("paperpal_entries");
      let entries: DiaryEntry[] = entriesJSON ? JSON.parse(entriesJSON) : [];
      
      if (entry?.id) {
        const index = entries.findIndex((e) => e.id === entry.id);
        if (index !== -1) {
          entries[index] = updatedEntry;
        } else {
          entries.push(updatedEntry);
        }
      } else {
        entries.push(updatedEntry);
      }
      
      await AsyncStorage.setItem("paperpal_entries", JSON.stringify(entries));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Entry saved successfully!");
      
      setIsEditing(false);
      setUnsavedChanges(false);
      
      // If this was a new entry, navigate back to home
      if (isNew) {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      Alert.alert("Error", "Failed to save entry.");
    }
  };

  // Delete entry
  const handleDelete = async () => {
    try {
      const entriesJSON = await AsyncStorage.getItem("paperpal_entries");
      let entries: DiaryEntry[] = entriesJSON ? JSON.parse(entriesJSON) : [];
      entries = entries.filter((e) => e.id !== entry?.id);
      await AsyncStorage.setItem("paperpal_entries", JSON.stringify(entries));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Success", "Entry deleted successfully!");
      
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error deleting entry:", error);
      Alert.alert("Error", "Failed to delete entry.");
    }
  };

  // Get mood icon
  const getMoodIcon = (moodValue: string) => {
    const option = moodOptions.find(opt => opt.value === moodValue);
    return option ? option.icon : <Smile color="#5E4B3E" size={24} />;
  };

  // Handle back button
  const handleBackPress = () => {
    if (unsavedChanges) {
      setShowUnsavedChangesAlert(true);
    } else {
      navigation.goBack();
    }
  };

  // Animation effects - FIXED to avoid the height animation error
  useEffect(() => {
    // These animations can use native driver
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // For the header height, we need to use a separate animation without native driver
    scrollY.addListener(({ value }) => {
      const newHeight = Math.max(80, 200 - value);
      headerHeight.setValue(newHeight);
    });

    return () => {
      scrollY.removeAllListeners();
    };
  }, []);

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  // Clean up audio resources
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    };
  }, [recording, sound]);

  // Handle navigation events
  useFocusEffect(
    React.useCallback(() => {
      // When screen gains focus
      return () => {
        // When screen loses focus
        if (unsavedChanges) {
          setShowUnsavedChangesAlert(true);
        }
      };
    }, [unsavedChanges])
  );

  // If no entry and not creating a new one, show error
  if (!entry && !isNew) {
    Alert.alert("Error", "No diary entry found.", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Home"),
      },
    ]);
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ImageBackground
          source={{ uri: "https://www.transparenttextures.com/patterns/old-paper.png" }}
          style={styles.container}
        >
          <View style={styles.overlay} />
          
          {/* Header - FIXED to avoid the height animation error */}
          <Animated.View 
            style={[
              styles.animatedHeader,
              {
                height: headerHeight, // This will be updated via setValue, not through native driver
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(245, 240, 230, 0.9)', 'rgba(245, 240, 230, 0.7)']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={handleBackPress}
                >
                  <ChevronLeft color="#5E4B3E" size={24} />
                </TouchableOpacity>
                
                <View style={styles.headerTitleContainer}>
                  {!isEditing ? (
                    <Text style={styles.headerTitle} numberOfLines={1}>
                      {title || "New Entry"}
                    </Text>
                  ) : (
                    <Text style={styles.headerEditingTitle}>
                      {isNew ? "New Entry" : "Edit Entry"}
                    </Text>
                  )}
                </View>
                
                <View style={styles.headerActions}>
                  {!isEditing && (
                    <>
                      <TouchableOpacity 
                        style={styles.headerActionButton} 
                        onPress={shareEntry}
                      >
                        <Share2 color="#5E4B3E" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.headerActionButton} 
                        onPress={toggleFavorite}
                      >
                        <Heart 
                          color="#5E4B3E" 
                          size={20} 
                          fill={isFavorite ? "#5E4B3E" : "transparent"} 
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              
              {!isEditing && (
                <View style={styles.headerMetadata}>
                  <View style={styles.metadataItem}>
                    <Calendar color="#8D7B6A" size={16} />
                    <Text style={styles.metadataText}>
                      {entry?.date || new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  {entry?.lastEdited && (
                    <View style={styles.metadataItem}>
                      <Clock color="#8D7B6A" size={16} />
                      <Text style={styles.metadataText}>
                        Edited: {new Date(entry.lastEdited).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </LinearGradient>
          </Animated.View>
          
          {/* Main Content - FIXED to avoid the height animation error */}
          <Animated.ScrollView
            ref={scrollViewRef}
            style={[styles.scrollContainer, { opacity: fadeAnim }]}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false } // Must be false for non-native driver animations
            )}
          >
            <View style={styles.contentContainer}>
              {/* Mood Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Mood</Text>
                {isEditing ? (
                  <View style={styles.moodPicker}>
                    {moodOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.moodOption,
                          mood === option.value && styles.moodOptionActive
                        ]}
                        onPress={() => {
                          setMood(option.value);
                          setUnsavedChanges(true);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        {option.icon}
                        <Text style={[
                          styles.moodOptionText,
                          mood === option.value && styles.moodOptionTextActive
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.moodDisplay}>
                    <View style={styles.moodIconContainer}>
                      {getMoodIcon(mood)}
                    </View>
                    <Text style={styles.moodText}>
                      {moodOptions.find(m => m.value === mood)?.label || "Happy"}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Title Section */}
              <View style={styles.sectionContainer}>
                {isEditing ? (
                  <TextInput
                    ref={titleInputRef}
                    style={styles.titleInput}
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      setUnsavedChanges(true);
                    }}
                    placeholder="Enter title"
                    placeholderTextColor="#A89B8C"
                    maxLength={100}
                  />
                ) : (
                  <Text style={styles.titleText}>{title}</Text>
                )}
              </View>
              
              {/* Category Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Category</Text>
                {isEditing ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryPicker}
                  >
                    {categoryOptions.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryOption,
                          category === cat && styles.categoryOptionActive
                        ]}
                        onPress={() => {
                          setCategory(cat);
                          setUnsavedChanges(true);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={[
                          styles.categoryOptionText,
                          category === cat && styles.categoryOptionActive
                        ]}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Tags Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  {isEditing && (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => setShowTagModal(true)}
                    >
                      <Tag color="#5E4B3E" size={16} />
                      <Text style={styles.addButtonText}>Manage Tags</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {tags.length > 0 ? (
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                      <View key={index} style={styles.tagItem}>
                        <Text style={styles.tagText}>{tag}</Text>
                        {isEditing && (
                          <TouchableOpacity
                            onPress={() => {
                              setTags(tags.filter((_, i) => i !== index));
                              setUnsavedChanges(true);
                            }}
                          >
                            <X color="#5E4B3E" size={14} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No tags added</Text>
                )}
              </View>
              
              {/* Location Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  {isEditing && (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={getCurrentLocation}
                    >
                      <MapPin color="#5E4B3E" size={16} />
                      <Text style={styles.addButtonText}>Add Location</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {location ? (
                  <View style={styles.locationContainer}>
                    <MapPin color="#5E4B3E" size={18} />
                    <Text style={styles.locationText}>{location.address}</Text>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={() => {
                          setLocation(null);
                          setUnsavedChanges(true);
                        }}
                      >
                        <X color="#5E4B3E" size={18} />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No location added</Text>
                )}
              </View>
              
              {/* Weather Section */}
              {weather && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Weather</Text>
                  <View style={styles.weatherContainer}>
                    <Text style={styles.weatherText}>
                      {weather.temperature}°C, {weather.condition}
                    </Text>
                    <Text style={styles.weatherSubtext}>
                      Humidity: {weather.humidity}%
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Images Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Images</Text>
                  {isEditing && (
                    <View style={styles.imageActions}>
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={pickImages}
                      >
                        <ImageIcon color="#5E4B3E" size={16} />
                        <Text style={styles.addButtonText}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={takePhoto}
                      >
                        <Camera color="#5E4B3E" size={16} />
                        <Text style={styles.addButtonText}>Camera</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                {images.length > 0 ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imagesContainer}
                  >
                    {images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageContainer}
                        onPress={() => {
                          setSelectedImageIndex(index);
                          setShowImageModal(true);
                        }}
                      >
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                        {isEditing && (
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => removeImage(index)}
                          >
                            <X color="#FFF" size={16} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyText}>No images added</Text>
                )}
              </View>
              
              {/* Audio Recording Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Audio Note</Text>
                  {isEditing && !audioRecording && !isRecording && (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={startRecording}
                    >
                      <Text style={styles.addButtonText}>Record Audio</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {isRecording ? (
                  <View style={styles.recordingContainer}>
                    <Text style={styles.recordingText}>Recording...</Text>
                    <TouchableOpacity 
                      style={styles.stopRecordingButton}
                      onPress={stopRecording}
                    >
                      <Text style={styles.stopRecordingText}>Stop</Text>
                    </TouchableOpacity>
                  </View>
                ) : audioRecording ? (
                  <View style={styles.audioPlayerContainer}>
                    <View style={styles.audioControls}>
                      <TouchableOpacity
                        style={styles.audioButton}
                        onPress={isPlaying ? stopSound : playSound}
                      >
                        <Text style={styles.audioButtonText}>
                          {isPlaying ? "Stop" : "Play"}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.audioProgressContainer}>
                        <View 
                          style={[
                            styles.audioProgressBar, 
                            { 
                              width: `${playbackDuration > 0 
                                ? (playbackPosition / playbackDuration) * 100 
                                : 0}%` 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.audioTimeText}>
                        {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
                      </Text>
                    </View>
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.deleteAudioButton}
                        onPress={deleteRecording}
                      >
                        <Trash2 color="#5E4B3E" size={16} />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No audio recording</Text>
                )}
              </View>
              
              {/* Content Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Content</Text>
                {isEditing ? (
                  <TextInput
                    ref={contentInputRef}
                    style={styles.contentInput}
                    value={content}
                    onChangeText={(text) => {
                      setContent(text);
                      setUnsavedChanges(true);
                    }}
                    placeholder="Write your entry..."
                    placeholderTextColor="#A89B8C"
                    multiline
                    textAlignVertical="top"
                  />
                ) : (
                  <Text style={styles.contentText}>{content}</Text>
                )}
              </View>
              
              {/* Privacy Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.privacyContainer}>
                  <TouchableOpacity 
                    style={styles.privacyButton}
                    onPress={togglePrivate}
                    disabled={!isEditing}
                  >
                    {isPrivate ? (
                      <>
                        <Lock color="#5E4B3E" size={20} />
                        <Text style={styles.privacyText}>Private Entry</Text>
                      </>
                    ) : (
                      <>
                        <Unlock color="#5E4B3E" size={20} />
                        <Text style={styles.privacyText}>Public Entry</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.saveButton]}
                      onPress={handleSave}
                    >
                      <Save color="#FFF" size={20} />
                      <Text style={styles.saveButtonText}>Save Entry</Text>
                    </TouchableOpacity>
                    {!isNew && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => setShowDeleteConfirmation(true)}
                      >
                        <Trash2 color="#5E4B3E" size={20} />
                        <Text style={styles.actionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Edit3 color="#FFF" size={20} />
                    <Text style={styles.editButtonText}>Edit Entry</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Bottom Spacing */}
              <View style={{ height: 100 }} />
            </View>
          </Animated.ScrollView>
          
          {/* Tag Modal */}
          <Modal
            visible={showTagModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTagModal(false)}
          >
            <BlurView intensity={10} style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Manage Tags</Text>
                  <TouchableOpacity onPress={() => setShowTagModal(false)}>
                    <X color="#5E4B3E" size={24} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={styles.tagInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add new tag"
                    placeholderTextColor="#A89B8C"
                  />
                  <TouchableOpacity 
                    style={styles.addTagButton}
                    onPress={() => saveTag(newTag)}
                  >
                    <Plus color="#FFF" size={20} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalSectionTitle}>Available Tags</Text>
                <FlatList
                  data={allTags}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.tagSelectItem,
                        tags.includes(item.name) && styles.tagSelectItemActive
                      ]}
                      onPress={() => toggleTag(item.name)}
                    >
                      <Text style={[
                        styles.tagSelectText,
                        tags.includes(item.name) && styles.tagSelectTextActive
                      ]}>
                        {item.name}
                      </Text>
                      {tags.includes(item.name) && (
                        <View style={styles.tagSelectedIcon}>
                          <Check color="#FFF" size={16} />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No tags available</Text>
                  }
                />
                
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowTagModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Modal>
          
          {/* Image Modal */}
          <Modal
            visible={showImageModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowImageModal(false)}
          >
            <View style={styles.imageModalContainer}>
              <TouchableOpacity 
                style={styles.imageModalCloseButton}
                onPress={() => setShowImageModal(false)}
              >
                <X color="#FFF" size={24} />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: images[selectedImageIndex] }} 
                style={styles.fullSizeImage}
                resizeMode="contain"
              />
              
              {images.length > 1 && (
                <View style={styles.imageIndicators}>
                  {images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.imageIndicator,
                        index === selectedImageIndex && styles.imageIndicatorActive
                      ]}
                      onPress={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </View>
              )}
            </View>
          </Modal>
          
          {/* Delete Confirmation Modal */}
          <Modal
            visible={showDeleteConfirmation}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDeleteConfirmation(false)}
          >
            <BlurView intensity={10} style={styles.modalOverlay}>
              <View style={styles.confirmationModal}>
                <AlertTriangle color="#E74C3C" size={40} />
                <Text style={styles.confirmationTitle}>Delete Entry?</Text>
                <Text style={styles.confirmationText}>
                  This action cannot be undone. Are you sure you want to delete this entry?
                </Text>
                
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowDeleteConfirmation(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.confirmDeleteButton}
                    onPress={() => {
                      setShowDeleteConfirmation(false);
                      handleDelete();
                    }}
                  >
                    <Text style={styles.confirmDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Modal>
          
          {/* Unsaved Changes Alert */}
          <Modal
            visible={showUnsavedChangesAlert}
            transparent
            animationType="fade"
            onRequestClose={() => setShowUnsavedChangesAlert(false)}
          >
            <BlurView intensity={10} style={styles.modalOverlay}>
              <View style={styles.confirmationModal}>
                <AlertTriangle color="#F39C12" size={40} />
                <Text style={styles.confirmationTitle}>Unsaved Changes</Text>
                <Text style={styles.confirmationText}>
                  You have unsaved changes. Do you want to save before leaving?
                </Text>
                
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity 
                    style={styles.discardButton}
                    onPress={() => {
                      setShowUnsavedChangesAlert(false);
                      setUnsavedChanges(false);
                      navigation.goBack();
                    }}
                  >
                    <Text style={styles.discardButtonText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveChangesButton}
                    onPress={() => {
                      setShowUnsavedChangesAlert(false);
                      handleSave();
                    }}
                  >
                    <Text style={styles.saveChangesText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Modal>
        </ImageBackground>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

// Missing component for the check icon
const Check = ({ color, size }: { color: string; size: number }) => {
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ 
        width: size * 0.6, 
        height: size * 0.3, 
        borderLeftWidth: 2, 
        borderBottomWidth: 2, 
        borderColor: color,
        transform: [{ rotate: '-45deg' }],
        position: 'absolute',
        bottom: size * 0.35,
        left: size * 0.2
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E6",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245, 240, 230, 0.7)",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  headerEditingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8D7B6A",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  headerMetadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 14,
    color: "#8D7B6A",
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontStyle: "italic",
  },
  scrollContainer: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 120 : 100,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8D7B6A",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8DFD0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  addButtonText: {
    fontSize: 14,
    color: "#5E4B3E",
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  moodPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moodOption: {
    width: (Dimensions.get("window").width - 80) / 4,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F9F6F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
    padding: 8,
  },
  moodOptionActive: {
    backgroundColor: "#8D7B6A",
  },
  moodOptionText: {
    fontSize: 12,
    color: "#5E4B3E",
    marginTop: 4,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  moodOptionTextActive: {
    color: "#F9F6F0",
  },
  moodDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9CAB9",
    marginRight: 12,
  },
  moodText: {
    fontSize: 18,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  categoryPicker: {
    paddingVertical: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F9F6F0",
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  categoryOptionActive: {
    backgroundColor: "#8D7B6A",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  categoryOptionTextActive: {
    color: "#F9F6F0",
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E8DFD0",
    borderRadius: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  categoryText: {
    fontSize: 14,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  tagText: {
    fontSize: 14,
    color: "#5E4B3E",
    marginRight: 6,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  emptyText: {
    fontSize: 14,
    color: "#A89B8C",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#5E4B3E",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  weatherContainer: {
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  weatherText: {
    fontSize: 16,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  weatherSubtext: {
    fontSize: 14,
    color: "#8D7B6A",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  imageActions: {
    flexDirection: "row",
  },
  imagesContainer: {
    paddingVertical: 8,
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  recordingText: {
    fontSize: 16,
    color: "#E74C3C",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  stopRecordingButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  stopRecordingText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  audioPlayerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  audioControls: {
    flex: 1,
  },
  audioButton: {
    backgroundColor: "#8D7B6A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  audioButtonText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  audioProgressContainer: {
    height: 4,
    backgroundColor: "#D9CAB9",
    borderRadius: 2,
    marginBottom: 8,
  },
  audioProgressBar: {
    height: "100%",
    backgroundColor: "#8D7B6A",
  },
  audioTimeText: {
    fontSize: 12,
    color: "#8D7B6A",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  deleteAudioButton: {
    padding: 8,
  },
  contentInput: {
    fontSize: 16,
    color: "#5E4B3E",
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D9CAB9",
    minHeight: 200,
    textAlignVertical: "top",
  },
  contentText: {
    fontSize: 16,
    color: "#5E4B3E",
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  privacyContainer: {
    alignItems: "center",
  },
  privacyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  privacyText: {
    fontSize: 14,
    color: "#5E4B3E",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#8D7B6A",
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 8,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  deleteButton: {
    backgroundColor: "#F9F6F0",
    borderWidth: 1,
    borderColor: "#D9CAB9",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#8D7B6A",
  },
  editButtonText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 8,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#5E4B3E",
    marginLeft: 8,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#F5F0E6",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8D7B6A",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
    fontSize: 16,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    marginRight: 8,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8D7B6A",
    alignItems: "center",
    justifyContent: "center",
  },
  tagSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  tagSelectItemActive: {
    backgroundColor: "#E8DFD0",
  },
  tagSelectText: {
    fontSize: 16,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  tagSelectTextActive: {
    fontWeight: "600",
  },
  tagSelectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8D7B6A",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButton: {
    backgroundColor: "#8D7B6A",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalCloseButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  fullSizeImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
  },
  imageIndicators: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  imageIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  imageIndicatorActive: {
    backgroundColor: "#FFF",
  },
  confirmationModal: {
    width: "80%",
    backgroundColor: "#F5F0E6",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5E4B3E",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  confirmationText: {
    fontSize: 16,
    color: "#8D7B6A",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F9F6F0",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#5E4B3E",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmDeleteText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  discardButton: {
    flex: 1,
    backgroundColor: "#F9F6F0",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  discardButtonText: {
    fontSize: 16,
    color: "#5E4B3E",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  saveChangesButton: {
    flex: 1,
    backgroundColor: "#8D7B6A",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginLeft: 8,
  },
  saveChangesText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
});

export default DetailsScreen;