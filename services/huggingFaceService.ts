// src/services/huggingFaceService.ts

// API endpoint'ini ve token'ı ortam değişkenlerinden alıyoruz.
const API_URL = import.meta.env.VITE_API_ENDPOINT;
const API_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;

// Donut modelinin beklediği çıktı formatı için bir tip tanımı.
// Bu, modelin dokümantasyonuna göre değişebilir, şimdilik bir tahmin.
interface DonutPrediction {
    // Modelin çıktısına göre bu alanları doldurmamız gerekecek.
    // Örnek:
    // "total_amount": "12.34",
    // "date": "2023-10-27",
    // ... vb.
    [key: string]: any; 
}

export const analyzeReceiptWithHuggingFace = async (imageFile: File): Promise<any> => {
    if (!API_URL || !API_TOKEN) {
        throw new Error("Hugging Face API URL'si veya Token'ı ayarlanmamış.");
    }

    try {
        console.log("Hugging Face API'sine istek gönderiliyor:", API_URL);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                // API anahtarını Authorization başlığında gönderiyoruz.
                "Authorization": `Bearer ${API_TOKEN}`,
                // Donut modeli genellikle resmin MIME türünü bu başlıkta bekler.
                "Content-Type": imageFile.type 
            },
            // Resmi JSON'a çevirmeden, doğrudan ikili (binary) veri olarak gönderiyoruz.
            body: imageFile, 
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Hugging Face'den gelen hata yanıtı:", errorBody);
            throw new Error(`Hugging Face API hatası: ${response.status} ${response.statusText}`);
        }
        
        const result: DonutPrediction[] = await response.json();
        console.log("Hugging Face'den gelen ham yanıt:", result);

        // Gelen sonucu projemizin formatına dönüştürmemiz gerekecek.
        // Bu kısım, modelden gelen gerçek yanıta göre düzenlenmeli.
        // Şimdilik gelen ilk sonucu döndürelim.
        return result[0]; 

    } catch (error) {
        console.error("Hugging Face ile fiş analizi sırasında hata:", error);
        throw new Error("Fiş analiz edilemedi. Hugging Face API anahtarını veya model durumunu kontrol edin.");
    }
};