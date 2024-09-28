import React, { useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  ToastAndroid,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const ViewCustomer = () => {
  const navigation = useNavigation();
  const [dir, setdir] = React.useState();

  useEffect(() => {
    const getDirectoryUri = async () => {
      try {
        const storedDirectoryUri = await AsyncStorage.getItem("directoryUri");
        let directoryUri = storedDirectoryUri;
        setdir(directoryUri);
        if (!directoryUri) {
          const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

          if (permissions.granted) {
            directoryUri = permissions.directoryUri;
            setdir(directoryUri);
            await AsyncStorage.setItem("directoryUri", directoryUri);
            ToastAndroid.showWithGravityAndOffset(
              "Permission granted!",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
          } else {
            Alert.alert("Permission not granted for folder access");
            return;
          }
        }
      } catch (error) {
        Alert.alert("Unknown error occurred");
      }
    };

    getDirectoryUri();
  }, []);

  const [orderId, setOrderId] = React.useState("");

  const handleOpenPdf = async () => {
    if (!orderId) {
      Alert.alert("Order No cannot be empty");
      return;
    }
    if (dir) {
      const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(dir);

      if (!files || files.length === 0) {
        Alert.alert(`Oops no files are there in the folder`);
        return;
      }

      const matchedFiles = files.filter((fileUri) => {
        const decodedUri = decodeURIComponent(fileUri);
        const fileName = decodedUri.substring(decodedUri.lastIndexOf("/") + 1);
        return fileName.includes(`_${orderId}_`);
      });

      if (!matchedFiles || matchedFiles.length === 0) {
        Alert.alert(`No Invoice with Order No: ${orderId} is found`);
      } else {
        const name = decodeURIComponent(
          matchedFiles[0].substring(matchedFiles[0].lastIndexOf("/") + 1)
        );
        const tempUri = FileSystem.cacheDirectory + name;
        await FileSystem.copyAsync({ from: matchedFiles[0], to: tempUri });
        const result = await FileSystem.readAsStringAsync(tempUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        navigation.navigate("WebViewComp", {
          base64: result,
          orderId: orderId,
          pdfName: name,
        });
      }
    } else {
      Alert.alert(
        "Folder access required",
        "Please grant permission to the appropriate folder in the settings.",
        [
          {
            text: "Go to Settings",
            onPress: () => navigation.navigate("Settings"),
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TextInput
          label="Order ID"
          value={orderId}
          maxLength={50}
          theme={{ colors: { primary: "#1F4E67" } }}
          style={{ width: "60%", alignContent: "center" }}
          keyboardType="phone-pad"
          onChangeText={(orderId) => setOrderId(orderId)}
        />
        <Button
          mode="contained"
          buttonColor="#3E525F"
          style={styles.button}
          onPress={() => handleOpenPdf()}
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
