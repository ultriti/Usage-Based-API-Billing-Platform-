export const getGraphData = (providerData) => {
  return {
    data: {
      labels: ['Input', 'Process A', 'Process B', 'Analysis', 'Output 1', 'Output 2'],
      datasets: [{
        label: 'Data Flow',
        data: [100, 80, 70, 120, 60, 60],
        backgroundColor: [
          'rgba(31, 119, 180, 0.8)',
          'rgba(255, 127, 14, 0.8)', 
          'rgba(44, 160, 44, 0.8)',
          'rgba(214, 39, 40, 0.8)',
          'rgba(148, 103, 189, 0.8)',
          'rgba(140, 86, 75, 0.8)'
        ],
        borderColor: [
          'rgba(31, 119, 180, 1)',
          'rgba(255, 127, 14, 1)',
          'rgba(44, 160, 44, 1)', 
          'rgba(214, 39, 40, 1)',
          'rgba(148, 103, 189, 1)',
          'rgba(140, 86, 75, 1)'
        ],
        borderWidth: 2,
      }],
    },
    options: {
      indexAxis: 'y', // Horizontal bars (like Line chart flow)
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 130,
          grid: {
            color: 'rgba(255,255,255,0.1)'
          },
          ticks: {
            color: 'white',
            stepSize: 20
          }
        },
        y: {
          grid: {
            color: 'rgba(255,255,255,0.1)'
          },
          ticks: {
            color: 'white'
          }
        }
      },
      animation: {
        tension: 0.4 // Same smooth animation as Line chart
      }
    }
  };
};