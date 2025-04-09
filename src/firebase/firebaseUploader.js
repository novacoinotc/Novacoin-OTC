import { db } from './config';
import {
  collection,
  writeBatch,
  doc,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

// 🔼 Subir clientes + transacciones (con control de duplicados)
export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      const clientId = client.id || doc(collection(db, 'clients')).id;
      const clientRef = doc(db, 'clients', clientId);

      const clientDocData = {
        name: client.name,
        balance: client.balance,
        createdAt: client.createdAt || new Date().toISOString()
      };

      batch.set(clientRef, clientDocData);

      if (client.transactions && client.transactions.length > 0) {
        const transactionsCollectionRef = collection(clientRef, 'transactions');

        client.transactions.forEach(transaction => {
          const transactionId = transaction.id || doc(transactionsCollectionRef).id;
          const transactionRef = doc(transactionsCollectionRef, transactionId);

          const transactionData = {
            ...transaction,
            id: transactionId, // aseguramos que tenga un ID
            timestamp: transaction.timestamp || new Date().toISOString()
          };

          batch.set(transactionRef, transactionData);
        });
      }
    }

    await batch.commit();
    console.log('✅ Clientes y transacciones subidos exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error subiendo clientes:', error);
    throw error;
  }
};

// 🧪 Carga de prueba (puedes eliminarla si ya no la usas)
export const uploadClientsFromLocalData = async () => {
  const clientsData = [
    {
      name: "Juan Pérez",
      balance: 50000,
      createdAt: new Date().toISOString(),
      transactions: [
        {
          type: 'deposit',
          amount: 50000,
          concept: 'Depósito inicial'
        }
      ]
    },
    {
      name: "María González",
      balance: 75000,
      createdAt: new Date().toISOString(),
      transactions: [
        {
          type: 'deposit',
          amount: 75000,
          concept: 'Transferencia bancaria'
        }
      ]
    }
  ];

  try {
    await uploadClientsToFirebase(clientsData);
  } catch (error) {
    console.error('Error en la carga de datos:', error);
  }
};

// 🔽 Descargar clientes + transacciones (respetando el ID)
export const loadClientsFromFirebase = async () => {
  try {
    const clientsCollection = collection(db, 'clients');
    const snapshot = await getDocs(clientsCollection);

    const clients = await Promise.all(snapshot.docs.map(async docSnap => {
      const client = docSnap.data();
      client.id = docSnap.id;

      const transactionsCollectionRef = collection(doc(db, 'clients', client.id), 'transactions');
      const txSnapshot = await getDocs(transactionsCollectionRef);

      client.transactions = txSnapshot.docs.map(txDoc => {
        const tx = txDoc.data();
        tx.id = txDoc.id;
        return tx;
      });

      return client;
    }));

    return clients;
  } catch (error) {
    console.error('❌ Error al obtener clientes desde Firebase:', error);
    return [];
  }
};

// 🗑 Eliminar cliente en Firebase
export const deleteClientFromFirebase = async (clientId) => {
  try {
    await deleteDoc(doc(db, 'clients', clientId));
    console.log(`🗑 Cliente ${clientId} eliminado de Firebase`);
  } catch (error) {
    console.error('❌ Error al eliminar cliente de Firebase:', error);
  }
};

// 🗑 Eliminar transacción en Firebase
export const deleteTransactionFromFirebase = async (clientId, transactionId) => {
  try {
    await deleteDoc(doc(db, 'clients', clientId, 'transactions', transactionId));
    console.log(`🗑 Transacción ${transactionId} eliminada de Firebase`);
  } catch (error) {
    console.error('❌ Error al eliminar transacción en Firebase:', error);
  }
};

// 🔁 Actualizar transacción en Firebase
export const updateTransactionInFirebase = async (clientId, transaction) => {
  try {
    const ref = doc(db, 'clients', clientId, 'transactions', transaction.id);
    await updateDoc(ref, transaction);
    console.log(`🔁 Transacción ${transaction.id} actualizada en Firebase`);
  } catch (error) {
    console.error('❌ Error al actualizar transacción en Firebase:', error);
  }
};
