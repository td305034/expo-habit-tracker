import {
  client,
  databases,
  DB_ID,
  HABITS_COMPLETION_TABLE_ID,
  HABITS_TABLE_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Card, Text } from "@ui-kitten/components";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";

export default function IndexScreen() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completions, setCompletions] = useState<string[]>([""]);

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DB_ID}.collections.${HABITS_TABLE_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          }
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionsChannel = `databases.${DB_ID}.collections.${HABITS_COMPLETION_TABLE_ID}.documents`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchTodaysCompletions();
          }
        }
      );
      fetchHabits();
      fetchTodaysCompletions();

      return () => {
        habitsSubscription();
        completionsSubscription();
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
  const fetchTodaysCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await databases.listDocuments(
        DB_ID,
        HABITS_COMPLETION_TABLE_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      const completedHabits = response.documents;
      setCompletions(completedHabits.map((c) => c.habit_id));
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
  const handleCompleteHabit = async (id: string) => {
    if (!user || completions.includes(id)) return;
    try {
      const currentDate = new Date().toISOString();
      await databases.createDocument(
        DB_ID,
        HABITS_COMPLETION_TABLE_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user.$id,
          completed_at: currentDate,
        }
      );

      const habit = habits?.find((h) => h.$id === id);
      if (!habit) return;

      await databases.updateDocument(DB_ID, HABITS_TABLE_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      });
    } catch (error) {
      console.error(error);
    }
  };

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
  const renderRightActions = (habitId: string) => {
    return (
      <View style={styles.swipeActionLeft}>
        {isHabitCompleted(habitId) ? (
          <Text style={{ color: "#fff" }}>Completed</Text>
        ) : (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={32}
            color={"#fff"}
          ></MaterialCommunityIcons>
        )}
      </View>
    );
  };

  const isHabitCompleted = (id: string) => completions.includes(id);

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
              renderRightActions={() => renderRightActions(habit.$id)}
              onSwipeableOpen={(direction) => {
                direction == "right"
                  ? handleCompleteHabit(habit.$id)
                  : handleDeleteHabit(habit.$id);
                swipeableRefs.current[habit.$id]?.close();
              }}
            >
              <Card
                style={[
                  styles.card,
                  isHabitCompleted(habit.$id) && styles.cardCompleted,
                ]}
              >
                <View style={styles.cardView}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDesc}>{habit.description}</Text>
                  <View style={styles.cardFooter}>
                    <View
                      style={[
                        styles.streakBadge,
                        isHabitCompleted(habit.$id) && { opacity: 0.5 },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color="orange"
                      />
                      <Text style={styles.streakText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.freqBadge,
                        isHabitCompleted(habit.$id) && { opacity: 0.5 },
                      ]}
                    >
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
  cardCompleted: {
    opacity: 0.5,
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
