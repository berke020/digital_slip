import React, { useMemo } from 'react';
import type { Receipt } from '../types';
import DoughnutChart from './charts/DoughnutChart';
import BarChart from './charts/BarChart';

interface SummaryDetailsPageProps {
    receipts: Receipt[];
    onBack: () => void;
}

const chartColors = [
    '#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
];

const SummaryDetailsPage: React.FC<SummaryDetailsPageProps> = ({ receipts, onBack }) => {
    const summary = useMemo(() => {
        if (receipts.length === 0) {
            return {
                totalSpent: 0,
                receiptCount: 0,
                averageSpent: 0,
                categoryData: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
                monthlyData: { labels: [], datasets: [{ label: 'Harcama', data: [], backgroundColor: '#4F46E5' }] },
            };
        }

        const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
        const receiptCount = receipts.length;
        const averageSpent = totalSpent / receiptCount;

        const spendingByCategory = receipts.reduce((acc, receipt) => {
            acc[receipt.category] = (acc[receipt.category] || 0) + receipt.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        const categoryLabels = Object.keys(spendingByCategory);
        const categoryValues = Object.values(spendingByCategory);
        const categoryData = {
            labels: categoryLabels,
            datasets: [{
                data: categoryValues,
                backgroundColor: categoryLabels.map((_, i) => chartColors[i % chartColors.length]),
                borderWidth: 0,
            }],
        };

        const spendingByMonth: { [key: string]: number } = {};
        receipts.forEach(receipt => {
            const monthKey = receipt.transactionDate.substring(0, 7);
            spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + receipt.totalAmount;
        });

        const sortedMonthKeys = Object.keys(spendingByMonth).sort();
        
        const monthlyLabels = sortedMonthKeys.map(key => {
            const [year, month] = key.split('-');
            return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('tr-TR', { month: 'short', year: '2-digit' });
        });
        const monthlyValues = sortedMonthKeys.map(key => spendingByMonth[key]);
        const monthlyData = {
            labels: monthlyLabels,
            datasets: [{
                label: 'Aylık Harcama',
                data: monthlyValues,
                backgroundColor: '#4F46E5',
                borderRadius: 4,
            }],
        };

        return { totalSpent, receiptCount, averageSpent, categoryData, monthlyData };
    }, [receipts]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <header>
                <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Ana Panele Dön
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Harcama Analizi</h1>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Harcama</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {summary.totalSpent.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Fiş Sayısı</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summary.receiptCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ortalama Fiş Tutarı</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {summary.averageSpent.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                </div>
            </div>

            {receipts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Kategori Dağılımı</h4>
                        <DoughnutChart data={summary.categoryData} />
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Aylık Harcama Trendi</h4>
                        <BarChart data={summary.monthlyData} />
                    </div>
                </div>
            ) : (
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Analiz Edilecek Veri Yok</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Grafikleri görebilmek için önce birkaç fiş eklemelisiniz.</p>
                </div>
            )}
        </div>
    );
};

export default SummaryDetailsPage;