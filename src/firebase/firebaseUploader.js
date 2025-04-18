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
 * 🔼 Subir clientes y transacciones a Firebase con timestamps consistentes
 */
export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      // ID del cliente (nuevo o existente)
      const clientId = client.id || doc(collection(db, 'clients')).id;
      const clientRef = doc(db, 'clients', clientId);

      // — Normalizar createdAt —
      const createdAtIso = client.createdAt
        ? (typeof client.createdAt === 'string'
            ? client.createdAt
            : new Date(client.createdAt).toISOString())
        : new Date().toISOString();

      // — Normalizar lastUpdated (o fallback a createdAt) —
      const lastUpdatedIso = client.lastUpdated
        ? (typeof client.lastUpdated === 'string'
            ? client.lastUpdated
            : new Date(client.lastUpdated).toISOString())
        : createdAtIso;

      // Datos del documento cliente
      const clientDocData = {
        name: client.name,
        balance: client.balance,
        createdAt: createdAtIso,
        lastUpdated: lastUpdatedIso
      };
      batch.set(clientRef, clientDocData);

      // — Subir cada transacción con timestamp normalizado —
      if (Array.isArray(client.transactions)) {
        const txColRef = collection(clientRef, 'transactions');

        for (const tx of client.transactions) {
          const txId = tx.id || doc(txColRef).id;
          const txRef = doc(txColRef, txId);

          const timestampIso = tx.timestamp
            ? (typeof tx.timestamp === 'string'
                ? tx.timestamp
                : new Date(tx.timestamp).toISOString())
            : new Date().toISOString();

          batch.set(txRef, {
            ...tx,
            id: txId,
            timestamp: timestampIso
          });
        }
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
 * 🔽 Carga todos los clientes y sus transacciones desde Firebase
 */
export const loadClientsFromFirebase = async () => {
  try {
    const clientsSnap = await getDocs(collection(db, 'clients'));
    const clients = await Promise.all(
      clientsSnap.docs.map(async (docSnap) => {
        const client = docSnap.data();
        client.id = docSnap.id;

        const txSnap = await getDocs(
          collection(doc(db, 'clients', client.id), 'transactions')
        );
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
    await deleteDoc(
      doc(db, 'clients', clientId, 'transactions', transactionId)
    );
    console.log(`🗑 Transacción ${transactionId} eliminada`);
  } catch (error) {
    console.error('❌ Error al eliminar transacción:', error);
  }
};

/**
 * 🔁 Actualizar una transacción y marcar lastUpdated en el cliente
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
