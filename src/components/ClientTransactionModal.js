
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ClientTransactionModal = ({ client, onClose, onSave }) => {
  const [name, setName] = useState(client?.name || '');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState(client?.transactions || []);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return;

    const newTransaction = {
      id: uuidv4(),
      amount: parsedAmount,
      type: parsedAmount >= 0 ? 'Ingreso' : 'Egreso',
      createdAt: new Date().toISOString()
    };

    const updatedTransactions = [...transactions, newTransaction];
    const newBalance = updatedTransactions.reduce((acc, tx) => acc + tx.amount, 0);

    onSave({
      id: client?.id || uuidv4(),
      name,
      transactions: updatedTransactions,
      balance: newBalance,
      createdAt: client?.createdAt || new Date().toISOString()
    });

    setTransactions(updatedTransactions);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
        <input
          type="text"
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Nombre del Cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Guardar
          </button>
        </div>

        <div className="mt-4">
          <h4 className="font-bold mb-2">Historial de Movimientos</h4>
          <ul className="max-h-40 overflow-y-auto space-y-1 text-sm">
            {transactions.map(tx => (
              <li key={tx.id} className="flex justify-between">
                <span>{tx.type}</span>
                <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${tx.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClientTransactionModal;
