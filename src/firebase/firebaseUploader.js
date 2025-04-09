import { db } from './config';
import { 
  collection, 
  addDoc, 
  writeBatch,
  doc
} from 'firebase/firestore';

export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      // Crear documento de cliente
      const clientRef = doc(collection(db, 'clients'));
      
      // Preparar datos del cliente
      const clientDocData = {
        name: client.name,
        balance: client.balance,
        createdAt: client.createdAt || new Date().toISOString()
      };

      // Agregar cliente al batch
      batch.set(clientRef, clientDocData);

      // Subir transacciones del cliente
      if (client.transactions && client.transactions.length > 0) {
        const transactionsCollectionRef = collection(clientRef, 'transactions');
        
        client.transactions.forEach(transaction => {
          const transactionRef = doc(transactionsCollectionRef);
          const transactionData = {
            ...transaction,
            timestamp: transaction.timestamp || new Date().toISOString()
          };
          
          batch.set(transactionRef, transactionData);
        });
      }
    }

    // Ejecutar batch
    await batch.commit();
    
    console.log('Clientes y transacciones subidos exitosamente');
    return true;
  } catch (error) {
    console.error('Error subiendo clientes:', error);
    throw error;
  }
};

// Ejemplo de uso
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

// DONE