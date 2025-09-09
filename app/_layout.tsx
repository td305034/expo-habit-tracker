import * as eva from '@eva-design/eva';
import { ApplicationProvider } from "@ui-kitten/components";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuth = false;

  useEffect(() => {
    if (!isAuth) {
      setTimeout(() => {
          router.replace("/auth/sign-in");
        }, 1)
    }
  });

  return <>{children}</>
}
export default function RootLayout() {
  return (
    <ApplicationProvider {...eva} theme={eva.light} >
        <RouteGuard>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </RouteGuard>
    </ApplicationProvider>
  )
}
