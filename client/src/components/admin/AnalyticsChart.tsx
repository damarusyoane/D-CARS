import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface AnalyticsData {
  labels: string[];
  views: number[];
  inquiries: number[];
}

interface Props {
  data: AnalyticsData;
}

const AnalyticsChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Vues',
            data: data.views,
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderColor: 'rgba(59,130,246,1)',
            borderWidth: 1,
          },
          {
            label: 'Demandes',
            data: data.inquiries,
            backgroundColor: 'rgba(245,158,11,0.7)',
            borderColor: 'rgba(245,158,11,1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Activité globale des véhicules (par jour)',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
    return () => {
      chartInstance.current?.destroy();
    };
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-8">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Statistiques d'activité des véhicules</h3>
      <canvas ref={chartRef} height={250} />
    </div>
  );
};

export default AnalyticsChart;
