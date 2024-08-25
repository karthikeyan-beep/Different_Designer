import React from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  View,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { TextInput, RadioButton, Text, Divider, Button } from "react-native-paper";
import { formatDate } from "../functions/AddCustService";
import {
  measurementsInitialState,
  inputFields,
  pickerSelection,
} from "../Constants";
import AddCustTextInput from "../common/AddCustTextInput";
import InputSpinner from "react-native-input-spinner";

const AddCustomer = () => {
  const [customerName, setcustomerName] = React.useState("");
  const [customerMobileNumber, setcustomerMobileNumber] = React.useState("");
  const [orderDate, setOrderDate] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [datePickerType, setDatePickerType] = React.useState("");
  const [checked, setChecked] = React.useState("Male");
  const [selectedValue, setSelectedValue] = React.useState(pickerSelection[0]);

  const [measurements, setMeasurements] = React.useState({
    measurementsInitialState,
  });

  const [show, setShow] = React.useState(false);

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
        <Divider style={{ width: "90%", alignSelf: "center", margin:0}} />
        <View style={{ padding: 16}}>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 8,
              alignSelf:"center",
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
              height: 30,
              marginBottom: 14,
              backgroundColor: "#C2CCD3",
              alignSelf: "center",
            }}
            onValueChange={(itemValue) => setSelectedValue(itemValue)}
          >
            {pickerSelection.map((item, index) => (
              <Picker.Item
                style={{ fontSize: 16 }}
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
              justifyContent: "space-evenly"
            }}
          >
            <InputSpinner
              max={100}
              min={0}
              skin="square"
              inputStyle={{
                color: "#1F4E67",
              }}
              style={{ width: "45%" }}
            />
            <Button textColor="#C2CCD3" mode="outlined" buttonColor="#3E525F" onPress={() => console.log("")}>
              Add
            </Button>
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
    margin:5
  },
  selectItemContainer: {
    justifyContent: "space-between",
    flexWrap: "wrap",
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
});

export default AddCustomer;
