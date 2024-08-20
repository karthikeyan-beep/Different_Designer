import React from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/EvilIcons';
import { TextInput, RadioButton, Text } from "react-native-paper";

const AddCustomer = () => {
  const [customerName, setcustomerName] = React.useState("");
  const [customerMobileNumber, setcustomerMobileNumber] = React.useState("");
  const [orderDate, setOrderDate] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [datePickerType, setDatePickerType] = React.useState("");
  const [checked, setChecked] = React.useState("Male");
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

  const formatDate = (date) => {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }

    return `${day}-${month}-${year}`;
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
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
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#C2CCD3", fontSize: 15 }}>
          MEASUREMENT
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          width: "90%",
          alignItems: "center",
          margin: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#C2CCD3", fontSize: 12, marginRight:5 }}>
          Select Measurement Type
        </Text>
        <Icon name="plus" size={28} />
      </View>
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
    margin: 10,
  },
  dateInput: {
    width: "45%",
    fontSize: 12,
  },
});

export default AddCustomer;
