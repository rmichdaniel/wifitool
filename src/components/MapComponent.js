import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './MapComponent.css';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const MapComponent = () => {
  const [mapData, setMapData] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState('AGV01');
  const [recentRSSI, setRecentRSSI] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/wifitool/api/map');
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (mapData && mapData.version === 98) {
      // Calculate the extent of x and y coordinates
      const xExtent = d3.extent(mapData.nodes, d => d.nodePosition.x);
      const yExtent = d3.extent(mapData.nodes, d => d.nodePosition.y);

      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const width = 275 - margin.left - margin.right;
      const height = 700 - margin.top - margin.bottom;

      const xScale = d3.scaleLinear()
        .domain(xExtent)
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([0, height]);

      // Clear existing content
      d3.select('#map-container').select('svg').remove();

      // Create SVG container
      const svg = d3.select('#map-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top}) rotate(180, ${width / 2}, ${height / 2})`);
      svg.append('defs')
        .html(`
        <filter id="outer-glow-green" width="500%" height="600%" x="-200%" y="-200%">
        <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
        <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
        <feFlood flood-color="#70AD46" result="glowColor" />
        <feComposite in="glowColor" in2="blurred" operator="in" result="circularGlow" />
        <feMerge>
          <feMergeNode in="circularGlow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="outer-glow-yellow" width="500%" height="600%" x="-50%" y="-50%">
      <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
      <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
      <feFlood flood-color="#FED966" result="glowColor" />
      <feComposite in="glowColor" in2="blurred" operator="in" result="circularGlow" />
      <feMerge>
              <feMergeNode in="circularGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
    </filter>

    <filter id="outer-glow-orange" width="500%" height="600%" x="-50%" y="-50%">
      <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
      <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
      <feFlood flood-color="#FFC001" result="glowColor" />
      <feComposite in="glowColor" in2="blurred" operator="in" operator="circularGlow" />
      <feMerge>
              <feMergeNode in="circularGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
    </filter>

    <filter id="outer-glow-red" width="500%" height="600%" x="-50%" y="-50%">
      <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
      <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
      <feFlood flood-color="#FD0100" result="glowColor" />
      <feComposite in="glowColor" in2="blurred" operator="in" operator="circularGlow" />
      <feMerge>
              <feMergeNode in="circularGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
    </filter>
        `);


      // Create circles for each node
      svg.selectAll('circle')
        .data(mapData.nodes)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.nodePosition.x))
        .attr('cy', d => yScale(d.nodePosition.y))
        .attr('r', 5)
        .attr('filter', d => {
          const recentData = recentRSSI.find(item => item.lastNodeId === d.nodeId);
          const rssi = recentData ? recentData.recentRSSI : null;

          // Choose the appropriate filter based on the RSSI value
          if (rssi !== null) {
            if (rssi > -50) return 'url(#outer-glow-green)';
            else if (rssi > -60) return 'url(#outer-glow-yellow)';
            else if (rssi > -70) return 'url(#outer-glow-orange)';
            else return 'url(#outer-glow-red)';
          } else {
            return null; // No filter for nodes with no recent RSSI data
          }
        })
        .attr('fill', 'blue')

      // Add labels for each node at the rotated positions
      svg.selectAll('text')
        .data(mapData.nodes)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.nodePosition.x) + 5)
        .attr('y', d => yScale(d.nodePosition.y) + 8)
        .text(d => d.nodeId)
        .attr('font-size', '10px')
        .attr('fill', 'black');
      const connections = [
        ['22', '24', '21', '42'],
        ['28', '29', '30', '35', '36', '37', '38'],
        ['25', '26', '27'],
        ['5', '6'],
        ['33', '32', '31'],
        ['1', '2'],
        ['41', '40', '4', '39'],
        ['7', '3']
      ];

      // Draw straight lines
      connections.forEach(nodes => {
        svg.selectAll('.line')
          .data(d3.pairs(nodes, (a, b) => [mapData.nodes.find(d => d.nodeId === a), mapData.nodes.find(d => d.nodeId === b)]))
          .enter()
          .append('line')
          .attr('x1', d => xScale(d[0].nodePosition.x))
          .attr('y1', d => yScale(d[0].nodePosition.y))
          .attr('x2', d => xScale(d[1].nodePosition.x))
          .attr('y2', d => yScale(d[1].nodePosition.y))
          .attr('stroke', '#48494B')
          .attr('stroke-width', 2);
      });


      // Draw curves
      const drawCurve = (startNodeId, endNodeId, tension) => {
        const startNode = mapData.nodes.find(d => d.nodeId === startNodeId);
        const endNode = mapData.nodes.find(d => d.nodeId === endNodeId);

        svg.append('path')
          .attr('d', `
                M ${xScale(startNode.nodePosition.x)} ${yScale(startNode.nodePosition.y)}
                Q ${xScale(startNode.nodePosition.x)} ${(yScale(startNode.nodePosition.y) + yScale(endNode.nodePosition.y)) / 2}
                  ${xScale(endNode.nodePosition.x)} ${yScale(endNode.nodePosition.y)}
              `)
          .attr('fill', 'none')
          .attr('stroke', '#48494B')
          .attr('stroke-width', 2);
      };

      // Draw specific curves
      drawCurve('22', '25', 1.0);
      drawCurve('42', '41', 0.5);
      drawCurve('28', '27', 0.5);
      drawCurve('38', '39', 0.5);
      drawCurve('2', '41', 0.5);
      drawCurve('7', '4', 0.5);
      drawCurve('36', '31', 0.5);
      drawCurve('21', '33', 0.5);
      drawCurve('5', '26', 0.5);

    }else if(mapData && mapData.version === 548){
      // Calculate the extent of x and y coordinates
      const xExtent = d3.extent(mapData.nodes, d => d.nodePosition.x);
      const yExtent = d3.extent(mapData.nodes, d => d.nodePosition.y);

      const margin = { top: 40, right: 40, bottom: 40, left: 40 };
      const width = 2500
      const height = 2000
      const translateX = 30;
      const translateY = 30;

      const xScale = d3.scaleLinear()
        .domain(xExtent)
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([0, height]);

      // Clear existing content
      d3.select('#map-container').select('svg').remove();

      // Create SVG container
      const svg = d3.select('#map-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2 + translateX},${height / 2 + translateY}) rotate(-180)`)
        .append('g') // Nested group for further transformations
        .attr('transform', `translate(${-width / 2},${-height / 2})`);

        svg.append('defs')
        .html(`
        <filter id="outer-glow-green" width="500%" height="600%" x="-200%" y="-200%">
        <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
        <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
        <feFlood flood-color="#70AD46" result="glowColor" />
        <feComposite in="glowColor" in2="blurred" operator="in" result="circularGlow" />
        <feMerge>
          <feMergeNode in="circularGlow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="outer-glow-yellow" width="500%" height="600%" x="-50%" y="-50%">
      <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
      <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
      <feFlood flood-color="#FED966" result="glowColor" />
      <feComposite in="glowColor" in2="blurred" operator="in" result="circularGlow" />
      <feMerge>
              <feMergeNode in="circularGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
    </filter>

    <filter id="outer-glow-orange" width="500%" height="600%" x="-50%" y="-50%">
      <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
      <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
      <feFlood flood-color="#FFC001" result="glowColor" />
      <feComposite in="glowColor" in2="blurred" operator="in" operator="circularGlow" />
      <feMerge>
              <feMergeNode in="circularGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
    </filter>

    <filter id="outer-glow-red" width="500%" height="600%" x="-50%" y="-50%">
      <feMorphology operator="dilate" radius="30" in="SourceAlpha" result="thicken" />
      <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
      <feFlood flood-color="#FD0100" result="glowColor" />
      <feComposite in="glowColor" in2="blurred" operator="in" operator="circularGlow" />
      <feMerge>
              <feMergeNode in="circularGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
    </filter>
        `);

      // Create circles for each node
      svg.selectAll('circle')
        .data(mapData.nodes)
        .enter()
        .append('circle')
        .attr('cx', d => d.nodePosition ? width - xScale(d.nodePosition.x) : 0) // Flip horizontally
        .attr('cy', d => d.nodePosition ? yScale(d.nodePosition.y) : 0)
        .attr('r', 5)
        .attr('filter', d => {
          const recentData = recentRSSI.find(item => item.lastNodeId === d.nodeId);
          const rssi = recentData ? recentData.recentRSSI : null;

          // Choose the appropriate filter based on the RSSI value
          if (rssi !== null) {
            if (rssi > -50) return 'url(#outer-glow-green)';
            else if (rssi > -60) return 'url(#outer-glow-yellow)';
            else if (rssi > -70) return 'url(#outer-glow-orange)';
            else return 'url(#outer-glow-red)';
          } else {
            return null; // No filter for nodes with no recent RSSI data
          }
        })
        .attr('fill', 'blue')

      // Add labels for each node
      svg.selectAll('text')
      .data(mapData.nodes)
      .enter()
      .append('text')
      .attr('x', d => width - xScale(d.nodePosition.x) + 5) // Flip horizontally
      .attr('y', d => yScale(d.nodePosition.y) + 8)
      .text(d => d.nodeId)
      .attr('font-size', '10px')
      .attr('fill', 'black');
      const connections = [
        ['1536', '1470'],
        ['1470', '1466'],
        ['1466', '1462'],
        ['1462', '1458'],
        ['1458', '1454'],
        ['1454', '1450'],
        ['1450', '1446'],
        ['1446', '1442'],
        ['1442', '1438'],
        ['1438', '1434'],
        ['1434', '1430'],
        ['1430', '1426'],
        ['1426', '1422'],
        ['1422', '1418'],
        ['1490', '1490'],
        ['1414', '1410'],
        ['1410', '1406'],
    ['1406', '1402'],
    ['1402', '1398'],
    ['1398', '1394'],
    ['1394', '1390'],
    ['1390', '1386'],
    ['1386', '1382'],
    ['1382', '1378'],
    ['1378', '1374'],
    ['1374', '1370'],
    ['1370', '1366'],
    ['1366', '1362'],
    ['1362', '1358'],
    ['1358', '1354'],
    ['1354', '1350'],
    ['1350', '1346'],
    ['1346', '1342'],
    ['1342', '1338'],
    ['1338', '1334'],
    ['1334', '1330'],
    ['1330', '1326'],
    ['1326', '1322'],
    ['1322', '1314'],
    ['1314', '1310'],
    ['1310', '1306'],
    ['1306', '1302'],
    ['1302', '1298'],
    ['1294', '1290'],
    ['1290', '1286'],
    ['1286', '1278'],
    ['1278', '1274'],
    ['1274', '1273'],
    ['1273', '1272'],
    ['1272', '1270'],
    ['1270', '1266'],
    ['1266', '1258'],
    ['1258', '1254'],
    ['1254', '1250'],
    ['1250', '1246'],
    ['1246', '1244'],
    ['1244', '1243'],
    ['1243', '1240'],
    ['1240', '1242'],
    ['1242', '1238'],
    ['1238', '1230'],
    ['1230', '1228'],
    ['1228', '1226'],
    ['1226', '1222'],
    ['1222', '1214'],
    ['1214', '1210'],
    ['1210', '1206'],
    ['1206', '1202'],
    ['1202', '1198'],
    ['1198', '1190'],
    ['1190', '1186'],
    ['1186', '1182'],
    ['1182', '1174'],
    ['1174', '1170'],
    ['1170', '1166'],
    ['1166', '1162'],
    ['1162', '1158'],
    ['1158', '1154'],
    ['1154', '1150'],
    ['1150', '1146'],
    ['1146', '1138'],
    ['1138', '1134'],
    ['1134', '1130'],
    ['1130', '1129'],
    ['1129', '1126'],
    ['1126', '1122'],
    ['1122', '1118'],
    ['1118', '1112'],
    ['1112', '1108'],
    ['1108', '1100'],
    ['1100', '1080'],
    ['1080', '1074'],
    ['1074', '1072'],
    ['1072', '1092'],
    ['1092', '1096'],
    ['1096', '1100'],
    ['1056', '1052'],
    ['1052', '1048'],
    ['1048', '1044'],
    ['1044', '1040'],
    ['1040', '1036'],
    ['1036', '1028'],
    ['1028', '1024'],
    ['1024', '1020'],
    ['1020', '1018'],
    ['1018', '1016'],
    ['1016', '1012'],
    ['1012', '1008'],
    ['1008', '1004'],
    ['1004', '1002'],
    ['1002', '2388'],
    ['2388', '2384'],
    ['2384', '2376'],
    ['2376', '2372'],
    ['2372', '2368'],
    ['2368', '2364'],
    ['2364', '2360'],
    ['2360', '2352'],
    ['2352', '2348'],
    ['2348', '2344'],
    ['2344', '2340'],
    ['2340', '2336'],
    ['2336', '2332'],
    ['2332', '2324'],
    ['2324', '2320'],
    ['2320', '2316'],
    ['2316', '2312'],
    ['2312', '2308'],
    ['2308', '2300'],
    ['2300', '2298'],
    ['2298', '2296'],
    ['2296', '2292'],
    ['2292', '2280'],
    ['2280', '2278'],
    ['2278', '2276'],
    ['2276', '2272'],
    ['2272', '2268'],
    ['2268', '2260'],
    ['2260', '2256'],
    ['2256', '2252'],
    ['2252', '2244'],
    ['2244', '2240'],
    ['2240', '2232'],
    ['2232', '2228'],
    ['2224', '2222'],
    ['2222', '2216'],
    ['2216', '2208'],
    ['2208', '2204'],
    ['2204', '2200'],
    ['2200', '2196'],
    ['2196', '2192'],
    ['2192', '2190'],
    ['2190', '2188'],
    ['2188', '2184'],
    ['2184', '2180'],
    ['2180', '2176'],
    ['2176', '2168'],
    ['2168', '2164'],
    ['2164', '2160'],
    ['2160', '2156'],
    ['2156', '2154'],
    ['2154', '2152'],
    ['2152', '2148'],
    ['2144', '2140'],
    ['2140', '2136'],
    ['2136', '2132'],
    ['2132', '2128'],
    ['2128', '2124'],
    ['2124', '2120'],
    ['2120', '2116'],
    ['2116', '2112'],
    ['2112', '2108'],
    ['2108', '2104'],
    ['2104', '2100'],
    ['2100', '2060','2064','1596'],
    ['2100', '2060'],
    ['1792','1782'],
    ['1812','1802'],
    ['1832','1822'],
    ['1852','1872'],
    ['1872','1862'],
    ['1914', '1902'],
    ['1934', '1922'],
    ['1954', '1942'],
    ['1974', '1962'],
    ['1994', '1980'],
    ['2014', '2002'],
    ['2032', '2022'],
    ['1536', '1516', '1512', '1508', '1500'],
    ['1536','1524'],
    ['1556','1544'],
    ['1576','1564'],
    ['1596','1584'],
    ['1616','1604'],
    ['1636','1624'],
    ['1656','1644'],
    ['1676','1664'],
    ['1688','1680'],
    ['1508', '1528', '1548', '1568', '1588', '1608', '1628', '1648', '1668', '1688'],
    ['1668', '1672', '1676', '1656', '1636', '1616', '1596', '1576', '1556', '1536'],
    ['1792','2070','2074','1748','1744'],
    ['2060', '2084', '2082', '2080', '1792', '1812', '1832', '1852', '1872', '1892', '1912', '1932', '1952', '1972', '1992', '2012', '2032', '2028', '2024', '2004', '1984', '1964', '1944', '1924', '1904', '1884', '1864', '1844', '1824', '1804', '1784', '1764', '1744', '1724', '1704', '1702']


    ];
    
    // Draw lines
    connections.forEach(nodes => {
        svg.selectAll('.line')
            .data(d3.pairs(nodes, (a, b) => [mapData.nodes.find(d => d.nodeId === a), mapData.nodes.find(d => d.nodeId === b)]))
            .enter()
            .append('line')
            .attr('x1', d => width - xScale(d[0].nodePosition.x)) // Flip horizontally
            .attr('y1', d => yScale(d[0].nodePosition.y))
            .attr('x2', d => width - xScale(d[1].nodePosition.x)) // Flip horizontally
            .attr('y2', d => yScale(d[1].nodePosition.y))
            .attr('stroke', '#48494B')
            .attr('stroke-width', 2);
    });
    // Draw curves
    const drawCurve = (startNodeId, endNodeId, controlPointX, controlPointY, tension) => {
      const startNode = mapData.nodes.find(d => d.nodeId === startNodeId);
      const endNode = mapData.nodes.find(d => d.nodeId === endNodeId);
  
      svg.append('path')
          .attr('d', `M ${width - xScale(startNode.nodePosition.x)} ${yScale(startNode.nodePosition.y)} Q ${controlPointX} ${controlPointY} ${width - xScale(endNode.nodePosition.x)} ${yScale(endNode.nodePosition.y)}`)
          .attr('fill', 'none')
          .attr('stroke', '#48494B')
          .attr('stroke-width', 2);
  };

// Draw specific curves
// ... (previous curves)
drawCurve('2144', '2148',-90,180,0.5);
drawCurve('1418', '1414',-20,215, 0.5);
drawCurve('2224', '2228',310,1960, 0.5);
drawCurve('1298', '1294',350,1940, 0.5);
    }

  }, [mapData, recentRSSI]);

  const handleGenerate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/wifitool/api/agv/lastnode-rssi?deviceName=${selectedDevice}`);
      const data = await response.json();

      // Get only the recent RSSI for each unique node
      const uniqueNodes = [...new Set(data.map(item => item.lastNodeId))];
      const recentRSSIData = uniqueNodes.map(nodeId => {
        const recentData = data.find(item => item.lastNodeId === nodeId);
        return {
          lastNodeId: nodeId,
          recentRSSI: recentData ? recentData.rssi : null,
        };
      });

      // Log the recent RSSI in the console
      console.log('Recent RSSI:', recentRSSIData);

      // Update state with recent RSSI
      setRecentRSSI(recentRSSIData);
    } catch (error) {
      console.error('Error fetching data for selected device:', error);
    }
  };

  return (
    <div>
      <div id="map-container">
        {/* SVG container will be appended here */}
      </div>
      <FormControl fullWidth style={{ marginRight: '20px', marginTop: '15px', width: '150px' }}>
        <InputLabel id="select-device-label">Select Device</InputLabel>
        <Select
          labelId="select-device-label"
          id="select-device"
          value={selectedDevice}
          onChange={(event) => setSelectedDevice(event.target.value)}
          label="Select Device"
        >
          <MenuItem value="AGV01">AGV01</MenuItem>
          <MenuItem value="AGV02">AGV02</MenuItem>
          <MenuItem value="AGV03">AGV03</MenuItem>
          {/* Add more options as needed */}
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleGenerate} style={{ marginTop: '20px' }}>
        Generate
      </Button>
    </div>
  );
};

export default MapComponent;
