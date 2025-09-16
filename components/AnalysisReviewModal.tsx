import React, { useState } from 'react';
import type { ReceiptItem } from '../types';
import { AnalyzedReceiptData } from '../services/geminiService';
import Spinner from './Spinner';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';

interface AnalysisReviewModalProps {
    receiptData: AnalyzedReceiptData;
    receiptImage: string;
    onClose: () => void;
    onConfirm: (data: AnalyzedReceiptData) => Promise<void>;
    isConfirming?: boolean;
}

const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm";

const AnalysisReviewModal: React.FC<AnalysisReviewModalProps> = ({
    receiptData,
    receiptImage,
    onClose,
    onConfirm,
    isConfirming = false,
}) => {
    const [data, setData] = useState<AnalyzedReceiptData>(receiptData);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof Omit<ReceiptItem, 'id'>, value: string | number) => {
        const newItems = [...data.items];
        // Type assertion is needed here because field is a string, but TS needs to know it's a key of the item
        (newItems[index] as any)[field] = value;
        setData(prev => ({ ...prev, items: newItems }));
    };
    
    const handleAddItem = () => {
        setData(prev => ({
            ...prev,
            items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]
        }));
    };
    
    const handleRemoveItem = (index: number) => {
        setData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await onConfirm(data);
        } catch(err: any) {
            setError(err.message || 'Kaydedilirken bir hata oluştu.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analiz Sonucunu Gözden Geçir</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-1/3">
                            <img src={receiptImage} alt="Fiş" className="rounded-lg object-contain w-full h-auto max-h-96 border border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Market Adı</label>
                                <input type="text" name="merchantName" value={data.merchantName} onChange={handleInputChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                                <select name="category" value={data.category} onChange={handleInputChange} className={inputClasses}>
                                    <option>Market</option>
                                    <option>Restoran</option>
                                    <option>Elektronik</option>
                                    <option>Giyim</option>
                                    <option>Fatura</option>
                                    <option>Ulaşım</option>
                                    <option>Diğer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tarih</label>
                                <input type="date" name="transactionDate" value={data.transactionDate} onChange={handleInputChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Saat</label>
                                <input type="time" name="transactionTime" value={data.transactionTime} onChange={handleInputChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Toplam KDV</label>
                                {/* Fix: The 'value' prop of an input must be a string. Converted number to string. */}
                                <input type="number" step="0.01" name="totalVat" value={data.totalVat} onChange={e => handleInputChange({ ...e, target: { ...e.target, name: 'totalVat', value: parseFloat(e.target.value) || 0 } })} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Genel Toplam</label>
                                {/* Fix: The 'value' prop of an input must be a string. Converted number to string. */}
                                <input type="number" step="0.01" name="totalAmount" value={data.totalAmount} onChange={e => handleInputChange({ ...e, target: { ...e.target, name: 'totalAmount', value: parseFloat(e.target.value) || 0 } })} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Ürünler</h3>
                        <div className="space-y-2">
                            {data.items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Açıklama"
                                        value={item.description}
                                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                                        className={`col-span-6 ${inputClasses}`}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Adet"
                                        // Fix: The 'value' prop of an input must be a string. Converted number to string.
                                        value={item.quantity.toString()}
                                        onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                                        className={`col-span-2 ${inputClasses}`}
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Fiyat"
                                        // Fix: The 'value' prop of an input must be a string. Converted number to string.
                                        value={item.price.toString()}
                                        onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                        className={`col-span-3 ${inputClasses}`}
                                    />
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="col-span-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 flex justify-center items-center h-10">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddItem} className="mt-2 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">
                           <PlusIcon className="w-4 h-4 mr-1"/> Ürün Ekle
                        </button>
                    </div>

                </main>
                
                <footer className="flex justify-end items-center p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl space-x-4">
                     <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                         İptal
                     </button>
                     <button type="submit" disabled={isConfirming} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]">
                        {isConfirming ? <Spinner /> : 'Onayla ve Kaydet'}
                     </button>
                </footer>
            </form>
        </div>
    );
};

export default AnalysisReviewModal;