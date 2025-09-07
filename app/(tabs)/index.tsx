import { View, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { ApplicationProvider, Layout, Text, Button } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

export default function Index() {
  return (
    <ApplicationProvider {...eva} theme={eva.light} >
    <Layout style = {styles.view}>
      <Text category="h1">Hello world!</Text>
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