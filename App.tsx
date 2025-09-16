import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Spinner from './components/Spinner';
import SharePage from './components/SharePage';

const App: React.FC = () => {
    const { user, loading } = useAuth();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    
    const [isSharePage, setIsSharePage] = useState(false);
    const [shareId, setShareId] = useState<string | null>(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const path = window.location.pathname;
        const match = path.match(/^\/share\/([a-zA-Z0-9-]+)$/);
        if (match) {
            setIsSharePage(true);
            setShareId(match[1]);
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    if (isSharePage && shareId) {
        return <SharePage shareId={shareId} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-gray-900">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
            {user ? <Dashboard user={user} theme={theme} toggleTheme={toggleTheme} /> : <Login />}
        </div>
    );
};

export default App;