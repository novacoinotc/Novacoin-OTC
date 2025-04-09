import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

// Servicios para gestionar clientes
export const addClient = async (clientData) => {
  try {
    const docRef = await addDoc(collection(db, 'clients'), {
      ...clientData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...clientData };
  } catch (error) {
    console.error("Error adding client: ", error);
    throw error;
  }
};

export const getClients = async () => {
  try {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting clients: ", error);
    throw error;
  }
};

export const updateClient = async (clientId, updatedData) => {
  try {
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, updatedData);
    return { id: clientId, ...updatedData };
  } catch (error) {
    console.error("Error updating client: ", error);
    throw error;
  }
};

export const deleteClient = async (clientId) => {
  try {
    await deleteDoc(doc(db, 'clients', clientId));
    return clientId;
  } catch (error) {
    console.error("Error deleting client: ", error);
    throw error;
  }
};

// Servicios para gestionar transacciones
export const addTransaction = async (clientId, transactionData) => {
  try {
    const transactionRef = await addDoc(
      collection(db, 'clients', clientId, 'transactions'), 
      {
        ...transactionData,
        timestamp: new Date().toISOString()
      }
    );
    return { id: transactionRef.id, ...transactionData };
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

export const getTransactions = async (clientId) => {
  try {
    const q = query(
      collection(db, 'clients', clientId, 'transactions'), 
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting transactions: ", error);
    throw error;
  }
};

export const updateTransaction = async (clientId, transactionId, updatedData) => {
  try {
    const transactionRef = doc(db, 'clients', clientId, 'transactions', transactionId);
    await updateDoc(transactionRef, updatedData);
    return { id: transactionId, ...updatedData };
  } catch (error) {
    console.error("Error updating transaction: ", error);
    throw error;
  }
};

export const deleteTransaction = async (clientId, transactionId) => {
  try {
    await deleteDoc(doc(db, 'clients', clientId, 'transactions', transactionId));
    return transactionId;
  } catch (error) {
    console.error("Error deleting transaction: ", error);
    throw error;
  }
};

// DONE