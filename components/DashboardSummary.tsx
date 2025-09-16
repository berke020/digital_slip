import React, { useMemo } from 'react';
import type { Receipt } from '../types';

interface DashboardSummaryProps {
    receipts: Receipt[];
    onShowDetails: () => void;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ receipts, onShowDetails }) => {
    const summary = useMemo(() => {
        if (receipts.length === 0) {
            return {
                totalSpent: 0,
                receiptCount: 0,
            };
        }
        const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
        const receiptCount = receipts.length;
        return { totalSpent, receiptCount };
    }, [receipts]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Harcama Özeti</h3>
                <button 
                    onClick={onShowDetails} 
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                >
                    Detayları Görüntüle &rarr;
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Harcama</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {summary.totalSpent.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Fiş Sayısı</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summary.receiptCount}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;