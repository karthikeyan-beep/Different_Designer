import React, { useState } from "react";
import { View, StyleSheet, ToastAndroid, Alert } from "react-native";
import { List, Button, TextInput, Text } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Settings = () => {
  const navigation = useNavigation();

  const [expanded, setExpanded] = useState(false);
  const [expandedSettings, setExpandedSettings] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [directoryUri, setDirectoryUri] = useState("");
  const [excelName, setExcelName] = useState("");
  const [sheetName, setSheetName] = useState("");

  React.useEffect(() => {
    const loadStoredValues = async () => {
      const storedDirectoryUri = await AsyncStorage.getItem("directoryUri");
      const storedExcelName = await AsyncStorage.getItem("excelName");
      const storedSheetName = await AsyncStorage.getItem("sheetName");

      if (storedDirectoryUri) setDirectoryUri(storedDirectoryUri);
      if (storedExcelName) setExcelName(storedExcelName);
      if (storedSheetName) setSheetName(storedSheetName);
    };

    loadStoredValues();
  }, []);

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

  const handleSaveSettings = async () => {
    if (!directoryUri || !excelName.trim() || !sheetName.trim()) {
      let missingFields = [];
      if (!directoryUri) missingFields.push("Directory URI");
      if (!excelName.trim()) missingFields.push("Excel Name");
      if (!sheetName.trim()) missingFields.push("Sheet Name");

      Alert.alert(
        "Missing Fields",
        `Please fill in: ${missingFields.join(", ")}`
      );
      return;
    }

    try {
      await AsyncStorage.setItem("directoryUri", directoryUri);
      await AsyncStorage.setItem("excelName", excelName);
      await AsyncStorage.setItem("sheetName", sheetName);
      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  const selectDirectory = async () => {
    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        setDirectoryUri(permissions.directoryUri);
      } else {
        Alert.alert("Permission not granted for folder access");
        return;
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select directory.");
    }
  };

  const getFolderName = (uri) => {
    if (!uri) return "";
    try {
      let decodedUri = decodeURIComponent(uri);
      return decodedUri.split("/").pop().replace("primary:", "");
    } catch (error) {
      console.error("Error extracting folder name:", error);
      return "";
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
      <List.Accordion
        title="File Settings"
        expanded={expandedSettings}
        onPress={() => setExpandedSettings(!expandedSettings)}
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <View style={{ padding: 10 }}>
          <TextInput
            label="Directory URI"
            value={getFolderName(directoryUri)} 
            theme={{ colors: { primary: "#1F4E67" } }}
            style={{ marginBottom: 10 }}
            disabled
          />
          <Button mode="contained" onPress={selectDirectory} style={{ marginBottom: 10 }}>
            Select Directory
          </Button>

          <TextInput
            label="Excel Name"
            value={excelName}
            maxLength={100}
            theme={{ colors: { primary: "#1F4E67" } }}
            style={{ marginBottom: 10 }}
            onChangeText={setExcelName}
          />

          <TextInput
            label="Sheet Name"
            value={sheetName}
            maxLength={100}
            theme={{ colors: { primary: "#1F4E67" } }}
            style={{ marginBottom: 10 }}
            onChangeText={setSheetName}
          />

          <Button mode="contained" onPress={handleSaveSettings}>
            SAVE SETTINGS
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
