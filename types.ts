// Fix: Provide full content for types.ts to define data structures used throughout the application.
import { Timestamp } from 'firebase/firestore';
import React from 'react';

export interface ReceiptItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export interface Receipt {
    id: string;
    userId: string;
    merchantName: string;
    transactionDate: string; // YYYY-MM-DD
    transactionTime: string; // HH:MM
    items: ReceiptItem[];
    totalVat: number;
    totalAmount: number;
    category: string;
    imageBase64: string; // Changed back from imageUrl
    createdAt: Timestamp;
    isShared?: boolean;
    shareId?: string | null;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    icon: React.FC<{className?: string}>;
}
