import React, { useState, useMemo } from 'react';
import type { Receipt, ReceiptItem } from '../types';
import ShoppingCartIcon from './icons/ShoppingCartIcon';

interface ShoppingAnalysisPageProps {
    receipts: Receipt[];
}

// Helper function to normalize and clean product descriptions for comparison
const normalizeDescription = (desc: string): string => {
    return desc
        .toLowerCase()
        // Replace Turkish characters for better matching
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
        // Remove units like kg, gr, lt, etc., along with numbers before them
        .replace(/\d+(\.\d+)?\s?(kg|gr|g|lt|l|ml|adet|cl)/g, ' ')
        // Remove any remaining standalone numbers
        .replace(/\d+/g, ' ')
        // Remove common supermarket brands to focus on the product name
        .replace(/\b(pınar|torku|ülker|eti|sütaş|migros|carrefour|bim|a101|şok|birşah)\b/g, '')
        // Remove punctuation
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        // Replace multiple spaces with a single space and trim
        .replace(/\s+/g, ' ').trim();
};

// Helper function to calculate string similarity (Dice's Coefficient)
const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    
    const getBigrams = (s: string) => {
        const bigrams = new Set<string>();
        for (let i = 0; i < s.length - 1; i++) {
            if(s.substring(i, i + 2).trim().length > 1) { // Only add meaningful bigrams
                 bigrams.add(s.substring(i, i + 2));
            }
        }
        return bigrams;
    };

    const s1Bigrams = getBigrams(str1);
    const s2Bigrams = getBigrams(str2);
    
    if (s1Bigrams.size === 0 || s2Bigrams.size === 0) return 0;

    let intersectionSize = 0;
    s1Bigrams.forEach(bigram => {
        if (s2Bigrams.has(bigram)) {
            intersectionSize++;
        }
    });

    return (2 * intersectionSize) / (s1Bigrams.size + s2Bigrams.size);
};


const ShoppingAnalysisPage: React.FC<ShoppingAnalysisPageProps> = ({ receipts }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedGroupKey, setSelectedGroupKey] = useState<string>('');

    const categories = useMemo(() => {
        const allCategories = receipts.map(r => r.category);
        return [...new Set(allCategories)].sort();
    }, [receipts]);

    const productGroups = useMemo(() => {
        if (!selectedCategory) return new Map();

        const itemsFromCategory = receipts
            .filter(r => r.category === selectedCategory)
            .flatMap(r => r.items.map(item => ({
                ...item,
                receiptInfo: { merchantName: r.merchantName, transactionDate: r.transactionDate }
            })));
        
        // The key is the display name of the group (first item's original description)
        // The value contains all items in the group and the normalized version of the key for comparison
        const groups = new Map<string, { items: (typeof itemsFromCategory), normalizedKey: string }>();
        const SIMILARITY_THRESHOLD = 0.45;

        itemsFromCategory.forEach(item => {
            const normalizedItemDesc = normalizeDescription(item.description);
            if (!normalizedItemDesc) return; // Skip items that become empty after normalization

            let bestMatchKey: string | null = null;
            let maxSimilarity = 0;

            // Find the best existing group to join
            for (const [key, groupData] of groups.entries()) {
                const similarity = calculateSimilarity(normalizedItemDesc, groupData.normalizedKey);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    bestMatchKey = key;
                }
            }

            // If a similar enough group is found, add the current item to it
            if (bestMatchKey && maxSimilarity >= SIMILARITY_THRESHOLD) {
                groups.get(bestMatchKey)!.items.push(item);
            } else {
                // Otherwise, this item starts a new group.
                // The group's display name (key) is the original, uncleaned description of its first item.
                groups.set(item.description, {
                    items: [item],
                    normalizedKey: normalizedItemDesc,
                });
            }
        });

        return groups;

    }, [selectedCategory, receipts]);

    const purchaseHistory = useMemo(() => {
        if (!selectedGroupKey) return [];
        const group = productGroups.get(selectedGroupKey);
        if (!group) return [];
        
        // Sort the items within the selected group by date, most recent first
        return [...group.items].sort((a, b) => 
            new Date(b.receiptInfo.transactionDate).getTime() - new Date(a.receiptInfo.transactionDate).getTime()
        );
    }, [selectedGroupKey, productGroups]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alışveriş Analizi</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Geçmiş alışverişlerinizdeki ürün fiyatlarını karşılaştırarak tasarruf edin.</p>
            </header>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">1. Adım: Kategori Seçin</label>
                        <select
                            id="category-select"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setSelectedGroupKey(''); // Reset product selection on category change
                            }}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Kategori --</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">2. Adım: Ürün Grubu Seçin</label>
                        <select
                            id="product-select"
                            value={selectedGroupKey}
                            onChange={(e) => setSelectedGroupKey(e.target.value)}
                            disabled={!selectedCategory || productGroups.size === 0}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                        >
                            <option value="">-- Ürün --</option>
                            {[...productGroups.keys()].sort().map(groupKey => <option key={groupKey} value={groupKey}>{groupKey}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {selectedGroupKey ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">
                        "{selectedGroupKey}" Fiyat Geçmişi
                    </h3>
                    {purchaseHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 tracking-wider">Tarih</th>
                                        <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 tracking-wider">Market</th>
                                        <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 tracking-wider">Orijinal Ürün Açıklaması</th>
                                        <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-300 tracking-wider">Fiyat</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {purchaseHistory.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(item.receiptInfo.transactionDate).toLocaleDateString('tr-TR')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{item.receiptInfo.merchantName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{item.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-800 dark:text-gray-200">
                                                {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="p-6 text-gray-500 dark:text-gray-400">Bu ürün grubu için geçmiş alım bulunamadı.</p>
                    )}
                </div>
            ) : (
                 <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Analize Başlayın</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Fiyat geçmişini görmek için yukarıdan bir kategori ve ürün grubu seçin.</p>
                </div>
            )}
        </div>
    );
};

export default ShoppingAnalysisPage;