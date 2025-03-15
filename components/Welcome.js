import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Welcome = () => {
  const [loading, setLoading] = useState(true);
  const items = [
    { title: "NEW BILL", route: "AddCustomer", icon: "adduser" },
    { title: "VIEW BILL", route: "ViewCustomer", icon: "eyeo" },
    { title: "LIVE ORDER", route: "Live", icon: "eyeo" }
  ];

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const checkStorageAndNavigate = async () => {
        const directoryUri = await AsyncStorage.getItem("directoryUri");
        const excelName = await AsyncStorage.getItem("excelName");
        const sheetName = await AsyncStorage.getItem("sheetName");

        let missingItems = [];
        if (!directoryUri) missingItems.push("Directory URI");
        if (!excelName) missingItems.push("Excel Name");
        if (!sheetName) missingItems.push("Sheet Name");

        if (missingItems.length > 0) {
          Alert.alert(
            "Setup Required",
            `Please setup the following:\n\n${missingItems.join("\n")}`,
            [
              {
                text: "Go to Settings",
                onPress: () => navigation.navigate("Settings"),
              },
            ]
          );
        }
      };

      checkStorageAndNavigate();

      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }, [])
  );
  

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.outerContainer}
    >
      <Spinner
        visible={loading}
        color="#C2CCD3"
        textContent={"Loading..."}
        textStyle={styles.spinnerTextStyle}
      />
      {!loading && (
        <View style={styles.innerContainer}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.item}>
                <Text style={styles.text}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    fontSize: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F4E67",
    margin: 20,
    padding: 20,
    height: 80,
    width: 200,
    borderRadius: 20,
  },
  text: {
    fontSize: 20,
    color: "#C2CCD3",
  },
  spinnerTextStyle: {
    color: "#C2CCD3",
  },
});

export default Welcome;
