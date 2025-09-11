import { AuthProvider, useAuth } from '@/lib/auth-context';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from "@ui-kitten/components";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    
    if (!isUserLoading) {
      if (!user && !inAuthGroup) {
        router.replace("/auth/sign-in");
      } else if (user && inAuthGroup) {
        router.replace("/")
      }
    }
  }, [user, segments]);

  return <>{children}</>
}
export default function RootLayout() {
  return (
    <ApplicationProvider {...eva} theme={eva.light} >
      <AuthProvider>
        <SafeAreaProvider>
          <RouteGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>
          </SafeAreaProvider>
      </AuthProvider>
    </ApplicationProvider>
  )
}