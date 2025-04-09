import React, { useState } from 'react';
import ClientTransactionModal from './ClientTransactionModal';
import ClientHistoryModal from './ClientHistoryModal';

const ClientsDatabase = ({ clients, updateClients }) => {
  const [newClient, setNewClient] = useState({ name: '', balance: 0 });
  const [selectedClient, setSelectedClient] = useState(null);
  const [historyClient, setHistoryClient] = useState(null);

  const handleAddClient = () => {
    if (newClient.name && newClient.balance !== undefined) {
      const clientToAdd = {
        ...newClient,
        id: Date.now(),
        transactions: [],
        createdAt: new Date().toISOString()
      };
      const updatedClients = [...clients, clientToAdd];
      updateClients(updatedClients);
      setNewClient({ name: '', balance: 0 });
    }
  };

  const handleTransaction = (clientId, transaction) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const newBalance = client.balance + transaction.amount;
        return {
          ...client,
          balance: newBalance,
          transactions: [...client.transactions, {
            ...transaction,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return client;
    });
    updateClients(updatedClients);
  };

  const handleUpdateTransaction = (clientId, updatedTransaction) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const originalTransaction = client.transactions.find(
          t => t.timestamp === updatedTransaction.timestamp
        );
        const balanceDifference = updatedTransaction.amount - originalTransaction.amount;
        
        return {
          ...client,
          balance: client.balance + balanceDifference,
          transactions: client.transactions.map(t => 
            t.timestamp === updatedTransaction.timestamp ? updatedTransaction : t
          )
        };
      }
      return client;
    });
    updateClients(updatedClients);
  };

  const handleDeleteTransaction = (clientId, transactionToDelete) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          balance: client.balance - transactionToDelete.amount,
          transactions: client.transactions.filter(
            t => t.timestamp !== transactionToDelete.timestamp
          )
        };
      }
      return client;
    });
    updateClients(updatedClients);
  };

  const handleDeleteClient = (clientId) => {
    const updatedClients = clients.filter(client => client.id !== clientId);
    updateClients(updatedClients);
  };

  return (
    <div className="mt-4">
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Nombre del Cliente"
          value={newClient.name}
          onChange={(e) => setNewClient({...newClient, name: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="number"
          placeholder="Saldo Inicial"
          value={newClient.balance}
          onChange={(e) => setNewClient({...newClient, balance: Number(e.target.value)})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button 
          onClick={handleAddClient}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Añadir Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No hay clientes registrados
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Saldo</th>
                <th className="p-2 text-left">Fecha de Registro</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-b">
                  <td className="p-2">{client.name}</td>
                  <td className={`p-2 ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${client.balance.toLocaleString()}
                  </td>
                  <td className="p-2 text-gray-600">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 flex space-x-2">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Movimientos
                    </button>
                    <button 
                      onClick={() => setHistoryClient(client)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      Historial
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
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

// DONE