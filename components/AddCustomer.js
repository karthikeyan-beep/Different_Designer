import React, { useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  View,
  ScrollView,
  Platform,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
  RefreshControl,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Spinner from "react-native-loading-spinner-overlay";
import { Picker } from "@react-native-picker/picker";
import {
  TextInput,
  HelperText,
  RadioButton,
  Text,
  Divider,
  Button,
  Checkbox,
} from "react-native-paper";
import InputSpinner from "react-native-input-spinner";
import Icon from "react-native-vector-icons/MaterialIcons";
import CamIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AWIcon from "react-native-vector-icons/FontAwesome";
import { formatDate, sharePdf, savePdf } from "../functions/AddCustService";
import * as FileSystem from "expo-file-system";
import {
  measurementsInitialState,
  inputFields,
  pickerSelection,
  costLookup,
} from "../Constants";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddCustTextInput from "../common/AddCustTextInput";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const AddCustomer = () => {
  const scrollViewRef = useRef(null);
  const customerNameRef = useRef(null);
  const customerMobileNumberRef = useRef(null);
  const orderDateRef = useRef(null);
  const deliveryDateRef = useRef(null);

  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [order, setOrder] = React.useState();
  const [loading, setLoading] = React.useState(true);

  const [isLoadingShare, setIsLoadingShare] = React.useState(false);
  const [isLoadingSave, setIsLoadingSave] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchTitle = async () => {
        try {
          const orderNumberString = await AsyncStorage.getItem("orderNumber");
          if (orderNumberString) {
            const orderNumber = JSON.parse(orderNumberString);
            setTitle(`Order No : ${orderNumber}`);
            setOrder(orderNumber);
          } else {
            Alert.alert(
              "Order Number Missing",
              "Please set the order number in settings.",
              [
                {
                  text: "Go to Settings",
                  onPress: () => navigation.navigate("Settings"),
                },
              ],
              { cancelable: false }
            );
          }
        } catch (error) {
          console.error("Failed to load title from AsyncStorage:", error);
        }
      };

      fetchTitle();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  const [customerName, setcustomerName] = React.useState("");
  const [customerMobileNumber, setcustomerMobileNumber] = React.useState("");
  const [orderDate, setOrderDate] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [datePickerType, setDatePickerType] = React.useState("");
  const [checked, setChecked] = React.useState("Male");
  const [selectedValue, setSelectedValue] = React.useState(pickerSelection[0]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [spinnerValue, setSpinnerValue] = React.useState(1);
  const [totalOrderValue, setTotalOrderValue] = React.useState("0");

  const [checkedCash, setCheckedCash] = React.useState(false);
  const [checkedUPI, setCheckedUPI] = React.useState(false);
  const [checkedCreditCard, setCheckedCreditCard] = React.useState(false);

  const [errors, setErrors] = React.useState({
    nameError: "",
    mobileError: "",
    orderDateError: "",
    deliveryDateError: "",
  });

  const validateFields = () => {
    let isValid = true;
    let nameError = "";
    let mobileError = "";
    let orderDateError = "";
    let deliveryDateError = "";

    if (!customerName.trim()) {
      nameError = "Customer name cannot be empty";
      isValid = false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(customerMobileNumber)) {
      mobileError = "Mobile number must be 10 digits";
      isValid = false;
    }

    if (!orderDate.trim()) {
      orderDateError = "Ordered date cannot be empty";
      isValid = false;
    }

    if (!deliveryDate.trim()) {
      deliveryDateError = "Delivery date cannot be empty";
      isValid = false;
    }

    setErrors({ nameError, mobileError, orderDateError, deliveryDateError });

    if (!isValid) {
      if (nameError && scrollViewRef.current && customerNameRef.current) {
        scrollViewRef.current.scrollTo({
          y: customerNameRef.current.y,
          animated: true,
        });
        customerNameRef.current.focus();
      } else if (
        mobileError &&
        scrollViewRef.current &&
        customerMobileNumberRef.current
      ) {
        scrollViewRef.current.scrollTo({
          y: customerMobileNumberRef.current.y,
          animated: true,
        });
        customerMobileNumberRef.current.focus();
      } else if (
        orderDateError &&
        scrollViewRef.current &&
        orderDateRef.current
      ) {
        scrollViewRef.current.scrollTo({
          y: orderDateRef.current.y,
          animated: true,
        });
        orderDateRef.current.focus();
        ToastAndroid.showWithGravity(
          "Ordered Date Missing!",
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
          25,
          50
        );
      } else if (
        deliveryDateError &&
        scrollViewRef.current &&
        deliveryDateRef.current
      ) {
        scrollViewRef.current.scrollTo({
          y: deliveryDateRef.current.y,
          animated: true,
        });
        deliveryDateRef.current.focus();
        ToastAndroid.showWithGravity(
          "Delivery Date Missing!",
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
          25,
          50
        );
      }
    }
    return isValid;
  };

  const [editselectedValue, setEditSelectedValue] = React.useState(
    pickerSelection[0]
  );
  const [editspinnerValue, setEditSpinnerValue] = React.useState(1);
  const [cost, setCost] = React.useState("");
  const [advance, setAdvance] = React.useState("");
  const [balance, setBalance] = React.useState(0);
  const [images, setImages] = React.useState([]);
  const [measurements, setMeasurements] = React.useState(
    measurementsInitialState
  );

  const [show, setShow] = React.useState(false);
  const [tableData, setTableData] = React.useState([]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const cancelComplete = () => {
    ToastAndroid.showWithGravityAndOffset(
      "Next Assignment Cancelled",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  const handleComplition = async () => {
    try {
      let increment = Number(order) + 1;
      await AsyncStorage.setItem("orderNumber", JSON.stringify(increment));
      navigation.replace("AddCustomer");
      ToastAndroid.showWithGravityAndOffset(
        "Order Completion Success ",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } catch (error) {
      Alert.alert("Something went wrong!!");
    }
  };

  const handleCompleteOrder = async () => {
    Alert.alert(
      "Next Order",
      "This action will refresh the screen and proceed to the next order assignment.",
      [
        {
          text: "Proceed",
          onPress: () => handleComplition(),
        },
        {
          text: "Cancel",
          onPress: () => cancelComplete(),
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  const submitPdf = async (type) => {
    if (validateFields()) {
      const data = {
        orderNumber: order,
        customerName: customerName.trim(),
        customerMobileNumber: customerMobileNumber,
        orderDate: orderDate,
        deliveryDate: deliveryDate,
        checked: checked,
        totalOrderValue: totalOrderValue,
        measurements: measurements,
        tableData: tableData,
        advance: advance,
        balance: balance,
        isCash: checkedCash,
        isCreditCard: checkedCreditCard,
        isUPI: checkedUPI,
        images: images,
        isFabric: images.length > 0,
      };

      if (tableData.length < 1) {
        Alert.alert("No Item Selected", "Please add at least one item.");
        return;
      }

      if (!checkedCash && !checkedCreditCard && !checkedUPI) {
        Alert.alert(
          "Payment Method Required",
          "Please select at least one payment method."
        );
        return;
      }

      if (type === "share") {
        setIsLoadingShare(true);
        sharePdf(data);
        setIsLoadingShare(false);
      } else {
        setIsLoadingSave(true);
        savePdf(data);
        setIsLoadingSave(false);
      }
    }
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleAdvance = (advance) => {
    setAdvance(advance);
    const reduceBalance = totalOrderValue - Number(advance);
    setBalance(reduceBalance);
  };

  const handleTableData = () => {
    const newItem = {
      id: selectedValue,
      Item: selectedValue,
      Qty: spinnerValue,
      Cost: spinnerValue * getCostForItem(selectedValue),
    };
    setTableData((prevTableData) => {
      const itemExists = prevTableData.some(
        (item) => item.id === selectedValue
      );

      if (itemExists) {
        Alert.alert("Duplicate Entry", `${selectedValue} already exists`);
        return prevTableData;
      }

      const updatedTableData = [...prevTableData, newItem];
      const newTotalCost = updatedTableData.reduce(
        (sum, item) => sum + item.Cost,
        0
      );
      setTotalOrderValue(newTotalCost);
      setBalance(newTotalCost - advance);
      return updatedTableData;
    });
  };

  const handleDeleteData = () => {
    setTableData((prevTableData) => {
      const updatedTableData = prevTableData.filter(
        (item) => item.Item !== editselectedValue
      );
      const newTotalCost = updatedTableData.reduce(
        (sum, item) => sum + item.Cost,
        0
      );
      setTotalOrderValue(newTotalCost);
      setBalance(newTotalCost - advance);
      return updatedTableData;
    });
    setModalVisible(false);
  };

  const getCostForItem = (itemName) => {
    const foundItem = costLookup.find((costItem) => costItem.item === itemName);
    return foundItem ? foundItem.cost : 0;
  };

  const renderItem = ({ item }) => {
    const itemCost = getCostForItem(item.Item);
    const totalCost = item.Qty * itemCost;

    return (
      <View key={item.id} style={styles.row}>
        <Text style={styles.cell}>{item.Item}</Text>
        <Text style={styles.cellQty}>{item.Qty}</Text>
        <Text style={styles.cell}>{item.Cost}</Text>
        <TouchableOpacity
          onPress={() => handleSelectedItemEdit(item, totalCost)}
        >
          <Icon name="mode-edit" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleCamera = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus === "granted" && mediaLibraryStatus === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled) {
        ToastAndroid.showWithGravityAndOffset(
          "Image Loading...",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );

        const compressedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.WEBP }
        );

        const base64Image = await FileSystem.readAsStringAsync(
          compressedImage.uri,
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );
        setImages([...images, `data:image/webp;base64,${base64Image}`]);
      } else {
        ToastAndroid.showWithGravityAndOffset(
          "Camera Cancelled",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }
    } else {
      Alert.alert("Permission to access camera is required!");
    }
  };

  const handleSelectedItemEdit = (item) => {
    setEditSelectedValue(item.Item);
    setEditSpinnerValue(item.Qty);
    setCost(String(item.Cost));
    setModalVisible(true);
  };

  const handleSpinnerChange = (value) => {
    setEditSpinnerValue(value);
    const costForItem = getCostForItem(editselectedValue);
    const totalCost = value * costForItem;
    setCost(totalCost.toString());
  };

  const handleUpdate = () => {
    const costForItem = getCostForItem(editselectedValue);
    const updatedCost = editspinnerValue * costForItem;
    const actualCost =
      updatedCost === Number(cost) ? updatedCost : Number(cost);

    const newItem = {
      id: editselectedValue,
      Item: editselectedValue,
      Qty: editspinnerValue,
      Cost: actualCost,
    };

    setTableData((prevTableData) => {
      const itemIndex = prevTableData.findIndex(
        (item) => item.Item === editselectedValue
      );
      let updatedTableData;
      if (itemIndex > -1) {
        updatedTableData = [...prevTableData];
        updatedTableData[itemIndex] = newItem;
      } else {
        updatedTableData = [...prevTableData, newItem];
      }

      const newTotalOrderValue = updatedTableData.reduce(
        (sum, item) => sum + item.Cost,
        0
      );

      setBalance(newTotalOrderValue - advance);
      setTotalOrderValue(newTotalOrderValue);

      return updatedTableData;
    });
    setModalVisible(false);
  };

  const showDatePicker = async (type) => {
    setDatePickerType(type);
    setShow(true);
  };

  const compareDates = (orderDate, deliveryDate) => {
    const [orderDay, orderMonth, orderYear] = orderDate.split("-").map(Number);
    const [deliveryDay, deliveryMonth, deliveryYear] = deliveryDate.split("-").map(Number);

    const order = new Date(orderYear, orderMonth - 1, orderDay);
    const delivery = new Date(deliveryYear, deliveryMonth - 1, deliveryDay);

    return delivery >= order;
  };

  const onDateChange = (event, selectedDate) => {
    setShow(false);

    if (event.type === "dismissed") {
      return;
    }

    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      if (datePickerType === "orderDate") {
        setOrderDate(formattedDate);
      } else if (datePickerType === "deliveryDate") {
        if (!compareDates(orderDate, formattedDate)) {
          Alert.alert(
            "Invalid Date",
            "Delivery date cannot be earlier than the order date."
          );
          return;
        }
        setDeliveryDate(formattedDate);
      }
    }
  };

  const handleInputChange = (input, text) => {
    setMeasurements((prevMeasurements) =>
      prevMeasurements.map((m) =>
        m.name === input.name ? { ...m, value: text, label: input.label } : m
      )
    );
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200}
      style={styles.container}
    >
      <Spinner
        visible={loading}
        color="#C2CCD3"
        textContent={"Loading..."}
        textStyle={styles.spinnerTextStyle}
      />
      {!loading && (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#9Bd35A", "#689F38"]}
              tintColor="blue"
            />
          }
          ref={scrollViewRef}
          nestedScrollEnabled={true}
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={styles.scrollViewContent}
        >
          <TextInput
            label="Customer Name"
            value={customerName}
            maxLength={50}
            ref={customerNameRef}
            theme={{ colors: { primary: "#1F4E67" } }}
            style={{ alignSelf: "center", width: "90%", margin: 10 }}
            onChangeText={(customerName) => setcustomerName(customerName)}
            error={!!errors.nameError}
          />
          <HelperText type="error" visible={!!errors.nameError}>
            <Text style={{ fontWeight: "bold", color: "red" }}>
              {errors.nameError}
            </Text>
          </HelperText>
          <TextInput
            label="Customer Mobile Number"
            value={customerMobileNumber}
            ref={customerMobileNumberRef}
            maxLength={10}
            theme={{ colors: { primary: "#1F4E67" } }}
            style={{ alignSelf: "center", width: "90%", margin: 10 }}
            keyboardType="phone-pad"
            onChangeText={(customerMobileNumber) =>
              setcustomerMobileNumber(customerMobileNumber)
            }
            error={!!errors.mobileError}
          />
          <HelperText type="error" visible={!!errors.mobileError}>
            <Text style={{ fontWeight: "bold", color: "red" }}>
              {errors.mobileError}
            </Text>
          </HelperText>
          <View style={styles.dateContainer}>
            <TextInput
              ref={orderDateRef}
              label="Ordered Date"
              value={orderDate}
              maxLength={10}
              theme={{ colors: { primary: "#1F4E67" } }}
              style={styles.dateInput}
              editable={false}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => showDatePicker("orderDate")}
                />
              }
            />
            <TextInput
              ref={deliveryDateRef}
              label="Delivery Date"
              value={deliveryDate}
              maxLength={10}
              theme={{ colors: { primary: "#1F4E67" } }}
              style={styles.dateInput}
              keyboardType="phone-pad"
              editable={false}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => showDatePicker("deliveryDate")}
                />
              }
            />
          </View>
          {show && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              width: "90%",
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: "#C2CCD3",
                fontSize: 15,
                alignSelf: "center",
                margin: 10,
              }}
            >
              MEASUREMENT
            </Text>
          </View>
          <View style={styles.measurementContainer}>
            {inputFields.map((input, index) => {
              return (
                <AddCustTextInput
                  key={index}
                  label={input.label}
                  value={
                    measurements.find((m) => m.name === input.name)?.value || ""
                  }
                  maxLength={input.maxLength}
                  keyboardType={input.keyboardType}
                  onChange={(text) => handleInputChange(input, text)}
                />
              );
            })}
          </View>
          <Divider style={{ width: "90%", alignSelf: "center", margin: 0 }} />
          <View style={{ padding: 16, width: "100%" }}>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 10,
                alignSelf: "center",
                fontWeight: "bold",
                color: "#C2CCD3",
              }}
            >
              Select Item
            </Text>
            <Picker
              mode="dialog"
              selectedValue={selectedValue}
              style={{
                width: "90%",
                height: 35,
                marginBottom: 14,
                backgroundColor: "#C2CCD3",
                fontWeight: "bold",
                alignSelf: "center",
              }}
              onValueChange={(itemValue) => setSelectedValue(itemValue)}
            >
              {pickerSelection.map((item, index) => (
                <Picker.Item
                  style={{ fontSize: 16, fontWeight: "bold" }}
                  label={item}
                  value={item}
                  key={index}
                />
              ))}
            </Picker>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <InputSpinner
                max={100}
                min={1}
                skin="square"
                value={spinnerValue}
                onChange={(value) => setSpinnerValue(value)}
                inputStyle={{
                  color: "#1F4E67",
                }}
                style={{ width: "45%" }}
              />
              <Button
                textColor="#C2CCD3"
                mode="outlined"
                buttonColor="#3E525F"
                onPress={() => handleTableData()}
              >
                Add
              </Button>
            </View>
          </View>
          <View style={styles.tableContainer}>
            <View style={styles.header}>
              <Text style={styles.heading}>Item</Text>
              <Text style={styles.heading}>Qty</Text>
              <Text style={styles.heading}>Cost</Text>
              <Text style={styles.heading}>Edit</Text>
            </View>
            <FlatList
              data={tableData}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
            <Modal
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <SafeAreaView style={styles.modal}>
                <View style={styles.modalContainer}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <AWIcon
                      style={{
                        alignSelf: "flex-end",
                        marginRight: 5,
                        marginTop: 5,
                      }}
                      name="close"
                      size={20}
                      color="#C2CCD3"
                    />
                  </TouchableOpacity>
                  <View style={styles.modalBodyContainer}>
                    <Picker
                      mode="dialog"
                      selectedValue={editselectedValue}
                      style={{
                        width: "80%",
                        height: 35,
                        backgroundColor: "#C2CCD3",
                        fontWeight: "bold",
                        alignSelf: "center",
                      }}
                      enabled={false}
                      onValueChange={(itemValue) => {
                        setEditSelectedValue(itemValue);
                      }}
                    >
                      {pickerSelection.map((item, index) => (
                        <Picker.Item
                          style={{ fontSize: 16, fontWeight: "bold" }}
                          label={item}
                          value={item}
                          key={index}
                        />
                      ))}
                    </Picker>
                    <InputSpinner
                      max={100}
                      min={1}
                      skin="square"
                      value={editspinnerValue}
                      onChange={(value) => handleSpinnerChange(value)}
                      inputStyle={{
                        color: "#1F4E67",
                      }}
                      style={{ width: "50%", alignSelf: "center", margin: 10 }}
                    />
                    <Text
                      style={{
                        alignSelf: "center",
                        marginTop: 10,
                        fontWeight: "bold",
                        color: "#C2CCD3",
                      }}
                    >
                      Cost
                    </Text>
                    <TextInput
                      value={cost}
                      maxLength={10}
                      style={{
                        width: "45%",
                        alignSelf: "center",
                        textAlign: "center",
                        marginTop: 4,
                      }}
                      keyboardType="phone-pad"
                      onChangeText={(cost) => setCost(cost)}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "space-around",
                        marginTop: 20,
                      }}
                    >
                      <Button
                        mode="contained"
                        style={{
                          width: "30%",
                          backgroundColor: "#21ba45",
                        }}
                        onPress={() => handleUpdate()}
                      >
                        Update
                      </Button>
                      <Button
                        mode="contained"
                        style={{
                          width: "30%",
                          backgroundColor: "#db2828",
                        }}
                        onPress={() => handleDeleteData()}
                      >
                        Delete
                      </Button>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>
            <Divider
              style={{ width: "100%", alignSelf: "center", margin: 8 }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignSelf: "center",
                width: "100%",
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#C2CCD3" }}>
                Total Order Value
              </Text>
              <Text
                style={{ fontWeight: "bold", color: "#C2CCD3" }}
              >{`Rs.${totalOrderValue}`}</Text>
            </View>
            <Divider
              style={{ width: "100%", alignSelf: "center", margin: 8 }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignSelf: "center",
                width: "100%",
              }}
            >
              <Text
                style={{ fontWeight: "bold", color: "#C2CCD3", paddingTop: 9 }}
              >
                Advance
              </Text>
              <TextInput
                value={advance}
                maxLength={10}
                style={{
                  width: "35%",
                  height: 40,
                  textAlign: "center",
                }}
                keyboardType="phone-pad"
                onChangeText={(advance) => handleAdvance(advance)}
                editable={totalOrderValue > 0}
              />
            </View>
            <Divider
              style={{ width: "100%", alignSelf: "center", margin: 8 }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignSelf: "center",
                width: "100%",
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#C2CCD3" }}>
                Balance
              </Text>
              <Text
                style={{ fontWeight: "bold", color: "#C2CCD3" }}
              >{`Rs.${balance}`}</Text>
            </View>
            <Divider
              style={{ width: "100%", alignSelf: "center", margin: 8 }}
            />
            <Text style={{ fontWeight: "bold", color: "#C2CCD3" }}>
              Select Payment Method
            </Text>
            <View style={{ padding: 0 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Checkbox
                    status={checkedCash ? "checked" : "unchecked"}
                    onPress={() => setCheckedCash(!checkedCash)}
                    color="#E1D9D1"
                    uncheckedColor="#E1D9D1"
                  />
                  <Text style={{ marginLeft: -4, color: "#C2CCD3" }}>Cash</Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 10,
                  }}
                >
                  <Checkbox
                    status={checkedUPI ? "checked" : "unchecked"}
                    onPress={() => setCheckedUPI(!checkedUPI)}
                    color="#E1D9D1"
                    uncheckedColor="#E1D9D1"
                  />
                  <Text style={{ marginLeft: -4, color: "#C2CCD3" }}>UPI</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 10,
                  }}
                >
                  <Checkbox
                    status={checkedCreditCard ? "checked" : "unchecked"}
                    onPress={() => setCheckedCreditCard(!checkedCreditCard)}
                    color="#E1D9D1"
                    uncheckedColor="#E1D9D1"
                  />
                  <Text style={{ marginLeft: -4, color: "#C2CCD3" }}>
                    Credit Card
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignSelf: "center",
                marginTop: 15,
                alignItems: "center",
                width: "100%",
              }}
            >
              <TouchableOpacity
                onPress={() => handleCamera()}
                style={styles.camContainer}
              >
                <CamIcon name="camera-plus" size={28} color="#C2CCD3" />
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 12,
                    color: "#C2CCD3",
                    padding: 8,
                  }}
                >
                  Add Fabric
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.containerImage}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  resizeMethod="resize"
                  source={{ uri: image }}
                  style={styles.image}
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View
            style={{
              alignSelf: "center",
              width: "100%",
              marginTop: 10,
              flexDirection: "column-reverse",
              gap: 10,
            }}
          >
            {isLoadingShare ? (
              <ActivityIndicator size="large" color="#21ba45" />
            ) : (
              <Button
                style={{
                  width: "80%",
                  alignSelf: "center",
                  backgroundColor: "#21ba45",
                }}
                mode="contained"
                onPress={() => submitPdf("share")}
              >
                Share
              </Button>
            )}
          </View>
          <View
            style={{
              alignSelf: "center",
              width: "100%",
              marginTop: 10,
              flexDirection: "column-reverse",
              gap: 10,
            }}
          >
            {isLoadingSave ? (
              <ActivityIndicator size="large" color="red" />
            ) : (
              <Button
                style={{
                  width: "80%",
                  alignSelf: "center",
                  backgroundColor: "#3E525F",
                }}
                mode="contained"
                onPress={() => submitPdf("save")}
              >
                Save
              </Button>
            )}
          </View>
          <View
            style={{
              alignSelf: "center",
              width: "100%",
              marginTop: 10,
              marginBottom: 20,
              flexDirection: "column-reverse",
              gap: 10,
            }}
          >
            <Button
              style={{
                width: "80%",
                alignSelf: "center",
                backgroundColor: "#239ED0",
              }}
              mode="contained"
              onPress={() => handleCompleteOrder("save")}
            >
              Next Order
            </Button>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F4E67",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    margin: 14,
  },
  dateInput: {
    width: "45%",
    fontSize: 12,
  },
  measurementContainer: {
    justifyContent: "space-between",
    flexWrap: "wrap",
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    margin: 5,
  },
  selectItemContainer: {
    justifyContent: "space-between",
    flexWrap: "wrap",
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
  tableContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
    alignSelf: "center",
    marginTop: 10,
  },
  headerTopBar: {
    backgroundColor: "#44B09E",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2,
    marginBottom: 15,
    alignItems: "center",
  },
  headerTopBarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#3E525F",
    padding: 10,
    borderRadius: 6,
  },
  heading: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#C2CCD3",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    marginHorizontal: 2,
    elevation: 1,
    borderRadius: 3,
    borderColor: "#fff",
    padding: 10,
    backgroundColor: "#fff",
  },
  cell: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "justify",
    flex: 1,
  },
  cellQty: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
    textAlign: "justify",
    flex: 1,
  },
  modal: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#1F4E67",
    width: "90%",
    borderRadius: 10,
  },
  modalBodyContainer: {
    paddingVertical: 50,
    paddingHorizontal: 5,
  },
  camContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F4E67",
    padding: 20,
    alignSelf: "center",
    height: 85,
    width: 150,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#C2CCD3",
  },
  imageList: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    margin: 6,
    justifyContent: "space-between",
    position: "relative",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  cancelButton: {
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: 15,
    padding: 5,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
  containerImage: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerTextStyle: {
    color: "#C2CCD3",
  },
});

export default AddCustomer;
