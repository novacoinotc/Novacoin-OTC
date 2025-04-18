import { db } from './config';
import {
  collection,
  writeBatch,
  doc,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

/**
 * 🔼 Subir clientes y transacciones a Firebase con control de timestamps consistentes
 */
export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      const clientId = client.id || doc(collection(db, 'clients')).id;
      const clientRef = doc(db, 'clients', clientId);

      // Usar lastUpdated existente si viene del frontend, o asignar uno nuevo
      const lastUpdated =
        client.lastUpdated instanceof Date
          ? client.lastUpdated.toISOString()
          : client.lastUpdated || new Date().toISOString();

      const clientDocData = {
        name: client.name,
        balance: client.balance,
        createdAt: client.createdAt || new Date().toISOString(),
        lastUpdated
      };

      batch.set(clientRef, clientDocData);

      // Transacciones
      if (Array.isArray(client.transactions)) {
        const txColRef = collection(clientRef, 'transactions');
        client.transactions.forEach(transaction => {
          const txId = transaction.id || doc(txColRef).id;
          const txRef = doc(txColRef, txId);

          batch.set(txRef, {
            ...transaction,
            id: txId,
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

/**
 * 🔽 Obtener todos los clientes (y sus transacciones) desde Firebase
 */
export const loadClientsFromFirebase = async () => {
  try {
    const clientsSnap = await getDocs(collection(db, 'clients'));
    const clients = await Promise.all(
      clientsSnap.docs.map(async (docSnap) => {
        const client = docSnap.data();
        client.id = docSnap.id;

        const txSnap = await getDocs(collection(doc(db, 'clients', client.id), 'transactions'));
        client.transactions = txSnap.docs.map(txDoc => {
          const tx = txDoc.data();
          tx.id = txDoc.id;
          return tx;
        });

        return client;
      })
    );
    return clients;
  } catch (error) {
    console.error('❌ Error al cargar clientes desde Firebase:', error);
    return [];
  }
};

/**
 * 🗑 Eliminar un cliente completo
 */
export const deleteClientFromFirebase = async (clientId) => {
  try {
    await deleteDoc(doc(db, 'clients', clientId));
    console.log(`🗑 Cliente ${clientId} eliminado`);
  } catch (error) {
    console.error('❌ Error al eliminar cliente:', error);
  }
};

/**
 * 🗑 Eliminar una transacción específica
 */
export const deleteTransactionFromFirebase = async (clientId, transactionId) => {
  try {
    await deleteDoc(doc(db, 'clients', clientId, 'transactions', transactionId));
    console.log(`🗑 Transacción ${transactionId} eliminada`);
  } catch (error) {
    console.error('❌ Error al eliminar transacción:', error);
  }
};

/**
 * 🔁 Actualizar una transacción existente y marcar lastUpdated en el cliente
 */
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
