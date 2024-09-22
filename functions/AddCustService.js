import { Alert, ToastAndroid } from "react-native";
import { base64Qr } from "../Constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

export const formatDate = (date) => {
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

export const savePdf = async (data) => {

  const orderNumber = data.orderNumber?.toString() || "";
  let customerName = data.customerName.replace(/\s+/g, '_');
  const filename = `Invoice_${orderNumber}_${customerName}.pdf`;
  const storedDirectoryUri = await AsyncStorage.getItem("directoryUri");

  let directoryUri = storedDirectoryUri;

  if (!directoryUri) {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      directoryUri = permissions.directoryUri;
      await AsyncStorage.setItem("directoryUri", directoryUri);
    } else {
      Alert.alert("Permission not granted for folder access");
      return;
    }
  }

  const { uri } = await Print.printToFileAsync({
    html: generateHtmlContent(data),
  });

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await FileSystem.StorageAccessFramework.createFileAsync(
    directoryUri,
    filename,
    "application/pdf"
  )
    .then(async (uri) => {
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    })
    .catch();

  ToastAndroid.showWithGravityAndOffset(
    "Save Success!",
    ToastAndroid.LONG,
    ToastAndroid.BOTTOM,
    25,
    50
  );
};

export const sharePdf = async (data) => {
  try {
    const orderNumber = data.orderNumber?.toString() || "";

    const { uri } = await Print.printToFileAsync({
      html: generateHtmlContent(data),
    });

    const fileUri = `${FileSystem.documentDirectory}Invoice_${orderNumber}_${data.customerName}.pdf`;

    await FileSystem.moveAsync({
      from: uri,
      to: fileUri,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri).then(() => {
        ToastAndroid.showWithGravityAndOffset(
          "Share Success",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      });
    } else {
      Alert.alert("Share Not available");
    }
  } catch (error) {
    Alert.alert("Error", "An error occurred while creating the PDF.");
  }
};

function generateHtmlContent(data) {
  const orderNumber = data.orderNumber?.toString() || "";
  const rows = [];

  const filteredMeasurements = data.measurements.filter(
    (m) => m.value.trim() !== ""
  );

  for (let i = 0; i < filteredMeasurements.length; i += 5) {
    rows.push(filteredMeasurements.slice(i, i + 5));
  }

  const fabricSection = data.isFabric
    ? `
    <div style="margin: 0px 60px;">
      <h3 style="text-align: center; margin-top: 15px; margin-bottom: 40px; color: #1F4E67;">FABRIC</h3>
      <div class="image-gallery">
        ${data.images.map((base64) => `<img src="${base64}" />`).join("")}
      </div>
    </div>`
    : "";

  const itemRows = data.tableData
    .map(
      (i) => `
    <tr style="border: 1px solid black;">
      <td style="padding: 4px 6px; border: 1px solid black; font-size: 12px;">${i.Item}</td>
      <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 12px;">${i.Qty}</td>
      <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 12px;">${i.Cost.toFixed(2)}</td>
    </tr>`
    )
    .join("");

  const measurementHtml = rows
    .map(
      (row) => `
  <tr>
    ${row
      .map(
        (m) => `
      <td style="padding: 4px 6px; text-align: left; font-size: 12px;">
        <span style="display: inline-block; min-width: 80px;  line-height: 1; margin-bottom: 0;"><b>${m.label}</b>:</span> 
        ${parseFloat(m.value).toFixed(2)}
      </td>`
      )
      .join("")}
  </tr>
`
    )
    .join("");

  return `
<html>
   <head>
      <style>
         .page { page-break-after: always;  }
         .image-gallery {
         display: flex;
         flex-wrap: wrap;
         gap: 10px;
         justify-content: center;
         }
         .image-gallery img {
         width: 170px;
         height: 170px;
         object-fit: cover;
         }
      </style>
   </head>
   <body>
      <div  class="page" style="margin: 0px 60px;">
         <h2 style="text-align: center; margin-top: 0px; margin-bottom: 5px; color: #1F4E67;">DIFFERENT DESIGNER</h2>
         <h5 style="text-align: center; margin-top: 0px; margin-bottom: 20px; color: #1F4E67;">The House of Ladies Wear Stitching and Embroidery Work</h5>
         <h3 style="text-align: center; margin-bottom: 20px;">INVOICE</h3>
         <div style="display: flex; align-items: flex-start;">
            <!-- Left Side Content -->
            <div style="flex: 1; padding-right: 20px;">
               <p style="font-size: 12px;"><strong>Order No:</strong> ${orderNumber}</p>
               <p style="font-size: 12px;"><strong>Order Date:</strong> ${data.orderDate}</p>
               <p style="font-size: 12px;"><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
               <p style="font-size: 12px;"><strong>Customer Name:</strong> ${data.customerName}</p>
               <p style="font-size: 12px;"><strong>Customer Contact:</strong> ${data.customerMobileNumber}</p>
            </div>
            <!-- Right Side Content -->
            <div style="text-align: right; flex: 1;">
               <h5 style="margin: 0;margin-right: 6px;">Scan to Pay</h5>
               <img src=${base64Qr}
                  alt="QR Code" style="margin-top: 6px; width: 90px; height: 90px;">
            </div>
         </div>
         <div style="display: flex; justify-content: space-between; margin-top: 5px;">
            <!-- Left Side Measurement Heading -->
            <div style="flex: 1;">
               <h5>Measurement (inch)</h5>
            </div>
            <!-- Right Side Measurements -->
            <div style="flex: 1; text-align: right;">
               <table style="width: 100%; table-layout: auto; border-collapse: separate; border-spacing: 10px;">
                  ${measurementHtml}
               </table>
            </div>
         </div>
         <!-- New Table Below Existing Table -->
         <div style="margin-top: 0px; margin-bottom: 0px; display: flex; justify-content: center; align-items: center;">
            <table style="width: 90%;  height: 70px; border-collapse: collapse; border: 1px solid black;">
               <thead style="border-collapse: collapse; border: 1px solid black;">
                  <tr style="border-collapse: collapse; border: 1px solid black;">
                     <th style="text-align: left; padding: 4px 6px; border: 1px solid black; width: 60%;">Item</th>
                     <th style="text-align: right; padding: 4px 6px; border: 1px solid black; width: 20%;">Qty</th>
                     <th style="text-align: right; padding: 4px 6px; border: 1px solid black; width: 20%;">Cost</th>
                  </tr>
               </thead>
               <tbody >
                  ${itemRows}
                  <tr>
                     <td colspan="2" style="text-align: right; padding: 4px 6px; border: 1px solid black; font-weight: bold; font-size: 12px;">Total Order Value</td>
                     <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 12px;">Rs. ${data.totalOrderValue}</td>
                  </tr>
                  <tr>
                     <td colspan="2" style="text-align: right; padding: 4px 6px; border: 1px solid black; font-weight: bold; font-size: 12px;">Advance</td>
                     <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 12px;">Rs. ${data.advance}</td>
                  </tr>
                  <tr>
                     <td colspan="2" style="text-align: right; padding: 4px 6px; font-weight: bold; border: 1px solid black; font-size: 12px;">Balance</td>
                     <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 12px;">Rs. ${data.balance}</td>
                  </tr>
                  <tr>
                     <td colspan="3" style="text-align: right; padding: 4px 6px; font-weight: bold; border: 1px solid black; font-size: 12px;">
                       Payment Mode ( ${data.isCash ? "☑" : "☐"} Cash / ${data.isUPI ? "☑" : "☐"} UPI / ${data.isCreditCard ? "☑" : "☐"} Credit Card )
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div style="margin-top: 0px;">
            <h4 style="margin-bottom: 5px;margin-top: 7px;">Terms & Conditions:</h4>
            <ul style="font-size: 12px;  margin-top: 0; ">
               <li>Fabric to be collected on or before 15 days from date of delivery.</li>
               <li>Fixed cost and avoid negotiations.</li>
            </ul>
         </div>
         <!-- Footer Text Contact Info -->
         <div style="position: absolute; bottom: 0; left: 0; width: 100%; text-align: center; font-size: 12px; padding: 10px 0; border-top: 1px solid #000; color: #1F4E67;">
            I No:52, CTA Nagar, Kattupakkam, Chennai 6000056 I +91 9789099952 I ranjani@differentdesigner.in I
         </div>
      </div>
      ${fabricSection}
   </body>
</html>
`;
}
