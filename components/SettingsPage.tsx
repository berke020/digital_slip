import React from 'react';
import { User } from 'firebase/auth';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface SettingsPageProps {
  user: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, theme, toggleTheme }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
        <header>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Profil bilgilerinizi yönetin ve uygulama tercihlerinizi yapın.</p>
        </header>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Profil</h2>
            <div className="flex items-center space-x-4">
                <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                    alt="Profil Fotoğrafı" 
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{user.displayName || 'İsim Belirtilmemiş'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
            </div>
        </div>

        {/* Theme Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Görünüm</h2>
            <div className="flex items-center justify-between">
                <p className="text-gray-700 dark:text-gray-300">Uygulama Teması</p>
                <button 
                    onClick={toggleTheme} 
                    className="relative inline-flex items-center h-8 rounded-full w-16 transition-colors bg-gray-200 dark:bg-gray-700"
                >
                    <span className="sr-only">Toggle Theme</span>
                    <span className={`absolute left-1 transition-transform transform ${theme === 'light' ? 'translate-x-0' : 'translate-x-8'}`}>
                        {theme === 'light' ? <SunIcon className="h-6 w-6 text-yellow-500"/> : <MoonIcon className="h-6 w-6 text-indigo-400"/>}
                    </span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;
