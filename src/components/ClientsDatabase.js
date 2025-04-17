import React, { useState } from 'react';
import ClientTransactionModal from './ClientTransactionModal';
import ClientHistoryModal from './ClientHistoryModal';

import {
  deleteClientFromFirebase,
  deleteTransactionFromFirebase,
  updateTransactionInFirebase
} from '../firebase/firebaseUploader';

const ClientsDatabase = ({ clients, updateClients }) => {
  const [newClient, setNewClient] = useState({ name: '', balance: 0 });
  const [selectedClient, setSelectedClient] = useState(null);
  const [historyClient, setHistoryClient] = useState(null);

  const handleAddClient = () => {
    if (newClient.name && newClient.balance !== undefined) {
      const clientToAdd = {
        ...newClient,
        id: crypto.randomUUID(),
        transactions: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString() // AUTPW
      };
      updateClients([clientToAdd, ...clients]);
      setNewClient({ name: '', balance: 0 });
    }
  };

  const handleTransaction = (clientId, transaction) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const newTransaction = {
          ...transaction,
          timestamp: new Date().toISOString(),
          id: crypto.randomUUID()
        };
        return {
          ...client,
          balance: client.balance + newTransaction.amount,
          transactions: [...client.transactions, newTransaction],
          lastUpdated: new Date().toISOString() // AUTPW
        };
      }
      return client;
    });

    updateClients(updatedClients);
  };

  const handleUpdateTransaction = (clientId, updatedTransaction) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const original = client.transactions.find(t => t.id === updatedTransaction.id);
        const balanceDiff = updatedTransaction.amount - original.amount;

        const newTransactions = client.transactions.map(t =>
          t.id === updatedTransaction.id ? updatedTransaction : t
        );

        const updatedClient = {
          ...client,
          balance: client.balance + balanceDiff,
          transactions: newTransactions,
          lastUpdated: new Date().toISOString() // AUTPW
        };

        updateTransactionInFirebase(clientId, updatedTransaction);
        return updatedClient;
      }
      return client;
    });

    updateClients(updatedClients);
  };

  const handleDeleteTransaction = (clientId, transactionToDelete) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const newTransactions = client.transactions.filter(t => t.id !== transactionToDelete.id);
        return {
          ...client,
          balance: client.balance - transactionToDelete.amount,
          transactions: newTransactions,
          lastUpdated: new Date().toISOString() // AUTPW
        };
      }
      return client;
    });

    updateClients(updatedClients);
    deleteTransactionFromFirebase(clientId, transactionToDelete.id);
  };

  const handleDeleteClient = (clientId) => {
    const confirmDelete = window.confirm("¿Estás seguro de eliminar este elemento?");
    if (!confirmDelete) return;
    const updatedClients = clients.filter(client => client.id !== clientId);
    updateClients(updatedClients);
    deleteClientFromFirebase(clientId);
  };

  // Ordenar por fecha de última actualización o creación
  const sortedClients = [...clients].sort((a, b) => {
    const aTime = new Date(a.lastUpdated || a.createdAt).getTime();
    const bTime = new Date(b.lastUpdated || b.createdAt).getTime();
    return bTime - aTime;
  });

  return (
    <div className="mt-4 px-2">
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-4">
        <input
          type="text"
          placeholder="Nombre del Cliente"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="number"
          placeholder="Saldo Inicial"
          value={newClient.balance}
          onChange={(e) => setNewClient({ ...newClient, balance: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleAddClient}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Añadir Cliente
        </button>
      </div>

      {sortedClients.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No hay clientes registrados</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="min-w-full text-sm text-left text-gray-700 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Saldo</th>
                <th className="p-3">Fecha de Registro</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map(client => (
                <tr key={client.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{client.name}</td>
                  <td className={`p-3 ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${client.balance.toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Movimientos
                    </button>
                    <button
                      onClick={() => setHistoryClient(client)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Historial
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClient && (
        <ClientTransactionModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onTransaction={handleTransaction}
        />
      )}

      {historyClient && (
        <ClientHistoryModal
          client={historyClient}
          onClose={() => setHistoryClient(null)}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}
    </div>
  );
};

export default ClientsDatabase;