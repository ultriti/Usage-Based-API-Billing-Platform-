// graph.js
export const getGraphData = ({ resultsLatency, resultsStatus }) => {
  const times = resultsLatency.map(item => new Date(item.time).toLocaleTimeString());

  return {
    data: {
      labels: times,
      datasets: [
        {
          label: "Latency (ms)",
          data: resultsLatency.map(item => item.latency),
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          tension: 0.3,
          yAxisID: "y",
        },
        {
          label: "Status Code",
          data: resultsStatus.map(item => item.status),
          borderColor: "rgba(255,99,132,1)",
          backgroundColor: "rgba(255,99,132,0.2)",
          type: "line",
          yAxisID: "y1",
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      stacked: false,
      plugins: {
        title: { display: true, text: "Latency & Status over Time" }
      },
      scales: {
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: "Latency (ms)" }
        },
        y1: {
          type: "linear",
          position: "right",
          title: { display: true, text: "Status Code" },
          grid: { drawOnChartArea: false }
        }
      }
    }
  };
};
