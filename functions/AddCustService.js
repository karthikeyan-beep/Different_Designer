import React from "react";
import { Alert } from "react-native";
import { base64Qr } from "../Constants";
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

export const generatePdf = async () => {
  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
    });

    const fileUri = `${FileSystem.documentDirectory}sample.pdf`;

    await FileSystem.moveAsync({
      from: uri,
      to: fileUri,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert("Success", `PDF saved at ${fileUri}`);
    }
  } catch (error) {
    console.error("Error creating PDF:", error);
    Alert.alert("Error", "An error occurred while creating the PDF.");
  }
};

const items = [
  { item: "Example Item 1", qty: 1, cost: 10.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
  { item: "Example Item 1", qty: 1, cost: 10.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
  { item: "Example Item 1", qty: 1, cost: 10.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
  { item: "Example Item 1", qty: 1, cost: 10.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
  { item: "Example Item 1", qty: 1, cost: 10.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
  { item: "Example Item 1", qty: 1, cost: 10.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
  { item: "Example Item 1", qty: 1, cost: 10.0 },
  { item: "Example Item 2", qty: 2, cost: 20.0 },
];

const itemRows = items
  .map(
    (i) => `
    <tr style="border: 1px solid black;">
      <td style="padding: 4px 6px; border: 1px solid black; font-size: 12px;">${i.item}</td>
      <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 12px;">${i.qty}</td>
      <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 12px;">${i.cost.toFixed(2)}</td>
    </tr>`
  )
  .join("");

const measurements = [
  { key: "chest", value: 232.0 },
  { key: "bust", value: 232.0 },
  { key: "hip", value: 2323.0 },
  { key: "shoulder", value: 233.0 },
  { key: "height", value: 13.0 },
  { key: "chest", value: 13.0 },
  { key: "bust", value: 13.0 },
  { key: "hip", value: 23.0 },
  { key: "shoulder", value: 323.0 },
  { key: "height", value: 233.0 },
  { key: "chest", value: 2323.0 },
  { key: "bust", value: 13.0 },
  { key: "hip", value: 13.0 },
  { key: "shoulder", value: 233.0 },
  { key: "height", value: 23.0 },
];

const rows = [];
for (let i = 0; i < measurements.length; i += 5) {
  rows.push(measurements.slice(i, i + 5));
}

const measurementHtml = rows
  .map(
    (row) => `
  <tr>
    ${row
      .map(
        (m) => `
      <td style="padding: 4px 6px; text-align: left; font-size: 12px;">
        <span style="display: inline-block; min-width: 80px;  line-height: 1; margin-bottom: 0;"><b>${m.key}</b>:</span> 
        ${m.value.toFixed(2)}
      </td>`
      )
      .join("")}
  </tr>
`
  )
  .join("");

const htmlContent = `
<html>
      <head>
        <style>
          .page { page-break-after: always;  }
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
  <p style="font-size: 12px;"><strong>Order No:</strong> 001</p>
  <p style="font-size: 12px;"><strong>Order Date:</strong> 05.09.2024</p>
  <p style="font-size: 12px;"><strong>Delivery Date:</strong> 15.09.2024</p>
  <p style="font-size: 12px;"><strong>Customer Name:</strong> Shakthi</p>
  <p style="font-size: 12px;"><strong>Customer Contact:</strong> 9840446222</p>
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
        <td colspan="2" style="text-align: right; padding: 4px 6px; border: 1px solid black; font-weight: bold; font-size: 10px;">Total Order Value</td>
        <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 10px;">Rs. 1750</td>
      </tr>
      <tr>
        <td colspan="2" style="text-align: right; padding: 4px 6px; border: 1px solid black; font-weight: bold; font-size: 10px;">Advance</td>
        <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 10px;">Rs. 1000</td>
      </tr>
      <tr>
        <td colspan="2" style="text-align: right; padding: 4px 6px; font-weight: bold; border: 1px solid black; font-size: 10px;">Balance</td>
        <td style="text-align: right; padding: 4px 6px; border: 1px solid black; font-size: 10px;">Rs. 750</td>
      </tr>
      <tr>
        <td colspan="3" style="text-align: right; padding: 4px 6px; font-weight: bold; border: 1px solid black; font-size: 10px;">Payment Mode (Cash/UPI/Credit card)</td>
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
 <div class="page" style="margin: 0px 60px;">
  <h3 style="text-align: center; margin-top: 15px; margin-bottom: 5px; color: #1F4E67;">FABRIC</h3>

</div>
      </body>
</html>
`;
