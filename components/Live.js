import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";
import * as Print from "expo-print";
import { ToastAndroid } from "react-native";
import { TouchableOpacity } from "react-native";
import * as Sharing from "expo-sharing";
import { Feather } from "@expo/vector-icons";
import { costLookup } from "../Constants";

const Live = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showPending, setShowPending] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    fetchOrders();
  }, [showPending]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filteredOrders = await getOrders(showPending);
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [showPending])
  );

  const filteredOrders =
    searchQuery.trim() === ""
      ? orders
      : orders.filter((order) =>
          order["Order Number"]
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1F4E67" }}>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          {showPending ? "Pending Orders" : "Completed Orders"}
        </Text>
        <Switch
          value={showPending}
          onValueChange={setShowPending}
          thumbColor="#FFFFFF"
          trackColor={{ false: "#767577", true: "#34C759" }}
        />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Order Number..."
            placeholderTextColor="#CCCCCC"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <OrderList orders={filteredOrders} showPending={showPending} />
        </>
      )}
    </SafeAreaView>
  );
};

const getOrders = async (showPending) => {
  const storedDirectoryUri = await AsyncStorage.getItem("directoryUri");
  const excelName = await AsyncStorage.getItem("excelName");
  const sheetName = await AsyncStorage.getItem("sheetName");

  if (!storedDirectoryUri || !excelName || !sheetName) {
    Alert.alert("Error", "Missing setting details. Please set settings again.");
    return [];
  }

  const FILE_NAME = `${excelName}.xlsx`;

  if (!storedDirectoryUri) {
    Alert.alert(
      "Storage Permission Required",
      "Please set directory to view orders",
      [{ text: "OK" }]
    );
    return [];
  }

  try {
    const files =
      await FileSystem.StorageAccessFramework.readDirectoryAsync(
        storedDirectoryUri
      );

    let fileUri = files.find((file) => file.includes(FILE_NAME));

    if (!fileUri) {
      ToastAndroid.showWithGravityAndOffset(
        `No Excel file found`,
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
        25,
        50
      );
      return [];
    }

    const existingData =
      await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

    const workbook = XLSX.read(existingData, { type: "base64" });

    if (!workbook.Sheets[sheetName]) {
      ToastAndroid.showWithGravityAndOffset(
        `No sheet with name ${sheetName} found...`,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
        25,
        50
      );
      return [];
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    return jsonData.filter((order) => {
      const paymentStatus = order["Payment Status"]?.trim().toLowerCase();
      const stitchingStatus = order["Stitching Status"]?.trim().toLowerCase();
      const deliveryStatus = order["Delivery Status"]?.trim().toLowerCase();

      return showPending
        ? paymentStatus !== "completed" ||
            stitchingStatus !== "completed" ||
            deliveryStatus !== "completed"
        : paymentStatus === "completed" &&
            stitchingStatus === "completed" &&
            deliveryStatus === "completed";
    });
  } catch (error) {
    return [];
  }
};

const generateReceipt = (order) => {
  const now = new Date();
  const formattedDate = now.toISOString().split("T")[0];

  let itemsHTML = "";

  const paymentMethods =
    Object.keys(order)
      .filter(
        (key) =>
          ["Cash", "Credit Card", "UPI"].includes(key) &&
          order[key] !== "No"
      )
      .join(", ") || "";

  Object.keys(order).forEach((key) => {
    const costEntry = costLookup.find((entry) => entry.item === key);

    if (costEntry) {
      const quantity = parseInt(order[key]) || 0;
      if (quantity > 0) {
        const cost = costEntry.cost;
        const totalItemCost = cost * quantity;

        itemsHTML += `
          <tr>
            <td>${key}</td>
            <td>${quantity}</td>
            <td>₹${cost}</td>
            <td>₹${totalItemCost}</td>
          </tr>
        `;
      }
    }
  });

  const receiptHTML = `
   <html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
    h2 { color: #1F4E67;  margin-top: 0px; }
    h5 { color: #1F4E67;  margin-top: 0px; }
    h4 { margin-top: 0px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #1F4E67; color: white; }
    td[colspan] { font-weight: bold; }

    .order-details {
      text-align: left;
      margin-top: 20px;
    }

   .disclaimer {
      margin-top: 20px;
      font-size: 14px;
      color: #000;
      font-weight: bold;
      text-align: center;
    }
 
    /* Background PAID stamp */
    .paid-stamp {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-15deg);
      font-size: 100px;
      font-weight: bold;
      color: rgba(0, 128, 0, 0.15); /* More faded green */
      padding: 20px 80px;
      border: 10px solid rgba(0, 128, 0, 0.2); /* Border also faded */
      border-radius: 10px;
      text-transform: uppercase;
      z-index: -1; /* Set behind content */
    }
  </style>
</head>
<body>
  <div class="paid-stamp">PAID</div>
  <h2>Different Designer</h2>
  <h5>The House of Ladies Wear Stitching and Embroidery Work</h2>
  <h4>Receipt</h4>

  <!-- Order Details Moved to Left -->
  <div class="order-details">
    <p><strong>Order Number:</strong> ${order["Order Number"]}</p>
    <p><strong>Receipt Date:</strong> ${formattedDate}</p>
    <p><strong>Customer:</strong> ${order["Name"]}</p>
  </div>

  <table>
    <tr>
      <th>Item</th>
      <th>Quantity</th>
      <th>Cost</th>
      <th>Total</th>
    </tr>
    ${itemsHTML}

    <!-- Footer Row with Totals -->
    <tr>
      <td colspan="3"><strong>Advance</strong></td>
      <td>₹${order["Advance"]}</td>
    </tr>
    <tr>
      <td colspan="3"><strong>Balance</strong></td>
      <td>₹${order["Balance"]}</td>
    </tr>
    <tr>
      <td colspan="3"><strong>Total</strong></td>
      <td>₹${order["Total Order Value"]}</td>
    </tr>
    <tr>
      <td colspan="3"><strong>Payment Mode</strong></td>
      <td>${paymentMethods}</td>
    </tr>
  </table>
  <!-- Disclaimer -->
  <p class="disclaimer">
    ** This is a digitally generated receipt and does not require a signature.
  </p>
</body>
</html>`;
  return receiptHTML;
};

const sharePdf = async (order) => {
  try {
    const fileName = `Receipt_${order["Order Number"]}.pdf`;

    const { uri } = await Print.printToFileAsync({
      html: generateReceipt(order),
    });

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: uri,
      to: fileUri,
    });

    if (await Sharing.isAvailableAsync()) {
      try {
        const result = await Sharing.shareAsync(fileUri);

        if (result) {
          ToastAndroid.showWithGravityAndOffset(
            "Share Success",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        } else {
          // ToastAndroid.showWithGravityAndOffset(
          //   "Sharing Cancelled",
          //   ToastAndroid.SHORT,
          //   ToastAndroid.BOTTOM,
          //   25,
          //   50
          // );
        }
      } catch (error) {
        ToastAndroid.showWithGravityAndOffset(
          "Error sharing receipt",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }
    } else {
      Alert.alert("Share Not available");
    }
  } catch (error) {
    Alert.alert(error, "An error occurred while creating the PDF.");
  }
};

const saveReceipt = async (order) => {
  try {
    const storedDirectoryUri = await AsyncStorage.getItem(
      "receiptDirectoryUri"
    );
    let directoryUri = storedDirectoryUri;

    if (!directoryUri) {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        directoryUri = permissions.directoryUri;
        await AsyncStorage.setItem("receiptDirectoryUri", directoryUri);
      } else {
        Alert.alert("Permission not granted for folder access");
        return;
      }
    }

    const fileName = `Receipt_${order["Order Number"]}.pdf`;

    const files =
        await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);

    const matchingFiles = files.filter((file) => file.includes(fileName));

     if (matchingFiles.length > 0) {
        for (const file of matchingFiles) {
          await FileSystem.StorageAccessFramework.deleteAsync(file);
          const decodedFileUri = decodeURIComponent(file);
          ToastAndroid.showWithGravityAndOffset(
            `Removing old Receipt ${decodedFileUri.split("/").pop()}`,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            25,
            50
          );
        }
      }


    const { uri } = await Print.printToFileAsync({
      html: generateReceipt(order),
    });

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName,
      "application/pdf"
    )
      .then(async (uri) => {
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        ToastAndroid.showWithGravityAndOffset(
          "Receipt Save Success",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      })
      .catch((error) => {
        console.error("Error creating file:", error);
        Alert.alert("Error", "Failed to save receipt.");
      });
  } catch (error) {
    console.error("Error saving receipt:", error);
    Alert.alert("Error", "An unexpected error occurred.");
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Not Started":
      return styles.redText;
    case "In Progress":
      return styles.orangeText;
    case "Completed":
      return styles.greenText;
    default:
      return {};
  }
};

const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date(0);
  }
  const [day, month, year] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}`);
};

const getDaysRemaining = (orderDate, deliveryDate) => {
  const order = parseDate(orderDate);
  const delivery = parseDate(deliveryDate);
  const diffTime = delivery - order;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    return `${diffDays} days left`;
  } else if (diffDays === 0) {
    return "Due today";
  } else {
    return `Overdue by ${Math.abs(diffDays)} days`;
  }
};

const OrderList = ({ orders, showPending }) => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    const isCompleted =
      item["Delivery Status"]?.trim() === "Completed" &&
      item["Payment Status"]?.trim() === "Completed" &&
      item["Stitching Status"]?.trim() === "Completed";

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.orderNumber}>Order # {item["Order Number"]}</Text>
          {showPending && (
            <Text style={styles.deliveryTime}>
              {getDaysRemaining(item["Order Date"], item["Delivery Date"])}
            </Text>
          )}
          {isCompleted && (
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => saveReceipt(item)}>
                <Feather
                  name="download"
                  size={22}
                  color="#1F4E67"
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sharePdf(item)}>
                <Feather
                  name="share-2"
                  size={22}
                  color="#1F4E67"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text>📅 Order Date: {item["Order Date"]}</Text>
        <Text>🚚 Delivery Date: {item["Delivery Date"]}</Text>
        <Text>👤 Customer: {item["Name"]}</Text>
        <Text
          style={[
            styles.boldText,
            item["Payment Status"]?.trim() === "Completed"
              ? styles.greenText
              : styles.redText,
          ]}
        >
          💰 Payment: {item["Payment Status"]}
        </Text>
        <Text
          style={[styles.boldText, getStatusColor(item["Stitching Status"])]}
        >
          🧵 Stitching: {item["Stitching Status"]}
        </Text>
        <View style={styles.statusRow}>
          <Text
            style={[
              styles.boldText,
              item["Delivery Status"]?.trim() === "Completed"
                ? styles.greenText
                : styles.redText,
            ]}
          >
            📦 Delivery Status: {item["Delivery Status"]}
          </Text>
          <Button
            title="Open"
            color="#1F4E67"
            onPress={() =>
              navigation.navigate("AddCustomer", { orderData: item })
            }
          />
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={orders ?? []}
      keyExtractor={(item, index) =>
        item["Order Number"]
          ? item["Order Number"].toString()
          : index.toString()
      }
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {showPending ? "No pending orders" : "No completed orders"}
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 40,
    backgroundColor: "#2E6A88",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deliveryTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "gray",
  },
  boldText: {
    fontWeight: "bold",
  },
  redText: { color: "red" },
  orangeText: { color: "orange" },
  greenText: { color: "green" },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    margin: 10,
    borderRadius: 8,
    color: "#000",
  },
  iconRow: {
    flexDirection: "row",
    gap: 10,
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default Live;
