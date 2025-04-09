import { db } from './config';
import { 
  collection, 
  writeBatch,
  doc,
  getDocs
} from 'firebase/firestore';

// 🔼 Subir clientes + transacciones (con control de duplicados)
export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      // Usar el id existente o generar uno nuevo
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
      client.id = docSnap.id; // <- asigna el ID a cada cliente

      const transactionsCollectionRef = collection(doc(db, 'clients', client.id), 'transactions');
      const txSnapshot = await getDocs(transactionsCollectionRef);

      client.transactions = txSnapshot.docs.map(txDoc => {
        const tx = txDoc.data();
        tx.id = txDoc.id; // <- también guardar el id de la transacción
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
