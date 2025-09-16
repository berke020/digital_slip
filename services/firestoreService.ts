import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import type { Receipt } from '../types';

const receiptsCollection = collection(db, 'receipts');

// Add a new receipt to Firestore
export const addReceipt = async (userId: string, receiptData: Omit<Receipt, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(receiptsCollection, {
      ...receiptData,
      userId,
      createdAt: serverTimestamp(),
      isShared: false,
      shareId: null,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding receipt to Firestore:", error);
    throw new Error("Fiş veritabanına kaydedilemedi.");
  }
};

// Get all receipts for a specific user, ordered by transaction date
export const getReceipts = async (userId: string): Promise<Receipt[]> => {
  try {
    const q = query(receiptsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const receipts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Receipt));
    // Sort receipts by transaction date and time, most recent first
    return receipts.sort((a, b) => {
        const dateA = new Date(`${a.transactionDate}T${a.transactionTime || '00:00'}`);
        const dateB = new Date(`${b.transactionDate}T${b.transactionTime || '00:00'}`);
        return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error fetching receipts from Firestore:", error);
    throw new Error("Fişler alınamadı.");
  }
};

// Delete a receipt from Firestore
export const deleteReceipt = async (receiptId: string): Promise<void> => {
  try {
    const receiptDoc = doc(db, 'receipts', receiptId);
    await deleteDoc(receiptDoc);
  } catch (error) {
    console.error("Error deleting receipt from Firestore:", error);
    throw new Error("Fiş silinemedi.");
  }
};

// Update sharing status of a receipt
export const updateReceiptSharing = async (receiptId: string, isShared: boolean, currentShareId: string | null | undefined): Promise<string> => {
    const receiptDoc = doc(db, 'receipts', receiptId);
    let newShareId = currentShareId;
    if (isShared && !newShareId) {
        newShareId = crypto.randomUUID();
    }
    
    await updateDoc(receiptDoc, {
        isShared: isShared,
        shareId: isShared ? newShareId : null
    });
    
    return newShareId || '';
};

// Get a shared receipt by its shareId
export const getSharedReceipt = async (shareId: string): Promise<Receipt | null> => {
    try {
        const q = query(receiptsCollection, where('shareId', '==', shareId), where('isShared', '==', true), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const docSnapshot = querySnapshot.docs[0];
        return { id: docSnapshot.id, ...docSnapshot.data() } as Receipt;

    } catch (error) {
        console.error("Error fetching shared receipt:", error);
        throw new Error("Paylaşılan fiş alınamadı.");
    }
};
