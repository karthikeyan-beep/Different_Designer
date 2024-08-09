import React from "react";
import { StyleSheet, SafeAreaView, Text, View } from "react-native";

const ViewCustomer = () => {
  return <SafeAreaView style={styles.container}></SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F4E67",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ViewCustomer;
