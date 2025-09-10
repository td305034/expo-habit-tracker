import { AuthProvider, useAuth } from '@/lib/auth-context';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from "@ui-kitten/components";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    
    if (!isUserLoading) {
      if (!user && !inAuthGroup) {
        setTimeout(() => {
        router.replace("/auth/sign-in");
          }, 0.5)
      } else if (user && inAuthGroup) {
        router.replace("/")
      }
    }
  }, [user, segments, isUserLoading]);

  return <>{children}</>
}
export default function RootLayout() {
  return (
    <ApplicationProvider {...eva} theme={eva.light} >
      <AuthProvider>
        <RouteGuard>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </RouteGuard>
      </AuthProvider>
    </ApplicationProvider>
  )
}
