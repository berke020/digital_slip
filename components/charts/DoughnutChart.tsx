import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
    data: any;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    padding: 20,
                    font: {
                        size: 10
                    }
                }
            },
        },
        cutout: '60%',
    };

    return (
        <div className="relative h-48 w-full">
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default DoughnutChart;
