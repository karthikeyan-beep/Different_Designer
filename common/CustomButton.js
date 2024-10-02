import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

const CustomButton = ({ color, buttonText, onPress }) => (
  <View
    style={{
      alignSelf: "center",
      width: "100%",
      marginTop: 10,
      flexDirection: "column-reverse",
      gap: 10,
    }}
  >
    <Button
      style={{
        width: "80%",
        alignSelf: "center",
        backgroundColor: color,
      }}
      mode="contained"
      onPress={onPress}
    >
      {buttonText}
    </Button>
  </View>
);

export default CustomButton;