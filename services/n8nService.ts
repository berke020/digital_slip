// src/services/n8nService.ts (Düzeltilmiş Son Hali)

import type { Receipt, ReceiptItem } from '../types';

export type AnalyzedReceiptData = Omit<Receipt, 'id' | 'userId' | 'imageUrl' | 'createdAt' | 'isShared' | 'shareId'> & {
    items: Omit<ReceiptItem, 'id'>[]
};

// Vercel'deki veya .env.local dosyasındaki değişkeni oku.
// Eğer hiçbirini bulamazsan, yedek olarak proxy adresini kullan.
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "/n8n-api/webhook-test/9983e973-517f-49dc-aef6-0a16c186b657";

export const analyzeReceiptWithN8n = async (imageBase64: string): Promise<AnalyzedReceiptData> => {
    try {
        console.log("n8n Webhook'una istek gönderiliyor:", N8N_WEBHOOK_URL); // Hata ayıklama için adresi yazdır.

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageBase64: imageBase64
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("n8n'den gelen hata yanıtı:", errorBody);
            throw new Error(`n8n Webhook hatası: ${response.status} ${response.statusText}`);
        }
         
        const data = await response.json();
        console.log("n8n'den gelen ham yanıt:", data);
         
        let ollamaResponseString = data.response; 
         
        if (!ollamaResponseString) {
            throw new Error("Yapay zekadan beklenen metin yanıtı gelmedi.");
        }
         
        if (ollamaResponseString.startsWith("```json")) {
            ollamaResponseString = ollamaResponseString.slice(7);
        }
        if (ollamaResponseString.endsWith("```")) {
            ollamaResponseString = ollamaResponseString.slice(0, -3);
        }

        const parsedData = JSON.parse(ollamaResponseString.trim());

        return parsedData;

    } catch (error) {
        console.error("n8n ile fiş analizi sırasında hata:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Yapay zekadan gelen yanıt geçerli bir JSON formatında değil. Lütfen n8n prompt'unu kontrol edin.");
        }
        throw new Error("Fiş analiz edilemedi. n8n veya Ollama sunucusunda bir sorun olabilir.");
    }
};