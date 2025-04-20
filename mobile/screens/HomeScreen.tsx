import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Plus } from "lucide-react-native";

// RootStackParamList
type RootStackParamList = {
  SplashScreen: undefined;
  Login: undefined;
  Register: undefined;
  Details: { entry: DiaryEntry };
  Profile: undefined;
  Home: undefined;
};

type DiaryEntry = {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  category: string;
};

type HomeScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entriesJSON = await AsyncStorage.getItem("paperpal_entries");
        const loadedEntries: DiaryEntry[] = entriesJSON ? JSON.parse(entriesJSON) : [];
        setEntries(loadedEntries);
      } catch (error) {
        console.error("Error loading entries:", error);
      }
    };
    loadEntries();
  }, []);

  const handleCreateEntry = () => {
    const newEntry: DiaryEntry = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      title: "New Entry",
      content: "",
      mood: "happy",
      category: "daily",
    };
    navigation.navigate("Details", { entry: newEntry });
  };

  const renderEntry = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigation.navigate("Details", { entry: item })}
    >
      <Text style={styles.entryTitle}>{item.title}</Text>
      <Text style={styles.entryDate}>{item.date}</Text>
      <Text style={styles.entryCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Diary Entries</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateEntry}>
          <Plus color="#F5F0E6" size={20} />
          <Text style={styles.createButtonText}>New Entry</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#D9CAB9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8D7B6A",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7A6A5A",
  },
  createButtonText: {
    color: "#F5F0E6",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  entryCard: {
    backgroundColor: "#F9F6F0",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  entryDate: {
    fontSize: 14,
    color: "#8D7B6A",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  entryCategory: {
    fontSize: 14,
    color: "#8D7B6A",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  emptyText: {
    fontSize: 16,
    color: "#8D7B6A",
    textAlign: "center",
    marginTop: 20,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default HomeScreen;