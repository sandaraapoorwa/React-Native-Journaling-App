"use client"

import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Platform,
  Dimensions,
  Image,
} from "react-native"
import {
  BookOpen,
  Calendar,
  Search,
  PlusCircle,
  ChevronRight,
  User,
  Settings,
  Sun,
  Cloud,
  CloudRain,
  Smile,
} from "lucide-react-native"

const { width } = Dimensions.get("window")

// Mock data for diary entries
const diaryEntries = [
  {
    id: 1,
    date: "April 10, 2025",
    title: "Morning Reflections",
    preview: "Today I woke up feeling refreshed. The birds were singing outside my window...",
    mood: "happy",
    category: "daily",
  },
  {
    id: 2,
    date: "April 8, 2025",
    title: "New Book Discovery",
    preview: "Found an amazing vintage bookstore downtown. The owner recommended...",
    mood: "excited",
    category: "books",
  },
  {
    id: 3,
    date: "April 5, 2025",
    title: "Rainy Day Thoughts",
    preview: "The rain hasn't stopped all day. I made some tea and sat by the window...",
    mood: "calm",
    category: "weather",
  },
]

// Mock data for mood tracking
const moodData = [
  { day: "Mon", mood: "happy" },
  { day: "Tue", mood: "happy" },
  { day: "Wed", mood: "calm" },
  { day: "Thu", mood: "sad" },
  { day: "Fri", mood: "excited" },
  { day: "Sat", mood: "calm" },
  { day: "Sun", mood: "happy" },
]

export default function DashboardScreen({ navigation }: any) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Get current date in a nice format
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return <Smile color="#5E4B3E" size={20} />
      case "excited":
        return <Sun color="#5E4B3E" size={20} />
      case "calm":
        return <Cloud color="#5E4B3E" size={20} />
      case "sad":
        return <CloudRain color="#5E4B3E" size={20} />
      default:
        return <Smile color="#5E4B3E" size={20} />
    }
  }

  return (
    <ImageBackground
      source={{ uri: "https://www.transparenttextures.com/patterns/old-paper.png" }}
      style={styles.container}
    >
      <View style={styles.overlay} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <BookOpen color="#5E4B3E" size={20} />
          </View>
          <Text style={styles.headerTitle}>PaperPal</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Settings color="#5E4B3E" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <User color="#5E4B3E" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, Emma</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#8D7B6A" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your entries..."
            placeholderTextColor="#A89B8C"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Add Entry */}
        <TouchableOpacity style={styles.quickAddContainer}>
          <View style={styles.quickAddContent}>
            <PlusCircle color="#5E4B3E" size={24} />
            <Text style={styles.quickAddText}>Write a new entry</Text>
          </View>
          <View style={styles.decorativeLine} />
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {["all", "daily", "books", "travel", "food", "weather"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryButton, activeCategory === category && styles.categoryButtonActive]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[styles.categoryButtonText, activeCategory === category && styles.categoryButtonTextActive]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Entries */}
        <View style={styles.entriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight color="#8D7B6A" size={16} />
            </TouchableOpacity>
          </View>

          {diaryEntries.map((entry) => (
            <TouchableOpacity key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <View style={styles.entryMood}>{getMoodIcon(entry.mood)}</View>
              </View>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryPreview}>{entry.preview}</Text>
              <View style={styles.entryFooter}>
                <View style={styles.entryCategory}>
                  <Text style={styles.entryCategoryText}>{entry.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mood Tracker */}
        <View style={styles.moodTrackerContainer}>
          <Text style={styles.sectionTitle}>Weekly Mood</Text>
          <View style={styles.moodTrackerChart}>
            {moodData.map((item, index) => (
              <View key={index} style={styles.moodColumn}>
                <View style={[styles.moodIndicator, styles[`mood${item.mood}`]]}>{getMoodIcon(item.mood)}</View>
                <Text style={styles.moodDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Journal Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Days Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendar</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Calendar color="#8D7B6A" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarPreview}>
            <Text style={styles.calendarText}>April 2025</Text>
            <Image
              source={{ uri: "https://via.placeholder.com/300x150/f5f0e6/5e4b3e?text=Calendar+Preview" }}
              style={styles.calendarImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <BookOpen color="#5E4B3E" size={24} />
          <Text style={styles.navButtonText}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.navButtonAdd]}>
          <PlusCircle color="#F5F0E6" size={32} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Calendar color="#8D7B6A" size={24} />
          <Text style={styles.navButtonText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E6",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245, 240, 230, 0.7)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(169, 150, 113, 0.3)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9B8A8",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5E4B3E",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#C9B8A8",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  dateText: {
    fontSize: 14,
    color: "#8D7B6A",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontStyle: "italic",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: "#5E4B3E",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  quickAddContainer: {
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  quickAddContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickAddText: {
    fontSize: 16,
    color: "#5E4B3E",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontWeight: "600",
  },
  decorativeLine: {
    height: 1,
    backgroundColor: "#D9CAB9",
    width: "80%",
    alignSelf: "center",
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5E4B3E",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  categoriesScroll: {
    flexDirection: "row",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F9F6F0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  categoryButtonActive: {
    backgroundColor: "#8D7B6A",
  },
  categoryButtonText: {
    color: "#5E4B3E",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  categoryButtonTextActive: {
    color: "#F9F6F0",
  },
  entriesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#8D7B6A",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  entryCard: {
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: "#8D7B6A",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontStyle: "italic",
  },
  entryMood: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E8DFD0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5E4B3E",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  entryPreview: {
    fontSize: 14,
    color: "#5E4B3E",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  entryFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  entryCategory: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#E8DFD0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  entryCategoryText: {
    fontSize: 12,
    color: "#5E4B3E",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  moodTrackerContainer: {
    marginBottom: 24,
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  moodTrackerChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  moodColumn: {
    alignItems: "center",
    justifyContent: "center",
    width: (width - 64) / 7,
  },
  moodIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  moodhappy: {
    backgroundColor: "#E8DFD0",
  },
  moodexcited: {
    backgroundColor: "#F0E6D8",
  },
  moodcalm: {
    backgroundColor: "#E0D8C9",
  },
  moodsad: {
    backgroundColor: "#D8D0C0",
  },
  moodDay: {
    fontSize: 12,
    color: "#8D7B6A",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 16,
    width: (width - 48) / 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5E4B3E",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  statLabel: {
    fontSize: 12,
    color: "#8D7B6A",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarPreview: {
    backgroundColor: "#F9F6F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9CAB9",
  },
  calendarText: {
    fontSize: 16,
    color: "#5E4B3E",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
    fontWeight: "600",
  },
  calendarImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F9F6F0",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(169, 150, 113, 0.3)",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  navButtonAdd: {
    backgroundColor: "#8D7B6A",
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -20,
    borderWidth: 4,
    borderColor: "#F9F6F0",
  },
  navButtonText: {
    fontSize: 12,
    color: "#8D7B6A",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Baskerville" : "serif",
  },
})
