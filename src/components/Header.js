import React, { useState,useEffect } from "react";
import './Header.css';
import WifiIcon from '@mui/icons-material/Wifi';
import ListIcon from '@mui/icons-material/List';
import PermScanWifiIcon from '@mui/icons-material/PermScanWifi';
import MapIcon from '@mui/icons-material/Map';
import {
  AppBar,
  Button,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeviceListTable from "./DeviceListTable";
import ConnectionDetailsTable from "./ConnectionDetailsTable";
import Axios from "axios";
import AlertsTab from "./AlertsTab"; 
import ChartComponent from "./ChartComponent";
import AGVDetails from "./AGVDetails";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DescriptionIcon from '@mui/icons-material/Description';
import MapComponent from "./MapComponent";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Header = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  console.log(theme);
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  console.log(isMatch);
  const [connectionDetailsData, setConnectionDetailsData] = useState([]);
  const [uptime, setUptime] = useState(""); // Define the uptime state
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const handleShowMap = () => {
    setShowMap(true);
  };
  const handleHideMap = () => {
    setShowMap(false);
  };
  const handleSaveMap = () => {
    html2canvas(document.getElementById("map-container"),{ scale: 1 }).then((canvas) => {
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL("image/png",1), "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      
      pdf.save("map.pdf");
    });
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        await Axios.post("http://localhost:8080/wifitool/api/map/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // Optionally, you can handle success or update the UI accordingly
      } catch (error) {
        console.error("Error uploading map:", error);
        // Handle the error or update the UI accordingly
      }
    }
  };
  

  useEffect(() => {
    const fetchWifiDetails = async () => {
      try {
        const response = await Axios.get("http://localhost:8080/wifitool/api/agv/wifi-details/all");
        const data = response.data;
        setConnectionDetailsData(data);
        setUptime(data.length > 0 ? data[0].uptime : "");
         // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching WiFi details:", error);
      }
    };
    fetchWifiDetails();
  }, []);

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        const response = await Axios.get("http://localhost:8080/wifitool/api/agv/device-details");
        const data = response.data;
        setDeviceDetails(data); 
      } catch (error) {
        console.error("Error fetching device details:", error);
      }
    };
    fetchDeviceDetails();
  }, []);

  return (
    <React.Fragment>
      <AppBar sx={{ background: "#e8e8e8", margin: "0px 0",position:"fixed", top: 0, left: 0, right: 0, }}>
        <Toolbar>
        {/*<div className="logo">
            <img
              src={require('./../images/mhp.png')}
              alt="Fleetex Logo"
            />
  </div>*/}
          <div className="text" style={{ color: "#29478E" }}>
            <strong>Wlan Analysis Tool</strong>
          </div>
              <Typography sx={{ fontSize: "2rem", paddingLeft: "10%" }}>
              
              </Typography>
              <Tabs
                sx={{
                  marginLeft: "auto",
                  "& .MuiTab-root": {
                    color: "#00005b",
                     // Change text color to #00005b
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#00005b", // Change indicator color to #00005b
                  },
                }}
                indicatorColor="secondary"
                textColor="inherit"
                value={value}
                onChange={(e, value) => setValue(value)}
              >
                <Tab label="Device List" icon={<ListIcon />} />
                <Tab label="Connection Details" icon={<WifiIcon />} />
                <Tab label="AGV Details" icon={<DirectionsCarIcon />} />
                <Tab label="Alerts" icon={<PermScanWifiIcon />} />
                <Tab label="Map" icon={<MapIcon />} />
                {/*<Tab label="Logs" icon={<DescriptionIcon />}/>*/}
              </Tabs>
        </Toolbar>
      </AppBar>
      {value === 0 && (
        <div>
          <DeviceListTable />
        </div>
      )}
      {value === 1 && (
  <div className="row">
    <div className="connection-details">
      {/* Display the ConnectionDetailsTable when the "Connection Details" tab is selected*/}
      <ConnectionDetailsTable connectionDetails={connectionDetailsData} />
    </div>
      {/*<UptimeCard uptime={deviceDetails[0].uptime} />
      <BitrateCard bitrate={connectionDetailsData[0]?.WifiDetails?.Bitrate} />
      <StatusCard status={connectionDetailsData[0]?.WifiStatus} />*/}
    </div>

)}
{value === 2 && (
        <div>
          
          <AGVDetails />
        </div>
      )}
{value === 3 && (
        <div>
          {/* Include the AlertsTab component in the "Alerts" tab */}
          <AlertsTab />
        </div>
      )}
      {value === 4 && (
        <div>
          <div
          style={{
            border: "2px solid #00005b",
            borderRadius: "10px",
            padding: "20px",
            background: "#ffffff",
            width: "95%",
            margin: "10px auto",
          }}
        >
          {/* "Upload a Map" heading */}
        <Typography variant="h5" sx={{ color: "#00005b", marginBottom: "40px" }}>
          UPLOAD MAP
        </Typography>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
          />
          <Button onClick={handleUpload} style={{ fontSize: "20px", padding: "12px 20px" }}>Upload Map</Button>
          <Button onClick={handleShowMap} style={{ fontSize: "20px", padding: "12px 20px" }}>Show Map</Button>
          <Button onClick={handleHideMap} style={{ fontSize: "20px", padding: "12px 20px" }}>Hide Map</Button>
          <Button onClick={handleSaveMap} style={{ fontSize: "20px", padding: "12px 20px" }}>Save Map</Button>
          </div>

          {showMap && <MapComponent />}
        </div>
        </div>
      )}
      
    </React.Fragment>
  );
};

export default Header;