// pages/api/chart.png.js
import fetch from 'node-fetch';
import 'chartjs-adapter-moment';
// Register the date adapter
const width = 800; // Set chart width
const height = 600; // Set chart height

const canvasRenderService = new CanvasRenderService(width, height);
import { CanvasRenderService } from 'chartjs-node-canvas';

let maxPrice = 0;
export default async function handler(req, res) {
  // Fetch data
  const rawData = await fetch('https://jare.cake.best/goodCache.json')
    .then((response) => response.json())
    .catch((error) => console.error('Error fetching data:', error));

  // Process rawData to fit Chart.js dataset format if necessary
  const data = {
    datasets: []
  };
  // discount those below the mean 
  const mean = Object.values(rawData).reduce((acc, item) => {
    return acc + item.length;
  }, 0) / Object.keys(rawData).length;
  const filteredData = Object.keys(rawData).reduce((acc, key) => {
    if (rawData[key].length > mean) {
      acc[key] = rawData[key];
    }
    return acc;
  }
  , {});
  // filter by mean again for good luck
  const filteredMean = Object.values(filteredData).reduce((acc, item) => {
    return acc + item.length;
  }, 0) / Object.keys(filteredData).length;
  const filteredData2 = Object.keys(filteredData).reduce((acc, key) => {
    if (filteredData[key].length > filteredMean) {
      acc[key] = filteredData[key];
    }
    return acc;
  }
  , {});
  for (const key of Object.keys(filteredData2)) {
    const value = filteredData2[key];
    const borderColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    const backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    data.datasets.push({
      label: key,
      // randomzie color
      borderColor: 
      backgroundColor,
      data: value.map((item) => {
        return {
          x: new Date(item.timestamp).toISOString(),
          y: item.cumulativeVolume,
        };
      })

    });
   if (req.query.which == '2'){
    data.datasets = [];
    data.datasets.push({
      label: key,
      // randomzie color
      borderColor: 
      backgroundColor,
      data: value.map((item) => {
        if (item.price > maxPrice){
          maxPrice = item.price;
        }
        return {
          x: new Date(item.timestamp).toISOString(),
          y: item.price,
          yAxisID: 'y-axis-2',

        };
      })

    });
  }
  }
  // Chart.js configuration
  const configuration = {
    type: 'line',
    data: data,
    options: {
      scales: {
        x: {
          label: 'Date',
        },
        y: {
          type: 'linear',
          position: 'left',
        },
      },
        
    }
  };

  const image = await canvasRenderService.renderToBuffer(configuration);
  res.setHeader('Content-Type', 'image/png');
  res.send(image);
}
