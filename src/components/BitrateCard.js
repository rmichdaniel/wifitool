import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import DownloadingIcon from '@mui/icons-material/Downloading';

const BitrateCard = ({ bitrate }) => {
  return (
    <Card sx={{ width: "150px", marginRight: "20px" }}>
      <CardContent>
        <DownloadingIcon />
        <Typography variant="h6" component="div">
          Bitrate
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {bitrate}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BitrateCard;
