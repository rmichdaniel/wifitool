import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import WifiFindIcon from '@mui/icons-material/WifiFind';

const StatusCard = ({ status }) => {
  return (
    <Card sx={{ width: "150px", marginRight: "20px" }}>
      <CardContent>
        <WifiFindIcon />
        <Typography variant="h6" component="div">
          Status
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {status}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
