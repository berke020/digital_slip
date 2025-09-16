import React, { useState, useEffect } from 'react';
import type { Receipt } from '../types';
import TrashIcon from './icons/TrashIcon';
import BuildingIcon from './icons/BuildingIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import TagIcon from './icons/TagIcon';
import TLIcon from './icons/TLIcon';
import ShareIcon from './icons/ShareIcon';
import ShareModal from './ShareModal';
import PdfIcon from './icons/PdfIcon';
import Spinner from './Spinner';

// Extend window interface for jsPDF and html2canvas
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}


interface DetailsPageProps {
    receipt: Receipt;
    onDelete: (receiptId: string) => void;
    onBack: () => void;
}

const DetailsPage: React.FC<DetailsPageProps> = ({ receipt, onDelete, onBack }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [pdfLibrariesReady, setPdfLibrariesReady] = useState(false);

    useEffect(() => {
        // If libraries are already available, no need to poll
        if (window.html2canvas && window.jspdf?.jsPDF) {
            setPdfLibrariesReady(true);
            return;
        }

        let intervalId: number | undefined;
        let timeoutId: number | undefined;
        
        const checkLibraries = () => {
            if (window.html2canvas && window.jspdf?.jsPDF) {
                setPdfLibrariesReady(true);
                if (intervalId) clearInterval(intervalId);
                if (timeoutId) clearTimeout(timeoutId);
            }
        };

        // Poll every 250ms
        intervalId = window.setInterval(checkLibraries, 250);

        // Stop polling after 5 seconds to avoid infinite loops if CDN fails
        timeoutId = window.setTimeout(() => {
            clearInterval(intervalId);
            if (!(window.html2canvas && window.jspdf?.jsPDF)) {
                console.warn("PDF libraries did not load in time.");
            }
        }, 5000);
        
        // Initial check right away
        checkLibraries();

        // Cleanup function
        return () => {
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    if (!receipt) return null;

    const handleDelete = () => {
        onDelete(receipt.id);
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

    const handlePdfDownload = () => {
        const input = document.getElementById('receipt-content');
        const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

        if (!input || !pdfLibrariesReady) {
            console.error("PDF generation prerequisites not met!");
            alert("PDF oluşturma kütüphaneleri henüz hazır değil. Lütfen bir an bekleyip tekrar deneyin.");
            return;
        }
        setIsDownloadingPdf(true);

        const { jsPDF } = window.jspdf;

        window.html2canvas(input, { 
            scale: 2,
            useCORS: true, 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
        })
        .then((canvas: HTMLCanvasElement) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('fis-detay.pdf');
        })
        .catch((err: any) => {
            console.error("PDF generation failed:", err);
            alert("PDF oluşturulurken bir hata oluştu.");
        })
        .finally(() => {
            setIsDownloadingPdf(false);
        });
    };

    return (
        <>
            <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
                <header>
                    <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Ana Panele Dön
                    </button>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fiş Detayları</h1>
                        <div className="flex gap-2">
                            <button 
                                onClick={handlePdfDownload} 
                                disabled={isDownloadingPdf || !pdfLibrariesReady}
                                title={!pdfLibrariesReady ? "PDF kütüphaneleri yükleniyor..." : "PDF olarak indir"}
                                className="flex items-center px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-md hover:bg-green-200 dark:hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed">
                               {isDownloadingPdf ? <Spinner /> : <PdfIcon className="w-4 h-4 mr-2"/>}
                               {isDownloadingPdf ? 'İndiriliyor...' : 'PDF İndir'}
                            </button>
                             <button onClick={() => setIsShareModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900">
                               <ShareIcon className="w-4 h-4 mr-2"/> Paylaş
                            </button>
                            {isConfirmingDelete ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-red-700 dark:text-red-300">Emin misiniz?</p>
                                    <button onClick={handleDelete} className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Evet</button>
                                    <button onClick={() => setIsConfirmingDelete(false)} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">İptal</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900">
                                   <TrashIcon className="w-4 h-4 mr-2"/> Sil
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div id="receipt-content" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <main className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="w-full sm:w-1/3">
                                <img src={receipt.imageBase64} alt="Fiş Görüntüsü" className="rounded-lg object-contain w-full h-auto max-h-80 border border-gray-200 dark:border-gray-700" />
                            </div>
                            <div className="w-full sm:w-2/3 space-y-4 text-sm">
                                 <div className="flex items-center text-gray-700 dark:text-gray-300"><BuildingIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Satıcı:</strong> <span>{receipt.merchantName}</span></div>
                                 <div className="flex items-center text-gray-700 dark:text-gray-300"><CalendarIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Tarih:</strong> <span>{formatDate(receipt.transactionDate)}</span></div>
                                 <div className="flex items-center text-gray-700 dark:text-gray-300"><ClockIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Saat:</strong> <span>{receipt.transactionTime}</span></div>
                                 <div className="flex items-center text-gray-700 dark:text-gray-300"><TagIcon className="w-5 h-5 mr-3 text-gray-400" /><strong className="w-28 flex-shrink-0">Kategori:</strong> <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium">{receipt.category}</span></div>
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
                </div>
            </div>
            {isShareModalOpen && (
                <ShareModal receipt={receipt} onClose={() => setIsShareModalOpen(false)} />
            )}
        </>
    );
};

export default DetailsPage;
