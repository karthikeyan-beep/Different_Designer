import React from "react";
import { StyleSheet, SafeAreaView, View, Linking } from "react-native";
import { Button, TextInput } from "react-native-paper";

const ViewCustomer = () => {
  const handleOpenPdf = async () => {
    try {
      const uri = "content:///storage/emulated/0/Bills/dummy2.pdf";
      Linking.openURL(uri);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TextInput
          label="Order ID"
          // value={customerName}
          maxLength={50}
          theme={{ colors: { primary: "#1F4E67" } }}
          style={{ width: "60%", alignContent: "center" }}
          keyboardType="phone-pad"
        />
        <Button
          mode="contained"
          buttonColor="#3E525F"
          style={styles.button}
          //onPress={() => handleOpenPdf()}
        >
          Launch
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F4E67",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    margin: 10,
  },
});

export default ViewCustomer;
