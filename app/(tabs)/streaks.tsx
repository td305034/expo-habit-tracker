import {
  client,
  databases,
  DB_ID,
  HABITS_COMPLETION_TABLE_ID,
  HABITS_TABLE_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { Card, Text } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";

export default function StreaksScreen() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

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
            fetchCompletions();
          }
        }
      );

      fetchHabits();
      fetchCompletions();

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
  const fetchCompletions = async () => {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        HABITS_COMPLETION_TABLE_ID,
        [Query.equal("user_id", user?.$id ?? ""), Query.limit(1000)]
      );
      const completedHabits =
        response.documents as unknown as HabitCompletion[];
      setCompletions(completedHabits);
    } catch (error) {
      console.error(error);
    }
  };

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreakData = (habitId: string): StreakData => {
    const habitCompletions = completions
      ?.filter((c) => {
        return c.habit_id === habitId;
      })
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );

    if (habitCompletions?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions?.forEach((c) => {
      const date = new Date(c.completed_at);
      if (lastDate) {
        const difference =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (difference <= 1.5) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });
    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);

  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];
  return (
    <View style={styles.container}>
      <Text category="h2" style={styles.title}>
        Habit Streaks
      </Text>

      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🎖️ Top streaks</Text>
          {rankedHabits.slice(0, 3).map((item, key) => (
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[key]]}>
                <Text style={styles.rankingBadgeText}>{key + 1}</Text>
              </View>
              <Text style={styles.rankingHabit}> {item.habit.title}</Text>
              <Text style={styles.rankingStreak}> {item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No habits for today.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <Card
              key={key}
              style={[styles.card, key === 0 && styles.firstCard]}
            >
              <Text category="h4" style={styles.habitTitle}>
                {habit.title}
              </Text>
              <Text category="h6" style={styles.habitDesc}>
                {habit.description}
              </Text>
              <View style={styles.statsRow}>
                <View style={[styles.statBadgeOrange, styles.statBadge]}>
                  <Text style={styles.statBadgeText}>🔥 {streak}</Text>
                  <Text style={styles.statBadgeLabel}>Current</Text>
                </View>
                <View style={[styles.statBadgeGold, styles.statBadge]}>
                  <Text style={styles.statBadgeText}>🏆 {bestStreak}</Text>
                  <Text style={styles.statBadgeLabel}>Best</Text>
                </View>
                <View style={[styles.statBadgeGreen, styles.statBadge]}>
                  <Text style={styles.statBadgeText}>✅ {total}</Text>
                  <Text style={styles.statBadgeLabel}>Total</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingHorizontal: 24,
    backgroundColor: "#F5F5F5",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666",
  },
  title: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "f0f0f0",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    elevation: 3,

    backgroundColor: "#fff",
  },

  firstCard: {
    borderWidth: 2,
    borderColor: "#3e41f2ff",
  },

  habitTitle: {
    marginBottom: 2,
  },
  habitDesc: {
    color: "#6c6c80",
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  statBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  statBadgeOrange: {
    backgroundColor: "#fff3e0",
  },
  statBadgeGold: {
    backgroundColor: "#fffde7",
  },
  statBadgeGreen: {
    backgroundColor: "#e8f5e9",
  },
  statBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },
  statBadgeLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    fontWeight: 500,
  },
  rankingContainer: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    elevation: 2,
  },
  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#25057dff",
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  badge1: {
    backgroundColor: "#ffd700",
  },
  badge2: {
    backgroundColor: "#c0c0c0",
  },
  badge3: {
    backgroundColor: "#cd7f32",
  },
  rankingBadgeText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },
  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: 600,
  },
  rankingStreak: {
    fontSize: 14,
    color: "#25057dff",
    fontWeight: "bold",
  },
});
