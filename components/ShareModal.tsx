import React, { useState, useEffect } from 'react';
import { updateReceiptSharing } from '../services/firestoreService';
import type { Receipt } from '../types';
import Spinner from './Spinner';

interface ShareModalProps {
    receipt: Receipt;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ receipt, onClose }) => {
    const [isShared, setIsShared] = useState(receipt.isShared || false);
    const [shareId, setShareId] = useState(receipt.shareId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const shareUrl = `${window.location.origin}/share/${shareId}`;

    const handleToggleShare = async () => {
        setIsLoading(true);
        try {
            const newShareId = await updateReceiptSharing(receipt.id, !isShared, shareId);
            setIsShared(!isShared);
            if (!isShared) {
                setShareId(newShareId);
            }
        } catch (error) {
            console.error('Failed to update sharing status:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopySuccess('Link kopyalandı!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Kopyalanamadı.');
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col">
                <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fişi Paylaş</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                             <p className="font-medium text-gray-800 dark:text-gray-200">Link ile Paylaşım</p>
                             <p className="text-sm text-gray-500 dark:text-gray-400">{isShared ? 'Aktif' : 'Pasif'}</p>
                        </div>
                        <button
                            onClick={handleToggleShare}
                            disabled={isLoading}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isShared ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                        >
                            <span className="sr-only">Paylaşımı aç/kapat</span>
                            <span aria-hidden="true" className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-lg ring-0 transition ease-in-out duration-200 ${isShared ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {isShared && (
                        <div className="animate-fade-in">
                            <label htmlFor="share-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Paylaşılabilir Link
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    id="share-link"
                                    readOnly
                                    value={shareUrl}
                                    className="block w-full rounded-none rounded-l-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm p-2"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500"
                                >
                                    <span>Kopyala</span>
                                </button>
                            </div>
                            {copySuccess && <p className="text-sm text-green-600 dark:text-green-400 mt-2">{copySuccess}</p>}
                        </div>
                    )}
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                     <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                         Kapat
                     </button>
                </footer>
            </div>
        </div>
    );
};

export default ShareModal;