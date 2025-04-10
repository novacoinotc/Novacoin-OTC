import React from 'react';

const ClientBalanceCard = ({ client }) => {
  return (
    <div className={`
      bg-white rounded-xl shadow-md p-4 transition-all 
      hover:shadow-lg hover:scale-[1.02]
      ${client.balance >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}
    `}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
          <p className={`
            text-2xl font-bold mt-2
            ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}
          `}>
            ${client.balance.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${client.balance >= 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          `}>
            {client.balance >= 0 ? 'Positivo' : 'Negativo'}
          </span>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Transacciones: {client.transactions.length}</p>
        <p>Registrado: {new Date(client.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const GeneralBalanceView = ({ clients }) => {
  const totalBalance = clients.reduce((acc, client) => acc + client.balance, 0);
  const clientsWithNegativeBalance = clients.filter(client => client.balance < 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700">Saldo Total</h3>
          <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${totalBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700">Clientes con Préstamos</h3>
          <p className="text-3xl font-bold text-blue-600">
            {clientsWithNegativeBalance.length}
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700">Total Préstamos</h3>
          <p className="text-3xl font-bold text-red-600">
            ${Math.abs(clientsWithNegativeBalance.reduce((acc, client) => acc + client.balance, 0)).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Saldo por Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <ClientBalanceCard key={client.id} client={client} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralBalanceView;

// DONE