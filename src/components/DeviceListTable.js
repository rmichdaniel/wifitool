import React, { useState, useEffect } from "react";
import Axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const tableStyles = {
  borderRadius: 13,
  margin: "20px 20px",
  maxWidth: 950,
};

function DeviceListTable() {
  const [deviceData, setDeviceData] = useState([]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await Axios.get("http://localhost:8080/wifitool/api/agv/device-details");
      const data = response.data;
      setDeviceData(data);
    } catch (error) {
      console.error("Error fetching device details:", error);
    }
  };

  useEffect(() => {
    fetchDeviceDetails();

    const intervalId = setInterval(fetchDeviceDetails, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <TableContainer component={Paper} style={tableStyles}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Device Name</b></TableCell>
            <TableCell><b>IP Address</b></TableCell>
            <TableCell><b>MAC Address</b></TableCell>
            <TableCell><b>Connection Status</b></TableCell>
            <TableCell><b>Uptime</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deviceData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.deviceName}</TableCell>
              <TableCell>{row.ipAddress}</TableCell>
              <TableCell>{row.macAddress}</TableCell>
              <TableCell>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    color: "white",
                    borderRadius: 8,
                    padding: "4px 10px",
                    display: "inline-block",
                    backgroundColor: row.connectionStatus ? "green" : "red",
                  }}
>
  {row.connectionStatus ? "Connected" : "Offline"}
</span>
              </TableCell>
              <TableCell>{row.uptime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DeviceListTable;
