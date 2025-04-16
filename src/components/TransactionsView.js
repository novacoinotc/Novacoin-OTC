
import React from 'react';

const TransactionsView = ({ clients }) => {
  const allTransactions = clients.flatMap(client =>
    client.transactions.map(tx => ({
      ...tx,
      clientName: client.name
    }))
  );

  const sortedTransactions = [...allTransactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Movimientos Generales</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Monto</th>
              <th className="p-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{tx.clientName}</td>
                <td className="p-2">{tx.type}</td>
                <td className={`p-2 ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${tx.amount.toLocaleString()}
                </td>
                <td className="p-2">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsView;
