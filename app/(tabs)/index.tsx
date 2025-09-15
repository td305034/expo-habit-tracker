import {
  client,
  databases,
  DB_ID,
  HABITS_TABLE_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Card, Text } from "@ui-kitten/components";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";

export default function IndexScreen() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (user) {
      const channel = `databases.${DB_ID}.collections.${HABITS_TABLE_ID}.documents`;
      const habitsSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          }
        }
      );
      fetchHabits();

      return () => {
        habitsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, HABITS_TABLE_ID, [
        Query.equal("user_id", user?.$id ?? ""),
      ]);
      setHabits(response.documents as unknown as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DB_ID, HABITS_TABLE_ID, id);
    } catch (error) {
      console.error(error);
    } finally {
      fetchHabits();
    }
  };
  const handleCompleteHabit = async (id: string) => {};
  const renderLeftActions = () => {
    return (
      <View style={styles.swipeActionRight}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={32}
          color={"#fff"}
        ></MaterialCommunityIcons>
      </View>
    );
  };
  const renderRightActions = () => {
    return (
      <View style={styles.swipeActionLeft}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#fff"}
        ></MaterialCommunityIcons>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text category="h3" style={styles.title}>
          Today's habits
        </Text>
        <Button appearance="ghost" onPress={signOut}>
          Sign out
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No habits for today.</Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              onSwipeableOpen={(direction) => {
                direction == "right"
                  ? handleCompleteHabit(habit.$id)
                  : handleDeleteHabit(habit.$id);
                swipeableRefs.current[habit.$id]?.close();
              }}
            >
              <Card style={styles.card}>
                <View style={styles.cardView}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDesc}>{habit.description}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color="orange"
                      />
                      <Text style={styles.streakText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>
                    <View style={styles.freqBadge}>
                      <Text style={styles.freqText}>{habit.frequency}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 12,
    paddingHorizontal: 0,
    borderRadius: 12,
    backgroundColor: "#e6eeff",

    //elevation for web (and iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    //elevation for android
    elevation: 5,
  },
  cardView: {
    marginHorizontal: -8,
    marginVertical: -4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 16,
    marginBottom: 24,
    color: "#555",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 1,
  },
  streakText: {
    marginLeft: 6,
    color: "#be7200ff",
  },
  freqBadge: {
    backgroundColor: "#bbd0ffff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    elevation: 1,
    justifyContent: "center",
  },
  freqText: {
    color: "#2b5dc7ff",
    textTransform: "capitalize",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666",
  },
  swipeActionLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    borderRadius: 18,
    marginBottom: 12,
    marginTop: 2,
    paddingRight: 16,
    backgroundColor: "#4caf50",
  },
  swipeActionRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: 18,
    marginBottom: 12,
    marginTop: 2,
    paddingLeft: 16,
    backgroundColor: "#e53935",
  },
});
