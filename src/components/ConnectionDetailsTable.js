import React, { useState, useEffect } from "react";
import Axios from "axios";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const tableStyles = {
  borderRadius: 13, // Add border radius
  margin: '20px 20px',
  maxWidth: 950, // Add maxWidth
};
const tableHeaderCell = {
  fontWeight: "bold",
  backgroundColor: "#E1E4F3",
  color: "#00005b",
};
const ConnectionDetailsTable = () => {
  const [wifiData, setWifiData] = useState([]);
  const calculateBackgroundColor = (rssi) => {
    if (rssi >-50 ) {
      return "#538234";
    } else if (rssi <= -50 && rssi > -60 ) {
      return "#70AD46";
    } else if (rssi <= -60 && rssi > -70) {
      return "#FED966";
    } else if (rssi <= -70) {
      return "#FD0100";
    } else {
      return "#FD0100";
    }
  };
  
    const fetchWifiDetails = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:8080/wifitool/api/agv/wifi-details/all"
        );
        const data = response.data;
        setWifiData(data);
      } catch (error) {
        console.error("Error fetching WiFi details:", error);
      }
    };
   useEffect(() => {
    fetchWifiDetails();

    const intervalId = setInterval(fetchWifiDetails, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const [selectedRow, setSelectedRow] = useState(null); // Track selected row

  // Handle row click event to select the row
  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index); // Toggle selection
  };

  return (
    <div>
      <TableContainer component={Paper} style={tableStyles}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={tableHeaderCell}>Device Name</TableCell>
              <TableCell style={tableHeaderCell}>SNR</TableCell>
              <TableCell style={tableHeaderCell}>Noise</TableCell>
              <TableCell style={tableHeaderCell}>RSSI</TableCell>
              <TableCell style={tableHeaderCell}>AP Name</TableCell>
              <TableCell style={tableHeaderCell}>SSID</TableCell>
              <TableCell style={tableHeaderCell}>Signal Quality</TableCell>
              <TableCell style={tableHeaderCell}>Status</TableCell>
              <TableCell style={tableHeaderCell}>Bitrate</TableCell>
              <TableCell style={tableHeaderCell}>Channel</TableCell>
              <TableCell style={tableHeaderCell}>Node ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wifiData.map((row, index) => (
              <TableRow
                key={index}
                className={selectedRow === index ? "selected-row" : ""}
                onClick={() => handleRowClick(index)}
              >
                <TableCell>{row.WifiDetails.DeviceName}</TableCell>
                <TableCell>{row.WifiDetails.SNR}</TableCell>
                <TableCell>{row.WifiDetails.Noise}</TableCell>
                <TableCell>{row.WifiDetails.RSSI}</TableCell>
                <TableCell>{row.WifiDetails.APName}</TableCell>
                <TableCell>{row.WifiDetails.SSID}</TableCell>
                <TableCell>{row.WifiDetails.SignalQuality}</TableCell>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    color: "white",
                    borderRadius: 8,
                    padding: "4px 10px",
                    display: "inline-block",
                    backgroundColor: calculateBackgroundColor(row.WifiDetails.RSSI),
                    marginTop: "10px",
                  }}
                >
                  {row.WifiStatus}
                </span>
                <TableCell>{row.WifiDetails.Bitrate}</TableCell>
                <TableCell>{row.WifiDetails.Channel}</TableCell>
                <TableCell>{row.WifiDetails.LastNodeId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ConnectionDetailsTable;