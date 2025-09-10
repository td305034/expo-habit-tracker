import { useAuth } from "@/lib/auth-context";
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Button, Layout, Text } from '@ui-kitten/components';
import { StyleSheet } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  return (
    <ApplicationProvider {...eva} theme={eva.light} >
    <Layout style = {styles.view}>
        <Text category="h1">Hello world!</Text>
        <Button appearance="ghost" onPress={ signOut }>Sign out</Button>
    </Layout>
    </ApplicationProvider>    
  );
  
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  navBar: {
    width: 100,
    height: 50,
    backgroundColor:"coral",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10
  },
  h1: {
    fontSize: 20
  }
})