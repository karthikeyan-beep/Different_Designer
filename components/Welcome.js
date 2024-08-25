import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useNavigation } from "@react-navigation/native";
// import Icon from "react-native-vector-icons/AntDesign";

const Welcome = () => {
  const [loading, setLoading] = useState(true);
  const items = [
    { title: "NEW BILL", route: "AddCustomer", icon: "adduser" },
    { title: "VIEW BILL", route: "ViewCustomer", icon: "eyeo" },
  ];

  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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
