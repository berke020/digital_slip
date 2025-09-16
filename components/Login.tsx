import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import GoogleIcon from './icons/GoogleIcon';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">{isRegistering ? 'Hesap Oluştur' : 'Giriş Yap'}</h2>
                {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleAuthAction}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
                            E-posta Adresi
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
                        {isRegistering ? 'Kayıt Ol' : 'Giriş Yap'}
                    </button>
                </form>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Veya şununla devam et</span>
                    </div>
                </div>
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-300"
                >
                    <GoogleIcon />
                    Google ile Giriş Yap
                </button>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    {isRegistering ? 'Zaten bir hesabın var mı?' : "Hesabın yok mu?"}
                    <button onClick={() => setIsRegistering(!isRegistering)} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ml-1">
                        {isRegistering ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
