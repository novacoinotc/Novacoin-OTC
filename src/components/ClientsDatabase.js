
import React, { useState, useEffect } from 'react';
import ClientTransactionModal from './ClientTransactionModal';

const ClientsDatabase = ({ clients, updateClients }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleDelete = (clientId) => {
    const confirm = window.confirm("¿Estás seguro que deseas eliminar este cliente?");
    if (!confirm) return;
    const updatedClients = clients.filter(client => client.id !== clientId);
    updateClients(updatedClients);
  };

  const handleSave = (updatedClient) => {
    const updatedClients = [updatedClient, ...clients.filter(c => c.id !== updatedClient.id)];
    updateClients(updatedClients);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Base de Clientes</h2>
        <button
          onClick={() => { setSelectedClient(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Añadir Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className={`text-xl font-bold ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${client.balance.toLocaleString()}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="px-3 py-1 text-sm rounded bg-yellow-500 text-white"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="px-3 py-1 text-sm rounded bg-red-600 text-white"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ClientTransactionModal
          client={selectedClient}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ClientsDatabase;
