import React, { useEffect } from "react";
import { WebView } from "react-native-webview";
import {
  Alert,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import { Octicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import Spinner from "react-native-loading-spinner-overlay";

export default function WebViewComp({ route }) {
  const [loading, setLoading] = React.useState(true);

  const navigation = useNavigation();

  const { base64, orderId, pdfName } = route.params;

  const handleShare = async () => {
    const tempUri = FileSystem.cacheDirectory + pdfName;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tempUri);
      ToastAndroid.show("Invoice shared successfully!", ToastAndroid.LONG);
      navigation.navigate("ViewCustomer");
    } else {
      Alert.alert("Sharing is not available on this device.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Order No : ${orderId}`,
      headerStyle: { backgroundColor: "#1F4E67" },
      headerTintColor: "#C2CCD3",
      headerRight: () => (
        <TouchableOpacity onPress={() => handleShare()}>
          <Octicons name="share-android" size={25} color="#C2CCD3" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, orderId]);

  useEffect(() => {
    return () => {
      const deleteTempFile = async () => {
        try {
          const tempUri = FileSystem.cacheDirectory + pdfName;
          await FileSystem.deleteAsync(tempUri);
        } catch (error) {
        }
      };
      deleteTempFile();
    };
  }, []);

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>PDF.js viewer</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.43, minimum-scale=0.4, maximum-scale=1.0, user-scalable=yes">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <style>
      body { margin: 0; padding: 0; }
      #pdf-container { width: 100vw; height: 100vh; overflow-y: auto; }
      .pdf-page { margin: 20px 0; }
    </style>
  </head>
  <body>
    <div id="pdf-container"></div>
    <script>
      var pdfData = '${base64}';
      
      var pdfAsArray = convertDataURIToBinary(pdfData);

      var loadingTask = pdfjsLib.getDocument({data: pdfAsArray});
      loadingTask.promise.then(function(pdf) {

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          pdf.getPage(pageNumber).then(function(page) {
            var scale = 1.5;
            var viewport = page.getViewport({ scale: scale });

            var canvas = document.createElement('canvas');
            canvas.className = 'pdf-page';
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            document.getElementById('pdf-container').appendChild(canvas);

            var renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            page.render(renderContext);
          });
        }
      });

      function convertDataURIToBinary(dataURI) {
        var raw = window.atob(dataURI);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for (var i = 0; i < rawLength; i++) {
          array[i] = raw.charCodeAt(i);
        }
        return array;
      }
    </script>
  </body>
  </html>
`;
  return (
    <View style={{ flex: 1 }}>
    {loading && (
      <Spinner
        visible={loading}
        textContent={"Loading..."}
        textStyle={styles.spinnerTextStyle}
      />
    )}
    {!loading && (
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
      />
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: "#C2CCD3",
  },
});
