import React, { useState, useMemo } from 'react';
import ExportModal from './ExportModal';

const TransactionsView = ({ clients }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const allTransactions = useMemo(() => {
    return clients.flatMap(client =>
      client.transactions.map(transaction => ({
        ...transaction,
        clientName: client.name
      }))
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [clients]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      const matchClient = tx.clientName.toLowerCase().includes(searchClient.toLowerCase());
      const matchType = typeFilter ? tx.type === typeFilter : true;
      const matchDateFrom = dateFrom ? new Date(tx.timestamp) >= new Date(dateFrom) : true;
      const matchDateTo = dateTo ? new Date(tx.timestamp) <= new Date(dateTo) : true;
      const matchMinAmount = minAmount ? tx.amount >= Number(minAmount) : true;
      const matchMaxAmount = maxAmount ? tx.amount <= Number(maxAmount) : true;
      return matchClient && matchType && matchDateFrom && matchDateTo && matchMinAmount && matchMaxAmount;
    });
  }, [allTransactions, searchClient, typeFilter, dateFrom, dateTo, minAmount, maxAmount]);

  const totalIngresos = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEgresos = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoDisponible = totalIngresos + totalEgresos;

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

      {/* Filtros */}
      <div className="bg-white shadow p-4 rounded-lg mb-4 space-y-4 md:space-y-0 md:grid md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Buscar por cliente"
          className="border px-4 py-2 rounded-lg w-full"
          value={searchClient}
          onChange={(e) => setSearchClient(e.target.value)}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full"
        >
          <option value="">Todos los tipos</option>
          <option value="deposit">Depósito</option>
          <option value="withdraw">Retiro</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="border px-4 py-2 rounded-lg w-full"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="border px-4 py-2 rounded-lg w-full"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <input
          type="number"
          placeholder="Monto mínimo"
          className="border px-4 py-2 rounded-lg w-full"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Monto máximo"
          className="border px-4 py-2 rounded-lg w-full"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto">
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
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{transaction.clientName}</td>
                  <td className={`p-2 ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="p-2">{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td className="p-2 capitalize">{transaction.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen final */}
      <div className="text-right mt-4 text-sm text-gray-600 space-y-1">
        <div>Ingresos totales: <span className="text-green-600 font-semibold">${totalIngresos.toLocaleString()}</span></div>
        <div>Egresos totales: <span className="text-red-600 font-semibold">${Math.abs(totalEgresos).toLocaleString()}</span></div>
        <div>Saldo disponible: <span className="font-bold">${saldoDisponible.toLocaleString()}</span></div>
      </div>

      {/* Modal de exportación */}
      {showExportModal && (
        <ExportModal
          clients={clients}
          transactions={filteredTransactions} // ✅ Exportar solo los filtrados
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default TransactionsView;
