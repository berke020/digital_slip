import React, { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import HomeIcon from './icons/HomeIcon';
import TrophyIcon from './icons/TrophyIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import ShoppingCartIcon from './icons/ShoppingCartIcon';

interface NavbarProps {
    user: User;
    onNavigate: (page: 'dashboard' | 'achievements' | 'settings' | 'shopping-analysis') => void;
    activePage: string;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
}> = ({ label, icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, activePage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Logo and Title */}
                    <div className="flex items-center">
                        <span className="font-bold text-xl text-gray-800 dark:text-white">DigitalFiş</span>
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        <NavItem
                            label="Ana Panel"
                            icon={<HomeIcon className="w-5 h-5" />}
                            onClick={() => onNavigate('dashboard')}
                            isActive={activePage === 'dashboard'}
                        />
                        <NavItem
                            label="Analiz"
                            icon={<ShoppingCartIcon className="w-5 h-5" />}
                            onClick={() => onNavigate('shopping-analysis')}
                            isActive={activePage === 'shopping-analysis'}
                        />
                        <NavItem
                            label="Başarımlar"
                            icon={<TrophyIcon className="w-5 h-5" />}
                            onClick={() => onNavigate('achievements')}
                            isActive={activePage === 'achievements'}
                        />
                    </div>

                    {/* Right side: User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
                        >
                            <span className="sr-only">Kullanıcı menüsünü aç</span>
                            <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                                alt=""
                            />
                        </button>
                        {isMenuOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-fast">
                                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-600">
                                    <p className="font-semibold text-gray-700 dark:text-gray-200 truncate">{user.displayName || user.email}</p>
                                </div>
                                <button
                                    onClick={() => { onNavigate('settings'); setIsMenuOpen(false); }}
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    Ayarlar
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="sm:hidden flex justify-around items-center py-2 border-t border-gray-200 dark:border-gray-700">
                    <NavItem
                        label="Ana Panel"
                        icon={<HomeIcon className="w-6 h-6" />}
                        onClick={() => onNavigate('dashboard')}
                        isActive={activePage === 'dashboard'}
                    />
                    <NavItem
                        label="Analiz"
                        icon={<ShoppingCartIcon className="w-6 h-6" />}
                        onClick={() => onNavigate('shopping-analysis')}
                        isActive={activePage === 'shopping-analysis'}
                    />
                    <NavItem
                        label="Başarımlar"
                        icon={<TrophyIcon className="w-6 h-6" />}
                        onClick={() => onNavigate('achievements')}
                        isActive={activePage === 'achievements'}
                    />
                     <NavItem
                        label="Ayarlar"
                        icon={<UserCircleIcon className="w-6 h-6" />}
                        onClick={() => onNavigate('settings')}
                        isActive={activePage === 'settings'}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
