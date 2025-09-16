// Fix: Provide full content for Dashboard.tsx, which serves as the main component for authenticated users, managing state, data fetching, and navigation.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import type { Receipt, Achievement } from '../types';
import { addReceipt, getReceipts, deleteReceipt } from '../services/firestoreService';
import ReceiptUploader from './ReceiptUploader';
import ReceiptList from './ReceiptList';
import DetailsPage from './DetailsPage';
import DashboardSummary from './DashboardSummary';
import Navbar from './Navbar';
import SettingsPage from './SettingsPage';
import AchievementsPage from './AchievementsPage';
import ShoppingAnalysisPage from './ShoppingAnalysisPage';
import PlusIcon from './icons/PlusIcon';
import SummaryDetailsPage from './SummaryDetailsPage';

// Mocked achievements data
import HomeIcon from './icons/HomeIcon';
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import TrophyIcon from './icons/TrophyIcon';

const allAchievements: Omit<Achievement, 'unlocked'>[] = [
    { id: '1', title: 'İlk Fiş', description: 'İlk fişini başarıyla taradın.', icon: HomeIcon },
    { id: '2', title: 'Beş Fiş', description: 'Toplam 5 fiş taradın.', icon: ShoppingCartIcon },
    { id: '3', title: 'On Fiş', description: 'Toplam 10 fiş taradın.', icon: TrophyIcon },
];


const Dashboard: React.FC<{ user: User, theme: 'light' | 'dark', toggleTheme: () => void }> = ({ user, theme, toggleTheme }) => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [activePage, setActivePage] = useState<'dashboard' | 'achievements' | 'settings' | 'shopping-analysis' | 'summary-details'>('dashboard');
    const [showUploader, setShowUploader] = useState(false);

    const loadReceipts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const userReceipts = await getReceipts(user.uid);
            setReceipts(userReceipts);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user.uid]);

    useEffect(() => {
        loadReceipts();
    }, [loadReceipts]);

    const handleUploadSuccess = async (receiptData: Omit<Receipt, 'id' | 'userId' | 'createdAt'>) => {
        try {
            await addReceipt(user.uid, receiptData);
            setShowUploader(false); // Hide uploader on success
            loadReceipts(); // Refresh the list
        } catch (err: any) {
            setError(err.message);
            // Re-throw to be caught in the uploader component to show error there
            throw err;
        }
    };

    const handleDeleteReceipt = async (receiptId: string) => {
        try {
            await deleteReceipt(receiptId);
            setReceipts(receipts.filter(r => r.id !== receiptId));
            setSelectedReceipt(null); // Go back to the list
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    const unlockedAchievements = useMemo(() => {
        const count = receipts.length;
        return allAchievements.map(ach => ({
            ...ach,
            unlocked: (ach.id === '1' && count >= 1) || (ach.id === '2' && count >= 5) || (ach.id === '3' && count >= 10)
        }));
    }, [receipts.length]);

    const renderContent = () => {
        if (selectedReceipt) {
            return <DetailsPage receipt={selectedReceipt} onDelete={handleDeleteReceipt} onBack={() => setSelectedReceipt(null)} />
        }
        
        switch(activePage) {
            case 'settings':
                return <SettingsPage user={user} theme={theme} toggleTheme={toggleTheme} />;
            case 'achievements':
                return <AchievementsPage achievements={unlockedAchievements} receiptCount={receipts.length} />;
            case 'shopping-analysis':
                return <ShoppingAnalysisPage receipts={receipts} />;
            case 'summary-details':
                return <SummaryDetailsPage receipts={receipts} onBack={() => setActivePage('dashboard')} />;
            case 'dashboard':
            default:
                return (
                     <div className="space-y-6">
                        <DashboardSummary receipts={receipts} onShowDetails={() => setActivePage('summary-details')} />
                        {/* Fix: Pass the user object to the ReceiptUploader component. */}
                        {showUploader && <ReceiptUploader onUploadSuccess={handleUploadSuccess} user={user} />}
                        <ReceiptList receipts={receipts} isLoading={isLoading} onSelectReceipt={setSelectedReceipt} />
                     </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
           <Navbar user={user} onNavigate={setActivePage} activePage={activePage} />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-4">
                {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                {renderContent()}
            </main>
             {activePage === 'dashboard' && !selectedReceipt && (
                 <button 
                     onClick={() => setShowUploader(prev => !prev)}
                     className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-30"
                     aria-label="Yeni fiş yükle"
                 >
                     <PlusIcon className="w-6 h-6" />
                 </button>
             )}
        </div>
    );
};

export default Dashboard;