export const uploadClientsToFirebase = async (clientsData) => {
  const batch = writeBatch(db);

  try {
    for (const client of clientsData) {
      const clientId = client.id || doc(collection(db, 'clients')).id;
      const clientRef = doc(db, 'clients', clientId);

      // Usar lastUpdated existente si ya está definido, si no, usar createdAt o la fecha actual
      const clientDocData = {
        name: client.name,
        balance: client.balance,
        createdAt: client.createdAt || new Date().toISOString(),
        lastUpdated: client.lastUpdated || client.createdAt || new Date().toISOString()
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
