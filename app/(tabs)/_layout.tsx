import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from "expo-router";

export default function RootLayout() {
  return <Tabs>
    <Tabs.Screen name="index" options={{
      title: "Home",
      tabBarIcon: ({ color }) => (<FontAwesome5 name="home" size={24} color={color} />)
    }} />
    <Tabs.Screen name="test" options={{
      title: "Test",
      tabBarIcon: ({ color, focused }) => {
        return focused ?
          (<FontAwesome name="thumbs-o-up" size={24} color={color} />)
          :
          (<FontAwesome name="thumbs-up" size={24} color={color} />)
      }
    }} />
  </Tabs>
}
