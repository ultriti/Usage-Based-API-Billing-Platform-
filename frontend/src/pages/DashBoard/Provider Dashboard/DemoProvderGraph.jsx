import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

// ✅ Register required chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartExample = () => {
  const data = {
    labels: ["Success", "Errors", "Timeouts"],
    datasets: [
      {
        data: [65, 20, 15], // values for each slice
        backgroundColor: ["#10B981", "#EF4444", "#F59E0B"], // green, red, amber
        borderColor: "#1F2937", // dark border
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff", // white text for dark mode
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="bg-gray-900 w-[40%] h-[50vh] text-white flex flex-col items-center p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">API Status Distribution</h2>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChartExample;
