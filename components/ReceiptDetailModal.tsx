import React, { useState } from 'react';
import type { Receipt } from '../types';
import TrashIcon from './icons/TrashIcon';
import BuildingIcon from './icons/BuildingIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import TagIcon from './icons/TagIcon';
import TLIcon from './icons/TLIcon';

interface ReceiptDetailModalProps {
    receipt: Receipt;
    onClose: () => void;
    onDelete: (receiptId: string) => void;
}

const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({ receipt, onClose, onDelete }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    if (!receipt) return null;

    const handleDelete = () => {
        onDelete(receipt.id);
        onClose();
    };
    
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Fiş Detayları</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/3">
                            <img src={receipt.imageBase64} alt="Fiş Görüntüsü" className="rounded-lg object-contain w-full h-auto max-h-80 border border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="w-full sm:w-2/3 space-y-4 text-sm">
                             <div className="flex items-center text-gray-700 dark:text-gray-300"><BuildingIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28">Satıcı:</strong> <span>{receipt.merchantName}</span></div>
                             <div className="flex items-center text-gray-700 dark:text-gray-300"><CalendarIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28">Tarih:</strong> <span>{formatDate(receipt.transactionDate)}</span></div>
                             <div className="flex items-center text-gray-700 dark:text-gray-300"><ClockIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28">Saat:</strong> <span>{receipt.transactionTime}</span></div>
                             <div className="flex items-center text-gray-700 dark:text-gray-300"><TagIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28">Kategori:</strong> <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium">{receipt.category}</span></div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Ürünler</h3>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300 tracking-wider">Açıklama</th>
                                        <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 dark:text-gray-300 tracking-wider">Adet</th>
                                        <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-300 tracking-wider">Fiyat</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {receipt.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 dark:text-gray-200">{item.description}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-gray-800 dark:text-gray-200">{item.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Toplam KDV</p>
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{receipt.totalVat.toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Genel Toplam</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-end">
                                <TLIcon className="w-5 h-5 mr-1" />
                                {receipt.totalAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>

                </main>
                
                <footer className="flex justify-end p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                     {isConfirmingDelete ? (
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-red-700 dark:text-red-300">Silmek istediğinizden emin misiniz?</p>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Evet, Sil</button>
                            <button onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">İptal</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900">
                           <TrashIcon className="w-4 h-4 mr-2"/> Sil
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ReceiptDetailModal;
