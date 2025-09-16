import React from 'react';
import type { Achievement } from '../types';

interface AchievementsPageProps {
    achievements: Achievement[];
    receiptCount: number;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ achievements, receiptCount }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Başarımlar</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Toplam <span className="font-bold text-indigo-600 dark:text-indigo-400">{receiptCount}</span> fiş taradın. Harika gidiyorsun!
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map(ach => (
                    <div 
                        key={ach.id}
                        className={`p-6 rounded-xl border transition-all duration-300 ${
                            ach.unlocked 
                            ? 'bg-white dark:bg-gray-800 shadow-md border-gray-200 dark:border-gray-700' 
                            : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50'
                        }`}
                    >
                        <div className={`relative w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full transition-colors ${
                            ach.unlocked 
                            ? 'bg-indigo-100 dark:bg-indigo-900/50' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                           <ach.icon className={`w-8 h-8 transition-colors ${
                               ach.unlocked
                               ? 'text-indigo-600 dark:text-indigo-400'
                               : 'text-gray-400 dark:text-gray-500'
                           }`} />
                           {ach.unlocked && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                           )}
                        </div>
                        <h3 className={`text-center text-lg font-bold transition-colors ${
                            ach.unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}>{ach.title}</h3>
                        <p className={`text-center text-sm mt-1 transition-colors ${
                             ach.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                        }`}>{ach.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsPage;
