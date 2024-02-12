import React, { useState, useEffect } from "react";
import { TextField, Button, Grid } from "@mui/material";
import BitrateCard from "./BitrateCard";
import StatusCard from "./StatusCard";
import DeviceListTable from "./DeviceListTable"; // Import the DeviceListTable component
import ConnectionDetailsTable from "./ConnectionDetailsTable"; // Import the ConnectionDetailsTable component
import Axios from "axios";
import './AGVDetails.css';
import ChartComponent from "./ChartComponent"; 

const AGVDetails = () => {
  const [agvName, setAGVName] = useState("");
  const [wifiDetails, setWifiDetails] = useState(null);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const handleInputChange = (e) => {
    setAGVName(e.target.value);
  };
  const BoxStyle = {
    border: "2px solid #00005b",
    borderRadius: "10px",
    padding: "20px",
    background: "#ffffff",
    width: "95%",
    margin: "10px auto",
  };

  const NodeIdBoxStyle = {
    ...BoxStyle,
    position: "absolute",
    top: -270,
    right: -100,
    margin: 0, // Adjust the margin as needed
  };


  const fetchWifiDetails = async () => {
    try {
      // Fetch WiFi details from ConnectionDetailsTable
      const wifiResponse = await Axios.get(
        `http://localhost:8080/wifitool/api/agv/wifi-details?deviceName=${agvName}`
      );
      console.log('WiFi Response:', wifiResponse);
  
      // Extract the first item from the array
      const firstWifiData = wifiResponse.data[0];
  
      // Fetch device details from DeviceListTable
      const deviceResponse = await Axios.get(
        `http://localhost:8080/wifitool/api/agv/device-details?deviceName=${agvName}`
      );
      console.log('Device Response:', deviceResponse);
  
      const deviceData = deviceResponse.data;
  
      setWifiDetails(firstWifiData);
      setDeviceDetails(deviceData);
      setShowChart(true);
    } catch (error) {
      console.error("Error fetching WiFi details:", error);
    }
  };

  useEffect(() => {
    // Fetch initial data when the component mounts
    fetchWifiDetails();
  }, []);

  return (
     <div className="textfield">
    <Grid container spacing={2}>
      {/* Device Details */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="AGV Name"
          variant="outlined"
          width="50%"
          value={agvName}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button variant="contained" color="primary" onClick={fetchWifiDetails}>
          Get AGV Details
        </Button>
      </Grid>
  
        {/* WiFi Details */}
        {wifiDetails && (
          <Grid item xs={12} sm={8}>
            <div style={BoxStyle}>
              <h2>WiFi Details</h2>
              <p>Device Name: {wifiDetails.WifiDetails.DeviceName}</p>
              <p>SNR: {wifiDetails.WifiDetails.SNR}</p>
              <p>Noise: {wifiDetails.WifiDetails.Noise}</p>
              <p>RSSI: {wifiDetails.WifiDetails.RSSI}</p>
            </div>
          </Grid>
        )}

        {deviceDetails && (
          <Grid item xs={12} sm={8}>
            <div style={BoxStyle}>
              <h2>Device Details</h2>
              {deviceDetails.map((device, index) => (
                <div key={index}>
                  <p>Device Name: {device.deviceName}</p>
                  <p>IP Address: {device.ipAddress}</p>
                  <p>Connection Status: {device.connectionStatus ? "Connected" : "Disconnected"}</p>
                  <p>MAC Address: {device.macAddress}</p>
                  <p>Uptime: {device.uptime}</p>
                </div>
              ))}
            </div>
          </Grid>
        )}

        {wifiDetails && (
          <Grid item xs={9} sm={3} style={{ position: "relative" }}>
            <div style={NodeIdBoxStyle}>
              <h3>Wi-Fi Signal Strength</h3>
              {/*<p><b>{wifiDetails.WifiDetails.LastNodeId}</b></p>*/}
            </div>
          </Grid>
        )}
         {/* Chart Component */}
         {showChart && (
          <Grid item xs={12} sm={12}>
            <ChartComponent agvName={agvName} />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default AGVDetails;
