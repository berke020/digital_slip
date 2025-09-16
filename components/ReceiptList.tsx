import React from 'react';
import type { Receipt } from '../types';
import Spinner from './Spinner';
import BuildingIcon from './icons/BuildingIcon';
import CalendarIcon from './icons/CalendarIcon';
import TLIcon from './icons/TLIcon';

interface ReceiptListProps {
    receipts: Receipt[];
    isLoading: boolean;
    onSelectReceipt: (receipt: Receipt) => void;
}

const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, isLoading, onSelectReceipt }) => {
    
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <div className="flex justify-center items-center space-x-2">
                    <Spinner />
                    <p className="text-gray-600 dark:text-gray-300">Fişler yükleniyor...</p>
                </div>
            </div>
        );
    }
    
    if (receipts.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Henüz Fiş Eklenmemiş</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Başlamak için sağ alttaki artı (+) butonuna tıklayarak yeni bir fiş yükleyin.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
             <h3 className="text-xl font-semibold text-gray-800 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">Son Fişler</h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {receipts.map((receipt) => (
                    <li key={receipt.id} onClick={() => onSelectReceipt(receipt)} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 truncate flex items-center">
                                    <BuildingIcon className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    {receipt.merchantName}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                     {formatDate(receipt.transactionDate)} - {receipt.transactionTime}
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100 ml-4">
                                <TLIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                                {receipt.totalAmount.toFixed(2)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReceiptList;
