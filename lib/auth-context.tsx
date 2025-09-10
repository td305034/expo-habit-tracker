import { createContext, useContext } from "react";
import { ID } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextTypes = {
    //user: Models.User<Models.Preferences> | null;
    signUp: (name:string, surname: string, email: string, password: string) => Promise<string | undefined>;
    signIn: (email: string, password: string) => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextTypes | undefined>(undefined);

export function AuthProvider({ children }: {children: React.ReactNode}) {
    
    const signUp = async (name: string, surname: string, email: string, password: string) => {
        try {
            await account.create(ID.unique(), email, password, name + " " + surname);
            await signIn(email, password);
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occured during sign up.";
        }
    }
    const signIn = async (email: string, password: string) => {
        try {
            account.createEmailPasswordSession(email, password);
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occured during sign up.";
        }
    }
    return (
        <AuthContext.Provider value={{ signUp, signIn }}>
            {children}
        </AuthContext.Provider>
    )
    }

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("context is undefined!")
    }
    return context;
}