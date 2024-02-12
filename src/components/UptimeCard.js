import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const UptimeCard = ({ uptime }) => {
  return (
    <Card sx={{ width: "150px", marginRight: "20px" }}>
      <CardContent>
        <AccessTimeIcon />
        <Typography variant="h6" component="div">
          Uptime
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {uptime}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default UptimeCard;
