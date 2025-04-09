import React, { useState } from 'react';
import EditTransactionModal from './EditTransactionModal';

const ClientHistoryModal = ({ client, onClose, onUpdateTransaction, onDeleteTransaction }) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const sortedTransactions = [...client.transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleUpdateTransaction = (clientId, updatedTransaction) => {
    onUpdateTransaction(clientId, updatedTransaction);
  };

  const handleDeleteTransaction = (clientId, transactionToDelete) => {
    onDeleteTransaction(clientId, transactionToDelete);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Historial de {client.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No hay transacciones
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-right">Monto</th>
                  <th className="p-4 text-left">Concepto</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-600">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-semibold
                        ${transaction.amount > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }
                      `}>
                        {transaction.type === 'deposit' ? 'Depósito' : 'Retiro'}
                      </span>
                    </td>
                    <td className={`
                      p-4 text-right font-semibold
                      ${transaction.amount > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                      }
                    `}>
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-600">
                      {transaction.concept || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-gray-600">
            Total de transacciones: {sortedTransactions.length}
          </div>
          <div className={`
            text-xl font-bold
            ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}
          `}>
            Saldo actual: ${client.balance.toLocaleString()}
          </div>
        </div>

        {selectedTransaction && (
          <EditTransactionModal
            transaction={selectedTransaction}
            client={client}
            onClose={() => setSelectedTransaction(null)}
            onUpdate={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>
    </div>
  );
};

export default ClientHistoryModal;
