// components/ReceiptUploader.tsx (n8n Entegrasyonlu Son Hali)

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// YENİ: Artık n8n servisimizi import ediyoruz
import { analyzeReceiptWithHuggingFace } from '../services/huggingFaceService';
import { AnalyzedReceiptData } from '../types';
import { User } from 'firebase/auth';
import type { Receipt } from '../types';
import AnalysisReviewModal from './AnalysisReviewModal';
import Spinner from './Spinner';
import UploadIcon from './icons/UploadIcon';

interface ReceiptUploaderProps {
    onUploadSuccess: (receiptData: Omit<Receipt, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
    user: User;
}

// Resim sıkıştırma fonksiyonu olduğu gibi kalıyor, bu harika bir özellik.
const compressImage = (file: File, maxStringLength: number = 1000000): Promise<{ file: File, dataUrl: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            if (!event.target?.result) {
                return reject(new Error('Resim dosyası okunamadı.'));
            }
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new Error('Canvas context could not be created.'));
                }

                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.9;
                let dataUrl = canvas.toDataURL(file.type, quality);
                
                while (dataUrl.length > maxStringLength && quality > 0.1) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL(file.type, quality);
                }

                if (dataUrl.length > maxStringLength) {
                    return reject(new Error('Resim sıkıştırıldıktan sonra bile çok büyük. Lütfen daha düşük çözünürlüklü bir resim deneyin.'));
                }

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve({ file: compressedFile, dataUrl });
                    } else {
                        reject(new Error('Canvas to Blob conversion failed.'));
                    }
                }, file.type, quality);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};


const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUploadSuccess, user }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyzedData, setAnalyzedData] = useState<AnalyzedReceiptData | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [compressedImageBase64, setCompressedImageBase64] = useState<string>('');

    const handleFileProcessing = useCallback(async (file: File) => {
        setIsProcessing(true);
        setError(null);
        setAnalyzedData(null);
    
        try {
            // Resmi sıkıştırmaya veya Base64'e çevirmeye gerek yok. Sadece önizleme için URL alalım.
            const dataUrl = URL.createObjectURL(file);
            setImagePreview(dataUrl);
            setCompressedImageBase64(dataUrl); // Bu değişkeni önizleme için kullanmaya devam edebiliriz.
    
            // YENİ: Doğrudan Hugging Face servisine dosyanın kendisini gönderiyoruz.
            const analysisResult = await analyzeReceiptWithHuggingFace(file);
            
            // DİKKAT: 'analysisResult' Hugging Face'den gelen ham veridir.
            // Bunu, 'AnalysisReviewModal'in beklediği formata dönüştürmemiz gerekecek.
            // Şimdilik bu kısmı geçici olarak loglayıp modal'a boş veri gönderelim.
            console.log("Analiz sonucu:", analysisResult);
    
            // TODO: analysisResult'ı AnalyzedReceiptData formatına dönüştür.
            const formattedData: AnalyzedReceiptData = {
                merchantName: analysisResult.store_name || 'Bilinmiyor',
                transactionDate: analysisResult.date || '',
                transactionTime: '',
                items: [], // TODO: analysisResult.menu'den ürünleri çıkar.
                totalVat: 0,
                totalAmount: parseFloat(analysisResult.total_price) || 0,
                category: 'Market',
                imageBase64: ''
            };
    
            setAnalyzedData(formattedData);
            setShowReviewModal(true);
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            handleFileProcessing(acceptedFiles[0]);
        }
    }, [handleFileProcessing]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: false,
    });

    const handleConfirm = async (confirmedData: AnalyzedReceiptData) => {
        if (!compressedImageBase64) {
            setError("Kaydedilecek resim bulunamadı.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const finalReceiptData: Omit<Receipt, 'id' | 'userId' | 'createdAt'> = {
                ...confirmedData,
                imageBase64: compressedImageBase64,
            };

            await onUploadSuccess(finalReceiptData);
            
            setShowReviewModal(false);
            setImagePreview(null);
            setCompressedImageBase64('');
        } catch (saveError: any) {
            setError(saveError.message);
            throw saveError;
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 animate-fade-in">
                <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                        <UploadIcon />
                        {isDragActive ? (
                            <p className="mt-2 text-indigo-600 dark:text-indigo-300">Fişi buraya bırakın...</p>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Fiş fotoğrafını sürükleyip bırakın veya seçmek için tıklayın.</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP</p>
                    </div>
                </div>
                {isProcessing && (
                    <div className="mt-4 flex items-center justify-center space-x-2">
                        <Spinner />
                        <p className="text-gray-600 dark:text-gray-300">
                           Yapay Zeka ile Analiz Ediliyor...
                        </p>
                    </div>
                )}
                {error && <p className="mt-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            </div>
            {showReviewModal && analyzedData && (
                <AnalysisReviewModal
                    receiptData={analyzedData}
                    receiptImage={imagePreview || ''}
                    onClose={() => setShowReviewModal(false)}
                    onConfirm={handleConfirm}
                    isConfirming={isProcessing}
                />
            )}
        </>
    );
};

export default ReceiptUploader;