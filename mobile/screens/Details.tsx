import React, { useState } from "react";
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
} from "react-native";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { Smile, Sun, Cloud, CloudRain, Save, Trash2 } from "lucide-react-native";

// Updated RootStackParamList (removed Dashboard)
type RootStackParamList = {
  SplashScreen: undefined;
  Login: undefined;
  Register: undefined;
  Details: { entry: DiaryEntry };
  Profile: undefined;
};

type DiaryEntry = {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  category: string;
};

type DetailsScreenRouteProp = RouteProp<RootStackParamList, "Details">;
type DetailsScreenNavigationProp = NavigationProp<RootStackParamList>;

interface DetailsScreenProps {
  route: DetailsScreenRouteProp;
  navigation: DetailsScreenNavigationProp;
}

const DetailsScreen: React.FC<DetailsScreenProps> = ({ route, navigation }) => {
  // Check if route.params and entry exist
  const entry = route.params?.entry;

  // If entry is undefined, show an error and redirect to Profile
  if (!entry) {
    Alert.alert("Error", "No diary entry found.", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Profile"),
      },
    ]);
    return null; // Render nothing while redirecting
  }

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [mood, setMood] = useState(entry.mood);
  const [category, setCategory] = useState(entry.category);

  const moodOptions = [
    { label: "Happy", value: "happy", icon: <Smile color="#5E4B3E" size={20} /> },
    { label: "Excited", value: "excited", icon: <Sun color="#5E4B3E" size={20} /> },
    { label: "Calm", value: "calm", icon: <Cloud color="#5E4B3E" size={20} /> },
    { label: "Sad", value: "sad", icon: <CloudRain color="#5E4B3E" size={20} /> },
  ];

  const categoryOptions = ["daily", "books", "travel", "food", "weather"];

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Title and content cannot be empty.");
      return;
    }

    const updatedEntry: DiaryEntry = {
      ...entry,
      title,
      content,
      mood,
      category,
    };

    // Mock save action (in a real app, this would update a database or state management)
    console.log("Saving entry:", updatedEntry);
    Alert.alert("Success", "Entry saved successfully!");
    setIsEditing(false);
    navigation.navigate("Profile"); // Changed to Profile
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Mock delete action (in a real app, this would remove from a database or state)
            console.log("Deleting entry:", entry.id);
            Alert.alert("Success", "Entry deleted successfully!");
            navigation.navigate("Profile"); // Changed to Profile
          },
        },
      ]
    );
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return <Smile color="#5E4B3E" size={20} />;
      case "excited":
        return <Sun color="#5E4B3E" size={20} />;
      case "calm":
        return <Cloud color="#5E4B3E" size={20} />;
      case "sad":
        return <CloudRain color="#5E4B3E" size={20} />;
      default:
        return <Smile color="#5E4B3E" size={20} />;
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://www.transparenttextures.com/patterns/old-paper.png" }}
      style={styles.container}
    >
      <View style={styles.overlay} />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{entry.date}</Text>
          <View style={styles.moodContainer}>
            {isEditing ? (
              <View style={styles.moodPicker}>
                {moodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.moodOption, mood === option.value && styles.moodOptionActive]}
                    onPress={() => setMood(option.value)}
                  >
                    {option.icon}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              getMoodIcon(mood)
            )}
          </View>
        </View>

        {/* Title */}
        {isEditing ? (
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
            placeholderTextColor="#A89B8C"
          />
        ) : (
          <Text style={styles.titleText}>{title}</Text>
        )}

        {/* Category */}
        <View style={styles.categoryContainer}>
          {isEditing ? (
            <View style={styles.categoryPicker}>
              {categoryOptions.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextActive,
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        {isEditing ? (
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Write your entry..."
            placeholderTextColor="#A89B8C"
            multiline
            textAlignVertical="top"
          />
        ) : (
          <Text style={styles.contentText}>{content}</Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <Save color="#5E4B3E" size={20} />
            <Text style={styles.actionButtonText}>{isEditing ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
              <Trash2 color="#5E4B3E" size={20} />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#8D7B6A",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontStyle: "italic",
  },
  moodContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  moodPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moodOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9F6F0",
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  moodOptionActive: {
    backgroundColor: "#8D7B6A",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5E4B3E",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5E4B3E",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    backgroundColor: "#F9F6F0",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E8DFD0",
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  categoryText: {
    fontSize: 14,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  contentText: {
    fontSize: 16,
    color: "#5E4B3E",
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  contentInput: {
    fontSize: 16,
    color: "#5E4B3E",
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    backgroundColor: "#F9F6F0",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
    minHeight: 200,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
    width: "45%",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#E8DFD0",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#5E4B3E",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontWeight: "600",
  },
});

export default DetailsScreen;