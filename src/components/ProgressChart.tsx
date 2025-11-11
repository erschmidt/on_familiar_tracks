'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity } from '@/types';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ProgressChartProps {
  activities: Activity[];
}

interface MetricConfig {
  id: string;
  label: string;
  color: string;
  getValue: (activity: Activity) => number | null;
  unit: string;
  yAxisId: string;
  yAxisLabel: string;
}

const METRICS: MetricConfig[] = [
  {
    id: 'heartrate',
    label: 'Avg Heart Rate',
    color: 'rgb(239, 68, 68)', // red
    getValue: (a) => a.average_heartrate || null,
    unit: 'bpm',
    yAxisId: 'y-heartrate',
    yAxisLabel: 'Heart Rate (bpm)',
  },
  {
    id: 'pace',
    label: 'Avg Pace',
    color: 'rgb(59, 130, 246)', // blue
    getValue: (a) => {
      if (!a.average_speed || a.average_speed === 0) return null;
      // Convert m/s to min/km
      return (1000 / 60) / a.average_speed;
    },
    unit: 'min/km',
    yAxisId: 'y-pace',
    yAxisLabel: 'Pace (min/km)',
  },
  {
    id: 'cadence',
    label: 'Avg Cadence',
    color: 'rgb(34, 197, 94)', // green
    getValue: (a) => a.average_cadence ? (a.average_cadence * 2) : null, // Strava stores steps per second, multiply by 2 for steps per minute
    unit: 'spm',
    yAxisId: 'y-cadence',
    yAxisLabel: 'Cadence (steps/min)',
  },
  {
    id: 'calories',
    label: 'Calories',
    color: 'rgb(249, 115, 22)', // orange
    getValue: (a) => a.calories || null,
    unit: 'kcal',
    yAxisId: 'y-calories',
    yAxisLabel: 'Calories (kcal)',
  },
];

export default function ProgressChart({ activities }: ProgressChartProps) {
  // Load selected metrics from localStorage or use defaults
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedMetrics');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    }
    // Default to heart rate and pace
    return new Set(['heartrate', 'pace']);
  });

  // Save selected metrics to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedMetrics', JSON.stringify(Array.from(selectedMetrics)));
    }
  }, [selectedMetrics]);

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(metricId)) {
        newSet.delete(metricId);
      } else {
        newSet.add(metricId);
      }
      return newSet;
    });
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  // Build datasets based on selected metrics
  const activeMetrics = METRICS.filter((m) => selectedMetrics.has(m.id));
  
  const datasets = activeMetrics.map((metric) => ({
    label: `${metric.label} (${metric.unit})`,
    data: sortedActivities.map((a) => metric.getValue(a)),
    borderColor: metric.color,
    backgroundColor: metric.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
    yAxisID: metric.yAxisId,
    tension: 0.3,
    spanGaps: true,
  }));

  // Build y-axes dynamically
  const yAxes: any = {};
  activeMetrics.forEach((metric, index) => {
    yAxes[metric.yAxisId] = {
      type: 'linear',
      display: index < 2, // Only show first two axes to avoid clutter
      position: index % 2 === 0 ? 'left' : 'right',
      title: {
        display: true,
        text: metric.yAxisLabel,
      },
      grid: {
        drawOnChartArea: index === 0, // Only first axis draws grid
      },
    };
  });

  const data = {
    labels: sortedActivities.map((a) => new Date(a.start_date)),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const dataIndex = elements[0].index;
        const activity = sortedActivities[dataIndex];
        if (activity) {
          // Open Strava activity in new window
          window.open(`https://www.strava.com/activities/${activity.id}`, '_blank');
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context: any) {
            if (context.length > 0) {
              const dataIndex = context[0].dataIndex;
              const activity = sortedActivities[dataIndex];
              if (activity) {
                return activity.name;
              }
            }
            return '';
          },
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format pace specially
              if (label.includes('Pace')) {
                const totalMinutes = context.parsed.y;
                const minutes = Math.floor(totalMinutes);
                const seconds = Math.round((totalMinutes - minutes) * 60);
                label += `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
              } else {
                label += context.parsed.y.toFixed(1);
              }
            }
            return label;
          },
          footer: function() {
            return 'Click to open in Strava';
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      ...yAxes,
    },
  };

  return (
    <div className="space-y-4">
      {/* Metric Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-sm">Select Metrics to Display:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METRICS.map((metric) => (
            <label
              key={metric.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedMetrics.has(metric.id)}
                onChange={() => toggleMetric(metric.id)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: metric.color }}
              />
              <span className="text-sm flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                {metric.label}
              </span>
            </label>
          ))}
        </div>
        {selectedMetrics.size === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            Select at least one metric to display the chart
          </p>
        )}
      </div>

      {/* Chart */}
      {selectedMetrics.size > 0 ? (
        <div className="h-96 bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer">
          <Line data={data} options={options} />
        </div>
      ) : (
        <div className="h-96 bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Select metrics above to view the progress chart
          </p>
        </div>
      )}
    </div>
  );
}
