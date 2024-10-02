import React from "react";
import { TextInput } from "react-native-paper";
import { View, Text, StyleSheet } from "react-native";

const AddCustTextInput = ({
  label,
  value,
  maxLength,
  onChange,
  keyboardType,
}) => {
  return (
    <View  style={[styles.inputContainer, label === "Notes"  && styles.overrideStyle]}>
      <Text style={styles.heading}>{label}</Text>
      <TextInput
        mode="flat"
        value={value}
        maxLength={maxLength}
        keyboardType={keyboardType || "default"}
        style={{ width: "100%", alignContent: "center" }}
        returnKeyType="done"
        onChangeText={onChange} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "25%",
    margin: 8,
    alignSelf: "center",
  },
  heading: {
    fontSize: 12.9,
    fontWeight: "bold",
    marginBottom: 5,
    color:"#C2CCD3",
  },
  overrideStyle:{
    width: "60%",
    margin: 8,
    alignSelf: "center",
  }
});

export default AddCustTextInput;
