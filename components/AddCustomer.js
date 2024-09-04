import React from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  View,
  ScrollView,
  Platform,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import {
  TextInput,
  RadioButton,
  Text,
  Divider,
  Button,
} from "react-native-paper";
import InputSpinner from "react-native-input-spinner";
import Icon from "react-native-vector-icons/MaterialIcons";
import AWIcon from "react-native-vector-icons/FontAwesome";
import { formatDate } from "../functions/AddCustService";
import {
  measurementsInitialState,
  inputFields,
  pickerSelection,
  costLookup,
} from "../Constants";
import AddCustTextInput from "../common/AddCustTextInput";

const AddCustomer = () => {
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

  const [editselectedValue, setEditSelectedValue] = React.useState(
    pickerSelection[0]
  );
  const [editspinnerValue, setEditSpinnerValue] = React.useState(1);
  const [cost, setCost] = React.useState("");
  const [advance, setAdvance] = React.useState("");
  const [balance, setBalance] = React.useState(0);

  const [measurements, setMeasurements] = React.useState({
    measurementsInitialState,
  });

  const [show, setShow] = React.useState(false);
  const [tableData, setTableData] = React.useState([]);

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
        Alert.alert(
          "Duplicate Entry",
          `${selectedValue} already exists`
        );
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
        setDeliveryDate(formattedDate);
      }
    }
  };

  const handleInputChange = (name, value) => {
    setMeasurements((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200}
      style={styles.container}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={styles.scrollViewContent}
      >
        <TextInput
          label="Customer Name"
          value={customerName}
          maxLength={50}
          theme={{ colors: { primary: "#1F4E67" } }}
          style={{ alignSelf: "center", width: "90%", margin: 10 }}
          onChangeText={(customerName) => setcustomerName(customerName)}
        />
        <TextInput
          label="Customer Mobile Number"
          value={customerMobileNumber}
          maxLength={10}
          theme={{ colors: { primary: "#1F4E67" } }}
          style={{ alignSelf: "center", width: "90%", margin: 10 }}
          keyboardType="phone-pad"
          onChangeText={(customerMobileNumber) =>
            setcustomerMobileNumber(customerMobileNumber)
          }
        />
        <View style={styles.dateContainer}>
          <TextInput
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
            justifyContent: "space-between",
            width: "90%",
            alignSelf: "center",
            margin: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "55%",
            }}
          >
            <RadioButton
              value="Male"
              status={checked === "Male" ? "checked" : "unchecked"}
              onPress={() => setChecked("Male")}
              color="#C2CCD3"
              uncheckedColor="#C2CCD3"
            />
            <Text style={{ fontWeight: "bold", color: "#C2CCD3" }}>Male</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "50%",
            }}
          >
            <RadioButton
              value="Female"
              status={checked === "Female" ? "checked" : "unchecked"}
              onPress={() => setChecked("Female")}
              color="#C2CCD3"
              uncheckedColor="#C2CCD3"
            />
            <Text style={{ fontWeight: "bold", color: "#C2CCD3" }}>Female</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            width: "90%",
            margin: 10,
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
          {inputFields.map((input, index) => (
            <AddCustTextInput
              key={index}
              label={input.label}
              value={measurements[input.name]}
              maxLength={input.maxLength}
              keyboardType={input.keyboardType}
              onChange={(text) => handleInputChange(input.name, text)}
            />
          ))}
        </View>
        <Divider style={{ width: "90%", alignSelf: "center", margin: 0 }} />
        <View style={{ padding: 16, width: "100%" }}>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
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
              width: "80%",
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
                    style={{ width: "40%", alignSelf: "center", margin: 10 }}
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
          <Divider style={{ width: "100%", alignSelf: "center", margin: 8 }} />
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
          <Divider style={{ width: "100%", alignSelf: "center", margin: 8 }} />
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
                width: "40%",
                height: 40,
                textAlign: "center",
              }}
              keyboardType="phone-pad"
              onChangeText={(advance) => handleAdvance(advance)}
            />
          </View>
          <Divider style={{ width: "100%", alignSelf: "center", margin: 8 }} />
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F4E67",
    alignItems: "center",
  },
  scrollViewContent: {},
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    margin: 10,
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
    paddingVertical: 25,
    paddingHorizontal: 25,
    width: "95%",
    alignSelf: "center",
    margin: 10,
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
});

export default AddCustomer;
