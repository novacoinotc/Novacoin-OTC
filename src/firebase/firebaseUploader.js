// src/firebase/firebaseUploader.js

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
 * Dado un valor que puede ser:
 * - Firestore Timestamp (tiene .toDate())
 * - JS Date
 * - string (ISO u otro formato)
 * - number (milisegundos)
 * devuelve siempre un ISO string válido.
 */
function normalizeToISO(value) {
  try {
    // 1) Firestore Timestamp
    if (value && typeof value.toDate === 'function') {
      const d = value.toDate();
      if (!isNaN(d.getTime())) return d.toISOString();
    }

    // 2) JS Date
    if (value instanceof Date) {
      if (!isNaN(value.getTime())) return value.toISOString();
    }

    // 3) number (milisegundos) o string
    if (typeof value === 'number' || typeof value === 'string') {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  } catch (e) {
    // cualquier error de parseo, cae al fallback
  }

  // 4) Fallback: ahora
  return new Date().toISOString();
}

/**
 * 🔼 Sube TOTALES de clientes y transacciones con timestamps normalizados
 */
export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      // ID (nuevo o existente)
      const clientId  = client.id || doc(collection(db, 'clients')).id;
      const clientRef = doc(db, 'clients', clientId);

      // Normalizo createdAt / lastUpdated
      const createdAtIso   = normalizeToISO(client.createdAt);
      const lastUpdatedIso = normalizeToISO(client.lastUpdated || client.createdAt || createdAtIso);

      batch.set(clientRef, {
        name:       client.name,
        balance:    client.balance,
        createdAt:  createdAtIso,
        lastUpdated: lastUpdatedIso
      });

      // Subo sus transacciones
      if (Array.isArray(client.transactions)) {
        const txColRef = collection(clientRef, 'transactions');
        for (const tx of client.transactions) {
          const txId    = tx.id  || doc(txColRef).id;
          const txRef   = doc(txColRef, txId);
          const tsIso   = normalizeToISO(tx.timestamp);

          batch.set(txRef, {
            ...tx,
            id:        txId,
            timestamp: tsIso
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
 * 🔽 Carga todos los clientes (y sus transacciones) desde Firebase
 */
export const loadClientsFromFirebase = async () => {
  try {
    const clientsSnap = await getDocs(collection(db, 'clients'));
    const clients = await Promise.all(
      clientsSnap.docs.map(async docSnap => {
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
 * 🗑 Eliminar una transacción  
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
 * 🔁 Actualizar una transacción + marcar lastUpdated en el cliente
 */
export const updateTransactionInFirebase = async (clientId, transaction) => {
  try {
    const txRef     = doc(db, 'clients', clientId, 'transactions', transaction.id);
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
