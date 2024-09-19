import React, {useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/AntDesign";
import SetIcon from "react-native-vector-icons/Ionicons";
import Welcome from "./components/Welcome";
import AddCustomer from "./components/AddCustomer";
import ViewCustomer from "./components/ViewCustomer";
import Settings from "./components/Settings";
import { TouchableOpacity } from "react-native";

const Stack = createNativeStackNavigator();

export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerTitleAlign: "center" }}
      >
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{
            title: "Different Designer",
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: "#1F4E67",
           },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 24,
              color: "#C2CCD3",
            },
            headerLeft: () => (
              <Icon name="dingding-o" size={30} color="black" />
            ),
          }}
        />
        <Stack.Screen
          name="AddCustomer"
          component={AddCustomer}
          options={({ navigation }) => ({
            headerStyle: { backgroundColor: "#1F4E67" },
            headerTintColor: "#C2CCD3",
            //SSSheaderTitle: `Order No :`,
            animation:'slide_from_right',
            headerShadowVisible: false,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={{ marginRight: 15 }}
              >
                <SetIcon name="settings" size={24} color="#C2CCD3" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="ViewCustomer"
          component={ViewCustomer}
          options={{
            headerStyle: { backgroundColor: "#1F4E67" },
            headerTintColor: "#C2CCD3",
            headerTitle: 'VIEW BILL',
            animation:'slide_from_right',
            headerShadowVisible: false
          }}
        />
         <Stack.Screen
          name="Settings"
          component={Settings}
          options={{
            headerStyle: { backgroundColor: "#1F4E67" },
            headerTintColor: "#C2CCD3",
            headerTitle: 'Settings',
            animation:'slide_from_right',
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
