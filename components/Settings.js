import React, { useState } from "react";
import { View, StyleSheet, ToastAndroid } from "react-native";
import { List, Button, TextInput, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Settings = () => {
  const navigation = useNavigation();

  const [expanded, setExpanded] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handlePress = () => setExpanded(!expanded);

  const handleOrderNumber = async () => {
    if (orderNumber === null || orderNumber.trim() === "") {
      alert("Please enter a valid order number");
      return;
    }

    try {
      await AsyncStorage.setItem("orderNumber", JSON.stringify(orderNumber));
      navigation.navigate("AddCustomer");

      ToastAndroid.showWithGravityAndOffset(
        "Order Number Saved!",
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } catch (error) {
      alert("Failed to save the order number");
    }
  };

  return (
    <View style={styles.container}>
      <List.Accordion
        title="Set Order Number"
        expanded={expanded}
        onPress={handlePress}
        style={styles.accordion}
      >
        <View style={styles.accordionContent}>
          <TextInput
            label="Order Number"
            value={orderNumber}
            maxLength={100}
            theme={{ colors: { primary: "#1F4E67" } }}
            style={styles.input}
            onChangeText={(orderNumber) => setOrderNumber(orderNumber)}
          />
          <Button
            style={styles.button}
            mode="contained"
            onPress={() => handleOrderNumber()}
          >
            SUBMIT
          </Button>
        </View>
      </List.Accordion>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
    backgroundColor: "#1F4E67",
  },
  accordion: {
    backgroundColor: "#f0f0f0",
  },
  accordionContent: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  note: {
    color: "yellow",
    marginBottom: 10,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    marginBottom: 10,
  },
  button: {
    width: "50%",
    backgroundColor: "#3E525F",
  },
});

export default Settings;
