import * as appwrite from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Button, Input, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";


export default function AddHabitScreen() {
    const frequencies = ["daily", "weekly", "monthly"];

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [frequency, setFrequency] = useState<typeof frequencies[number]>("daily");

    const { user } = useAuth();
    const [error, setError] = useState<string>("");
    const handleSubmit = async () => {
        if (!user) return;

        try {
            await appwrite.databases.createDocument(
                appwrite.DB_ID,
                appwrite.HABITS_TABLE_ID,
                ID.unique(),
                {
                    user_id: user.$id,
                    title,
                    description,
                    frequency,
                    streak_count: 0,
                    last_completed: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                }
            )

            router.back();
            setError("");
            setTitle("");
            setDescription("");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            else {
                setError("There was a problem with creating a habit");
            }
        }
    }

    return (
        <View style={styles.container}>
            <Input
                size="large"
                value={title}
                placeholder="Title"
                onChangeText={setTitle}
                style={styles.input}>
            </Input>
            <Input
                size="large"
                value={description}
                placeholder="Description"
                onChangeText={setDescription}
                style={styles.input}>
            </Input>
            <View style={styles.buttonContainer}>
                <Button status = {frequency==="daily" ? "outline" : "filled"} onPress={() => setFrequency("daily")} style={styles.button}>Daily</Button>
                <Button status = {frequency==="weekly" ? "outline" : "filled"} onPress={() => setFrequency("weekly")} style={styles.button}>Weekly</Button>
                <Button status = {frequency==="monthly" ? "outline" : "filled"} onPress={() => setFrequency("monthly")} style={styles.button}>Monthly</Button>
            </View>
            <Button disabled={!title || !description} onPress={handleSubmit}>Add habit</Button>
            <Text status="danger"> {error} </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 80,
        padding: 16,
        backgroundColor: "#F5F5F5",
    },
    input: {
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        marginBottom: 24,
        width: "100%",
        height: "9%",
    },
    button: {
        flex: 1,
    },
});