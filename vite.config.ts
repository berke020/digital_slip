import path from 'path';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ mode }) => {
    // Mevcut ortam değişkeni yükleme mantığın olduğu gibi kalıyor.
    const env = loadEnv(mode, '.', '');

    return {


        // Mevcut 'define' ayarların olduğu gibi kalıyor.
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },

        // Mevcut 'resolve' ayarların olduğu gibi kalıyor.
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },

        // --- YENİ EKLENEN BÖLÜM BURASI ---
        // Geliştirme sunucusu ayarları
        server: {
            // Vekil (proxy) sunucu yapılandırması
            proxy: {
                // Tarayıcıdan '/n8n-api' ile başlayan bir istek geldiğinde...
                '/n8n-api': {
                    // ...isteği bu gerçek adrese yönlendir.
                    target: 'http://100.127.216.55:5678',
                    
                    // Bu, sunucunun isteğin farklı bir kaynaktan geldiğini anlamasını engeller. CORS için kritiktir.
                    changeOrigin: true,
                    
                    // İsteği yönlendirirken başındaki '/n8n-api' kısmını sil, çünkü n8n'in buna ihtiyacı yok.
                    rewrite: (path) => path.replace(/^\/n8n-api/, ''),
                },
            },
        },
    };
});