import { db } from './config';
import {
  collection,
  writeBatch,
  doc,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

// ✅ Subir clientes y transacciones a Firebase con control de timestamps consistentes
export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      const clientId = client.id || doc(collection(db, 'clients')).id;
      const clientRef = doc(db, 'clients', clientId);

      // ✅ Usar lastUpdated existente si ya viene del frontend, o asignar uno nuevo
      const lastUpdated =
        client.lastUpdated instanceof Date
          ? client.lastUpdated.toISOString()
          : client.lastUpdated || new Date().toISOString();

      const clientDocData = {
        name: client.name,
        balance: client.balance,
        createdAt: client.createdAt || new Date().toISOString(),
        lastUpdated // ✅ Siempre se guarda y respeta este campo
      };

      batch.set(clientRef, clientDocData);

      // Transacciones
      if (Array.isArray(client.transactions)) {
        const transactionsCollectionRef = collection(clientRef, 'transactions');

        client.transactions.forEach(transaction => {
          const transactionId = transaction.id || doc(transactionsCollectionRef).id;
          const transactionRef = doc(transactionsCollectionRef, transactionId);

          batch.set(transactionRef, {
            ...transaction,
            id: transactionId,
            timestamp: transaction.timestamp || new Date().toISOString()
          });
        });
      }
    }

    await batch.commit();
    console.log('✅ Datos subidos exitosamente a Firebase');
    return true;
  } catch (error) {
    console.error('❌ Error al subir datos a Firebase:', error);
    throw error;
  }
};

// 🔁 Actualizar una transacción existente y el campo lastUpdated del cliente
export const updateTransactionInFirebase = async (clientId, transaction) => {
  try {
    const txRef = doc(db, 'clients', clientId, 'transactions', transaction.id);
    const clientRef = doc(db, 'clients', clientId);

    await updateDoc(txRef, transaction);
    await updateDoc(clientRef, {
      lastUpdated: new Date().toISOString()
    });

    console.log(`🔁 Transacción ${transaction.id} actualizada`);
  } catch (error) {
    console.error('❌ Error al actualizar transacción:', error);
  }
};
