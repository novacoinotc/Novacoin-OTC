import React, { useState, useEffect } from 'react';

const EditTransactionModal = ({ transaction, client, onClose, onUpdate, onDelete }) => {
  const [editedTransaction, setEditedTransaction] = useState({
    type: transaction.type,
    amount: Math.abs(transaction.amount),
    timestamp: transaction.timestamp,
    concept: transaction.concept || ''
  });

  const handleSave = () => {
    if (!editedTransaction.amount || Number(editedTransaction.amount) <= 0) return;

    const updatedTransaction = {
      ...transaction,
      id: transaction.id, // ✅ aseguramos que el id esté presente
      type: editedTransaction.type,
      amount:
        editedTransaction.type === 'withdraw'
          ? -Math.abs(editedTransaction.amount)
          : Math.abs(editedTransaction.amount),
      timestamp: editedTransaction.timestamp,
      concept: editedTransaction.concept
    };

    onUpdate(client.id, updatedTransaction);
    onClose();
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
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Movimiento</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tipo de Transacción</label>
          <div className="flex space-x-2">
            {['deposit', 'withdraw'].map((type) => (
              <button
                key={type}
                onClick={() => setEditedTransaction({ ...editedTransaction, type })}
                className={`
                  px-4 py-2 rounded-full transition-all 
                  ${editedTransaction.type === type
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
            value={editedTransaction.amount}
            onChange={(e) =>
              setEditedTransaction({
                ...editedTransaction,
                amount: Number(e.target.value)
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Concepto (Opcional)</label>
          <input
            type="text"
            placeholder="Descripción del movimiento"
            value={editedTransaction.concept}
            onChange={(e) =>
              setEditedTransaction({
                ...editedTransaction,
                concept: e.target.value
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Fecha</label>
          <input
            type="datetime-local"
            value={new Date(editedTransaction.timestamp).toISOString().slice(0, 16)}
            onChange={(e) =>
              setEditedTransaction({
                ...editedTransaction,
                timestamp: new Date(e.target.value).toISOString()
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={!editedTransaction.amount}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Guardar Cambios
          </button>
          <button
            onClick={() => {
              onDelete(client.id, transaction);
              onClose();
            }}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
