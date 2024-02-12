import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,CartesianGrid } from 'recharts';
import './ChartComponent.css';

const ChartComponent = ({ agvName }) => {
  const [data, setData] = useState([]);

  const [timeIntervalMinutes, setTimeIntervalMinutes] = useState(15); // Default to 15 minutes

  const updateData = (newData) => {
    setData((prevData) => {
      const updatedData = [...prevData];

      // Append new data
      updatedData.push(newData);

      // Limit the total number of data points based on the selected time interval
      const maxDataPoints = timeIntervalMinutes;
      if (updatedData.length > maxDataPoints) {
        updatedData.shift();
      }

      return updatedData;
    });
  };
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/wifitool/api/agv/wifi-details?deviceName=${agvName}`);
      const jsonData = await response.json();

      if (jsonData.length > 0 && jsonData[0].WifiDetails) {
        const timestamp = new Date(jsonData[0].WifiDetails.Timestamp).toLocaleTimeString();
        const rssi = jsonData[0].WifiDetails.RSSI;

        updateData({ label: timestamp, value: rssi });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchData, 10 * 1000); // Fetch data every 5 seconds

    // Fetch data immediately when the component mounts
    fetchData();

    return () => clearInterval(intervalId);
  }, [agvName, timeIntervalMinutes]);
  const handleTimeIntervalChange = (event) => {
    const selectedMinutes = parseInt(event.target.value);
    setTimeIntervalMinutes(selectedMinutes);
  };

  // Configure the y-axis scale
  const yAxisOptions = {
    domain: [-80, -30], // Set the domain (min and max values) for the y-axis
  };

  return (
    <div className="ChartComponent">
      <div>
        <label>Select a time interval (minutes):</label>
        <select value={timeIntervalMinutes} onChange={handleTimeIntervalChange}>
          <option value={15}>15</option>
          <option value={30}>30</option>
          <option value={45}>45</option>
          <option value={60}>60</option>
          {/* Add more options as needed */}
        </select>
        &nbsp;minutes
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis {...yAxisOptions} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" name="RSSI" stroke="blue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
