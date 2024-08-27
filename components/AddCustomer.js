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
import { formatDate } from "../functions/AddCustService";
import {
  measurementsInitialState,
  inputFields,
  pickerSelection,
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

  const [measurements, setMeasurements] = React.useState({
    measurementsInitialState,
  });

  const [show, setShow] = React.useState(false);

  const exampleData = [
    { id: 1, Item: "Blouse1", Qty: 1, Cost: 200 },
    { id: 2, Item: "Blouse2", Qty: 1, Cost: 200 },
    { id: 3, Item: "Blouse3", Qty: 1, Cost: 200 },
    { id: 4, Item: "Blouse4", Qty: 1, Cost: 200 },
    { id: 5, Item: "Blouse5", Qty: 1, Cost: 200 },
  ];

  const renderItem = ({ item }) => {
    return (
      <View key={item.id} style={styles.row}>
        <Text style={styles.cell}>{item.Item}</Text>
        <Text style={styles.cell}>{item.Qty}</Text>
        <Text style={styles.cell}>{item.Cost}</Text>
        <TouchableOpacity onPress={() => handleSelectedItemEdit(item.id)}>
          <Icon name="mode-edit" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleSelectedItemEdit = (id) => {
    console.log("Edit item with id:", id);
    setModalVisible(true);
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
        <View style={{ padding: 16 }}>
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
              inputStyle={{
                color: "#1F4E67",
              }}
              style={{ width: "45%" }}
            />
            <Button
              textColor="#C2CCD3"
              mode="outlined"
              buttonColor="#3E525F"
              onPress={() => console.log("")}
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
            data={exampleData}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
          <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {}}
          >
            <View style={styles.modal}>
              <View style={styles.modalContainer}>
                <View style={styles.modalBodyContainer}>
                  <Picker
                    mode="dialog"
                    selectedValue={selectedValue}
                    style={{
                      width: "80%",
                      height: 35,
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
                  <InputSpinner
                    max={100}
                    min={1}
                    skin="square"
                    inputStyle={{
                      color: "#1F4E67",
                    }}
                    style={{ width: "40%", alignSelf:"center", margin: 10 }}
                  />
                </View>
              </View>
            </View>
          </Modal>
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
    paddingVertical: 30,
    paddingHorizontal: 30,
    width: "90%",
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
    padding: 10,
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
  modal: {
    backgroundColor: "#00000099",
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
    paddingVertical:60,
    paddingHorizontal:10,
    
  },
});

export default AddCustomer;
