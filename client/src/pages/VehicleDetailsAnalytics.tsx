import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface AnalyticsData {
  views: number;
  inquiries: number;
  dates: string[];
  viewsByDay: number[];
  inquiriesByDay: number[];
}

interface Props {
  analytics: AnalyticsData;
}

const VehicleDetailsAnalytics: React.FC<Props> = ({ analytics }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: analytics.dates,
        datasets: [
          {
            label: 'Vues',
            data: analytics.viewsByDay,
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderColor: 'rgba(59,130,246,1)',
            borderWidth: 1,
          },
          {
            label: 'Demandes',
            data: analytics.inquiriesByDay,
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
            text: 'Statistiques du véhicule par jour',
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
    // Cleanup
    return () => {
      chartInstance.current?.destroy();
    };
  }, [analytics]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-8">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Analyse d'activité</h3>
      <canvas ref={chartRef} height={250} />
      <div className="flex justify-between mt-4">
        <div>
          <span className="font-semibold text-blue-600 dark:text-blue-300">Total vues:</span> {analytics.views}
        </div>
        <div>
          <span className="font-semibold text-yellow-600 dark:text-yellow-300">Total demandes:</span> {analytics.inquiries}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsAnalytics;
