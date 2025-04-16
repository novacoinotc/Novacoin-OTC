import React from 'react';
import { FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';

const ClientBalanceCard = ({ client, onDelete }) => {
  const handleDelete = () => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este elemento?'); // AUTPW
    if (confirmDelete) {
      onDelete(client.id);
    }
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-md p-5 transition-all 
      hover:shadow-xl hover:scale-[1.02] duration-300
      ${client.balance >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}
      break-words w-full
    `}>
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{client.name}</h3>
          <p className={`text-xl sm:text-2xl font-bold mt-1 ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${client.balance.toLocaleString()}
          </p>
        </div>
        <div className="text-right flex items-center gap-1">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${client.balance >= 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'}
          `}>
            {client.balance >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {client.balance >= 0 ? 'Positivo' : 'Negativo'}
          </span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>Transacciones: <span className="font-medium">{client.transactions.length}</span></p>
        <p>Registrado: <span className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</span></p>
      </div>

      <div className="mt-4 text-right">
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
        >
          <FaTrash className="inline" /> Eliminar
        </button>
      </div>
    </div>
  );
};

const GeneralBalanceView = ({ clients, onDeleteClient }) => {
  const clientsWithPositiveBalance = clients.filter(client => client.balance >= 0);
  const totalBalance = clientsWithPositiveBalance.reduce((acc, client) => acc + client.balance, 0);

  const clientsWithNegativeBalance = clients.filter(client => client.balance < 0);
  const totalPrestamos = clientsWithNegativeBalance.reduce((acc, client) => acc + client.balance, 0);
  const totalPrestamosAbsoluto = Math.abs(totalPrestamos); // AUTPW21

  const totalFund = totalBalance + totalPrestamosAbsoluto; // AUTPW123

  return (
    <div>
      {/* RESUMEN GENERAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-xl rounded-xl p-6 text-center border-t-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Saldo Disponible</h3>
          <p className="text-3xl font-bold text-green-600">${totalBalance.toLocaleString()}</p>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-6 text-center border-t-4 border-yellow-400">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Fondo Total</h3>
          <p className="text-3xl font-bold text-yellow-500">${totalFund.toLocaleString()}</p>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-6 text-center border-t-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Préstamos</h3>
          <p className="text-3xl font-bold text-red-600">${totalPrestamosAbsoluto.toLocaleString()}</p>
        </div>
      </div>

      {/* SALDO POR CLIENTE */}
      <div className="bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Saldo por Cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...clients].reverse().map(client => ( // AUTPW: orden más reciente arriba
            <div key={client.id} className="min-w-0">
              <ClientBalanceCard client={client} onDelete={onDeleteClient} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralBalanceView;
