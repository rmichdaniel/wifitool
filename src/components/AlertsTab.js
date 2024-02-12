import React, { useState, useEffect } from "react";
import Axios from "axios";
import Alert from "@mui/material/Alert";

const AlertsTab = () => {
  const [alerts, setAlerts] = useState([]);
  

  const fetchAlerts = async () => {
    try {
      const response = await Axios.get("http://localhost:8080/wifitool/api/agv/wifi-details/all");
      const data = response.data;

      // Generate alerts based on WifiStatus
      const generatedAlerts = data.map((wifiDetail) => {
        const wifiStatus = wifiDetail.WifiStatus;
        const bitrate = wifiDetail.WifiDetails.Bitrate;
        let description = "";
        let severity = "";
        let timestamp = wifiDetail.WifiDetails.Timestamp; // Get timestamp
        let deviceName = wifiDetail.WifiDetails.DeviceName; // Get deviceName
        let rssi = wifiDetail.WifiDetails.RSSI; // Get RSSI
        let status = ""; // Add status

        if (wifiStatus === "Excellent") {
          description = "The Wifi connection is very reliable";
          severity = "Success";
          status = "Normal";
        } else if (wifiStatus === "Moderate" || wifiStatus === "Good") {
          description = "The Wifi connection is reliable";
          severity = "Info";
          status = "Normal";
        } else if (wifiStatus === "High") {
          description = "The AGV is highly likely to lose connection with the Network. Please ensure connectivity";
          severity = "Warning";
          status = "Critical";
        }
        else if (bitrate <= 10000) {
          description = "The Bitrate is very low and the AGV might lose connection. Please ensure connectivity";
          severity = "Warning";
          status = "Critical";
        } else {
          description = "The Wifi connection is getting bad. Please check the wifi connection";
          severity = "Error";
          status = "Critical";
        }

        return {
          timestamp,
          deviceName,
          rssi,
          description,
          severity,
          status,
        };
      });

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error("Error fetching WiFi details:", error);
    }
  };

  useEffect(() => {
    // Fetch alerts initially
    fetchAlerts();

    // Set up interval to fetch alerts every 5 seconds
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    // Clean up the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          severity={alert.severity.toLowerCase()}
          variant="outlined"
        >
          <strong>{alert.deviceName}</strong> - {alert.description} (RSSI: {alert.rssi}, <strong>Status: {alert.status}</strong>)
          <br />
          Timestamp: {alert.timestamp}
        </Alert>
      ))}
    </div>
  );
};

export default AlertsTab;
