import React, { useState } from 'react';
import ExportModal from './ExportModal';

const TransactionsView = ({ clients }) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const allTransactions = clients.flatMap(client => 
    client.transactions.map(transaction => ({
      ...transaction,
      clientName: client.name
    }))
  );

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Movimientos Generales</h2>
        <button 
          onClick={() => setShowExportModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Exportar Datos
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Monto</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {allTransactions.map((transaction, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{transaction.clientName}</td>
                <td className={`p-2 ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${transaction.amount.toLocaleString()}
                </td>
                <td className="p-2">{new Date(transaction.timestamp).toLocaleString()}</td>
                <td className="p-2">{transaction.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showExportModal && (
        <ExportModal 
          clients={clients} 
          onClose={() => setShowExportModal(false)} 
        />
      )}
    </div>
  );
};

export default TransactionsView;

// DONE