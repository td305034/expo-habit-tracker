import { Stack, Tabs } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function RootLayout() {
  return <Tabs>
    <Tabs.Screen name="index" options={{
      title: "Home",
      tabBarIcon: ({ color }) => (<FontAwesome5 name="home" size={24} color={color} />)
    }} />
    <Tabs.Screen name="login" options={{
      title: "Login",
      tabBarIcon: ({ color, focused }) => {
        return focused ?
          (<MaterialCommunityIcons name="brightness-percent" size={24} color={color} />)
          :
          (<FontAwesome6 name="percent" size={24} color={color} />)
      }
    }} />
  </Tabs>
}
