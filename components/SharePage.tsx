import React, { useState, useEffect } from 'react';
import { getSharedReceipt } from '../services/firestoreService';
import type { Receipt } from '../types';
import Spinner from './Spinner';
import BuildingIcon from './icons/BuildingIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import TagIcon from './icons/TagIcon';
import TLIcon from './icons/TLIcon';

interface SharePageProps {
    shareId: string;
}

const SharePage: React.FC<SharePageProps> = ({ shareId }) => {
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const fetchedReceipt = await getSharedReceipt(shareId);
                if (fetchedReceipt) {
                    setReceipt(fetchedReceipt);
                } else {
                    setError('Bu fiş bulunamadı veya artık paylaşıma açık değil.');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [shareId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-100"><Spinner /></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-100"><p className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</p></div>;
    }
    
    if (!receipt) {
        return null;
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) { return dateString; }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">DigitalFiş</h1>
                <p className="text-gray-500">Bir Fiş Sizinle Paylaşıldı</p>
            </header>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col">
                <header className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Fiş Detayları</h2>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-1/3">
                            <img src={receipt.imageBase64} alt="Fiş Görüntüsü" className="rounded-lg object-contain w-full h-auto max-h-80 border border-gray-200" />
                        </div>
                        <div className="w-full sm:w-2/3 space-y-4 text-sm">
                             <div className="flex items-center text-gray-700"><BuildingIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Satıcı:</strong> <span>{receipt.merchantName}</span></div>
                             <div className="flex items-center text-gray-700"><CalendarIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Tarih:</strong> <span>{formatDate(receipt.transactionDate)}</span></div>
                             <div className="flex items-center text-gray-700"><ClockIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Saat:</strong> <span>{receipt.transactionTime}</span></div>
                             <div className="flex items-center text-gray-700"><TagIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Kategori:</strong> <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">{receipt.category}</span></div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Ürünler</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 tracking-wider">Açıklama</th>
                                        <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 tracking-wider">Adet</th>
                                        <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500 tracking-wider">Fiyat</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {receipt.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.description}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center text-gray-500">{item.quantity}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-gray-800">{item.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 text-right">
                        <div>
                            <p className="text-xs text-gray-500">Toplam KDV</p>
                            <p className="font-semibold text-gray-700">{receipt.totalVat.toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-500">Genel Toplam</p>
                            <p className="text-lg font-bold text-gray-900 flex items-center justify-end">
                                <TLIcon className="w-5 h-5 mr-1" />
                                {receipt.totalAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </main>
            </div>
             <footer className="mt-8 text-center text-sm text-gray-500">
                <p>Kendi fişlerinizi analiz etmek ve yönetmek için <a href="/" className="text-indigo-600 hover:underline">DigitalFiş'e katılın</a>.</p>
            </footer>
        </div>
    );
};

export default SharePage;
