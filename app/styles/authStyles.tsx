import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "flex-start",
        paddingTop: 80
    },
    title: {
        marginBottom: 40,
        textAlign: "center",
        paddingBottom: 40
    },
    input: {
        marginBottom: 24,
    },
    btn: {
        marginTop: 12,
        marginBottom: 12,
    },
});

export default styles;