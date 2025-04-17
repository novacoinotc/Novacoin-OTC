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
 * 🔼 Subir clientes y transacciones a Firebase con control de duplicados.
 */
export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      const clientId = client.id || doc(collection(db, 'clients')).id;
      const clientRef = doc(db, 'clients', clientId);

      // Cliente
      const clientDocData = {
        name: client.name,
        balance: client.balance,
        createdAt: client.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString() // ✅ Agregamos campo de actualización
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

/**
 * 🔽 Obtener clientes y transacciones desde Firebase.
 */
export const loadClientsFromFirebase = async () => {
  try {
    const clientsSnapshot = await getDocs(collection(db, 'clients'));

    const clients = await Promise.all(clientsSnapshot.docs.map(async (docSnap) => {
      const client = docSnap.data();
      client.id = docSnap.id;

      const txSnapshot = await getDocs(collection(doc(db, 'clients', client.id), 'transactions'));
      client.transactions = txSnapshot.docs.map(txDoc => {
        const tx = txDoc.data();
        tx.id = txDoc.id;
        return tx;
      });

      return client;
    }));

    return clients;
  } catch (error) {
    console.error('❌ Error al obtener datos desde Firebase:', error);
    return [];
  }
};

/**
 * 🗑 Eliminar un cliente completo.
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
 * 🗑 Eliminar una transacción específica.
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
 * 🔁 Actualizar una transacción existente y actualizar lastUpdated del cliente.
 */
export const updateTransactionInFirebase = async (clientId, transaction) => {
  try {
    const txRef = doc(db, 'clients', clientId, 'transactions', transaction.id);
    const clientRef = doc(db, 'clients', clientId);

    await updateDoc(txRef, transaction);
    await updateDoc(clientRef, {
      lastUpdated: new Date().toISOString() // ✅ Aseguramos que se actualice el cliente
    });

    console.log(`🔁 Transacción ${transaction.id} actualizada`);
  } catch (error) {
    console.error('❌ Error al actualizar transacción:', error);
  }
};