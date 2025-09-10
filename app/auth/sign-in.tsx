import { useAuth } from "@/lib/auth-context";
import { Button, Input, Text, useTheme } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { styles } from "../styles/authStyles";

export default function SignInScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>("");
    
    const router = useRouter();

    const theme = useTheme();

    const { signIn } = useAuth();

    const handleSignIn = async () => {
        if (!email || !password) {
            setError("Please fill all required fields");
            return;
        }

        if (password.length < 6) {
            setError("Password must be longer than 5 characters.");
            return;
        }

        setError(null);

        const errorMessage = await signIn(email, password);
        if (errorMessage) setError(errorMessage);

        router.replace("/")
    };

    function handleGoToSignUp() {
        router.push("/auth/sign-up")
    }
    return (
            <KeyboardAvoidingView
            style = {styles.container}>
                <View style = {styles.content}>
                    <Text category="h1" style={styles.title}>Sign in, user!</Text>
                    <Input
                        label="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="example@gmail.com"
                        size="large"
                        style={styles.input}
                        onChangeText={setEmail}
                    />
                    <Input
                        label="Password"
                        autoCapitalize="none"
                        placeholder="Enter password"
                        secureTextEntry
                        size="large"
                        style = {styles.input}
                        onChangeText={setPassword}
                    />
                
                    {error && 
                    <Text style={{ color: theme['color-danger-700'] }}>{error}</Text>
                    }
                    <Button style={styles.btn} onPress={handleSignIn}>Sign In!</Button>
                    <Button style={styles.btn} onPress={handleGoToSignUp} appearance='ghost'>
                        Don't have an account? Sign up then!
                    </Button>
                </View>
        
            </KeyboardAvoidingView>
    )
}