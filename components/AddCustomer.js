import React from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { TextInput } from "react-native-paper";

const AddCustomer = () => {
  const [customerName, setcustomerName] = React.useState("");
  const [customerMobileNumber, setcustomerMobileNumber] = React.useState("");
  const [orderDate, setOrderDate] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [datePickerType, setDatePickerType] = React.useState("");
  const [show, setShow] = React.useState(false);

  const showDatePicker = async (type) => {
    setDatePickerType(type);
    setShow(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate); 
      if (datePickerType === 'orderDate') {
        setOrderDate(formattedDate);
      } else if (datePickerType === 'deliveryDate') {
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
              onPress={() => showDatePicker('orderDate')}
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
          right={<TextInput.Icon icon="calendar" onPress={() => showDatePicker('deliveryDate')}/>}
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
