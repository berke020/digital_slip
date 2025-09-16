import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
    data: any;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                     font: {
                        size: 10
                    }
                }
            },
            x: {
                 ticks: {
                     font: {
                        size: 10
                    }
                }
            }
        },
    };

    return (
        <div className="relative h-48 w-full">
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarChart;
