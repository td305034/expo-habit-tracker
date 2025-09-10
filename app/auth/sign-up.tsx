import { useAuth } from "@/lib/auth-context";
import { Button, Input, Text, useTheme } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { styles } from "../styles/authStyles";

export default function SignUpScreen() {
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [error, setError] = useState<string | null>("");
    
    const { signUp } = useAuth();

    const router = useRouter();
    const theme = useTheme();

    const handleSignUp = async () => {
        if (!name || !surname || !email || !password) {
            setError("Please fill all required fields");
            return;
        }

        if (password.length < 6) {
            setError("Password must be longer than 5 characters.");
            return;
        }

        setError(null);
        
        const errorMessage = await signUp(name, surname, email, password);
        if (errorMessage) {
            setError(errorMessage);
            return;
        }
    };

    function handleGoToSignIn() {
        router.push("/auth/sign-in")
    }

    return (
        <KeyboardAvoidingView
        style = {styles.container}
        behavior="height">
            <View style = {styles.content}>
                <Text category="h1" style={styles.title}>Create Account</Text>
                <Input
                    label="Imie"
                    autoCapitalize="words"
                    keyboardType="email-address"
                    placeholder="John"
                    size="large"
                    style={styles.input}
                    onChangeText={setName}
                />
                <Input
                    label="Nazwisko"
                    autoCapitalize="words"
                    keyboardType="email-address"
                    placeholder="Snow"
                    size="large"
                    style={styles.input}
                    onChangeText={setSurname}
                />
                <Input
                    label="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="example@gmail.com"
                    size="large"
                    style = {styles.input}
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
                <Button style={styles.btn} onPress={handleSignUp}>Sign up!</Button>
                <Button style={styles.btn} onPress={handleGoToSignIn} appearance='ghost'>
                    Already have an account? Sign in then!
                </Button>
            </View>
        
            </KeyboardAvoidingView>
    )
}