import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextTypes = {
    user: Models.User<Models.Preferences> | null;
    isUserLoading: boolean;
    signUp: (name:string, surname: string, email: string, password: string) => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextTypes | undefined>(undefined);

export function AuthProvider({ children }: {children: React.ReactNode}) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null> (null);
    const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
    useEffect(() => {
        getUser();
    }, []);
    const getUser = async () => {
        try {
            const session = await account.get();
            setUser(session)
        } catch (error) {
            setUser(null);
        } finally {
            setIsUserLoading(false);
        }
    }

    const signUp = async (name: string, surname: string, email: string, password: string) => {
        try {
            await account.create(ID.unique(), email, password, name + " " + surname);
            await signIn(email, password);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occured during sign up.";
        }
    }
    const signIn = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const session = await account.get();
            setUser(session);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occured during sign up.";
        }
    }

    const signOut = async () => {
        try {
            await account.deleteSession("current");
            setUser(null);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occured during sign out.";
        }
    }
    return (
        <AuthContext.Provider value={{ user, isUserLoading, signUp, signIn, signOut }}>
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