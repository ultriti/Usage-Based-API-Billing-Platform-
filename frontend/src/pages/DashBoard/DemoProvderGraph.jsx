import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { getGraphData } from "./Graph";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const DemoProviderGraph = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post("http://localhost:3000/api/apiGen/getProviderInfo", {}, { withCredentials: true });

        console.log("res", res.data);
        const formatted = getGraphData(res.data);
        setChartData(formatted);
        
      } catch (err) {
        console.error("Error fetching graph data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: "700px", margin: "auto" }}>
      <h2>API Latency & Status Graph</h2>
      {chartData ? (
        <Line data={chartData.data} options={chartData.options} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DemoProviderGraph;
