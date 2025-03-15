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
import { useNavigation, useFocusEffect} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";
import { ToastAndroid } from "react-native";

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
  const [day, month, year] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}`);
};

const getDaysRemaining = (orderDate, deliveryDate) => {
  const order = parseDate(orderDate);
  const delivery = parseDate(deliveryDate);
  const diffTime = delivery - order;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} days left` : "Due today";
};

const OrderList = ({ orders, showPending }) => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.orderNumber}>Order # {item["Order Number"]}</Text>
          {showPending && (
            <Text style={styles.deliveryTime}>
              {getDaysRemaining(item["Order Date"], item["Delivery Date"])}
            </Text>
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
      <Text style={[styles.boldText, item["Delivery Status"]?.trim() === "Completed"
              ? styles.greenText
              : styles.redText,
          ]}>
         📦 Delivery Status: {item["Delivery Status"]}
      </Text>
      <Button title="Open"  color="#1F4E67" onPress={() => navigation.navigate("AddCustomer", { orderData: item })} />
    </View>
      </View>
  );

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
});

export default Live;
