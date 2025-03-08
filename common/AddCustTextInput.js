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
  const isLabel =  label === "Notes";
   return (
    <View  style={[styles.inputContainer, isLabel  && styles.overrideStyle]}>
      <Text style={styles.heading}>{label}</Text>
      <TextInput
        mode="flat"
        value={value}
        maxLength={maxLength}
        keyboardType={keyboardType || "default"}
        style={{ 
          width: "100%",
          height: isLabel ? 30 : 0,
          minHeight: isLabel ? 90 : 0,
          flexShrink: 1,
        }}
        multiline={isLabel} 
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
    width: "95%",
    margin: 10,
    alignSelf: "center",
  }
});

export default AddCustTextInput;
