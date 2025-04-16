import React, { useState } from 'react';

const ClientTransactionModal = ({ client, onClose, onTransaction }) => {
  const [transaction, setTransaction] = useState({
    type: 'deposit',
    amount: '',
    concept: ''
  });

  const handleTransactionSubmit = () => {
    if (transaction.amount && Number(transaction.amount) > 0) {
      const finalTransaction = {
        ...transaction,
        amount: transaction.type === 'deposit'
          ? Math.abs(Number(transaction.amount))
          : -Math.abs(Number(transaction.amount)),
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID() // ✅ ID único para Firebase
      };

      onTransaction(client.id, finalTransaction);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Nuevo Movimiento para {client.name}
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tipo de Transacción</label>
          <div className="flex space-x-2">
            {['deposit', 'withdraw'].map(type => (
              <button
                key={type}
                onClick={() => setTransaction({ ...transaction, type })}
                className={`
                  px-4 py-2 rounded-full transition-all 
                  ${transaction.type === type
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {type === 'deposit' ? 'Depósito' : 'Retiro'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Monto</label>
          <input
            type="number"
            placeholder="Ingrese el monto"
            value={transaction.amount}
            onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Concepto (Opcional)</label>
          <input
            type="text"
            placeholder="Descripción del movimiento"
            value={transaction.concept}
            onChange={(e) => setTransaction({ ...transaction, concept: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          onClick={handleTransactionSubmit}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
          disabled={!transaction.amount}
        >
          Registrar Movimiento
        </button>
      </div>
    </div>
  );
};

export default ClientTransactionModal;
