// src/components/OperationTab.js
import React, { useState } from 'react'

const OPERATORS = [
  { name: 'Gael',      color: '#FACC15' }, // amarillo
  { name: 'Christian', color: '#F97316' }, // naranja
  { name: 'Santy',     color: '#3B82F6' }, // azul
  { name: 'Flaco',     color: '#7F1D1D' }, // tinto
  { name: 'Andy',      color: '#EC4899' }, // rosa
  { name: 'Issac',     color: '#8B5CF6' }, // morado
  { name: 'Andres',    color: '#22C55E' }, // verde
  { name: 'German',    color: '#A5B4FC' }  // morado claro
]

export default function OperationTab() {
  const [mode, setMode] = useState('cliente')   // 'cliente' | 'operador'
  const [deposit, setDeposit] = useState('')    // MXN depositados
  const [tc, setTc]         = useState('')      // TC para cliente
  const [networkFee, setNetworkFee] = useState('') // USDT

  // Operador
  const [spotPrice, setSpotPrice] = useState('')
  const [buyPrice, setBuyPrice]   = useState('')
  const [sellFactor, setSellFactor] = useState('')
  const [operator, setOperator]     = useState('Issac')

  // Buscar color
  const op = OPERATORS.find(o => o.name === operator) || OPERATORS[5]
  const sellColor = op.color

  // Cálculos
  const calcClientAmount = () => {
    const dep = parseFloat(deposit) || 0
    const rate = parseFloat(tc)       || 1
    const fee  = parseFloat(networkFee)|| 0
    return dep / rate - fee
  }
  const calcOperatorAmount = () => {
    const dep = parseFloat(deposit) || 0
    const bp  = parseFloat(buyPrice) || 1
    const coef= parseFloat(sellFactor)|| 1
    const fee = parseFloat(networkFee)|| 0
    return (dep / bp) * coef - fee
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Operación / Cotizador MXN–USDT</h2>

      {/* Modo */}
      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setMode('cliente')}
          className={`px-4 py-2 rounded-l-full border ${
            mode==='cliente' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Cliente
        </button>
        <button
          onClick={() => setMode('operador')}
          className={`px-4 py-2 rounded-r-full border ${
            mode==='operador' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Operador
        </button>
      </div>

      {/* Si es operador, desplegable de operador */}
      {mode === 'operador' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Operador</label>
          <select
            value={operator}
            onChange={e => setOperator(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            {OPERATORS.map(o => (
              <option key={o.name} value={o.name}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabla */}
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-2">Concepto</th>
            <th className="p-2 text-right">$</th>
            <th className="p-2">Base</th>
          </tr>
        </thead>
        <tbody>
          {/* Depósito */}
          <tr className="border-b">
            <td className="p-2">CCY Depositado</td>
            <td className="p-2 text-right">
              <input
                type="number"
                value={deposit}
                onChange={e => setDeposit(e.target.value)}
                className="w-full text-right px-2 py-1 border rounded"
                placeholder="MXN"
              />
            </td>
            <td className="p-2">MXN</td>
          </tr>

          {/* Modo cliente u operador */}
          {mode === 'cliente' ? (
            <tr className="border-b">
              <td className="p-2">TC</td>
              <td className="p-2 text-right">
                <input
                  type="number"
                  value={tc}
                  onChange={e => setTc(e.target.value)}
                  className="w-full text-right px-2 py-1 border rounded"
                  placeholder="USDT/MXN"
                />
              </td>
              <td className="p-2">USDT/MXN</td>
            </tr>
          ) : (
            <>
              <tr className="border-b">
                <td className="p-2">P. Spot</td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    value={spotPrice}
                    onChange={e => setSpotPrice(e.target.value)}
                    className="w-full text-right px-2 py-1 border rounded"
                    placeholder="MXN/USDT"
                  />
                </td>
                <td className="p-2">MXN/USDT</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">P. de compra</td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    value={buyPrice}
                    onChange={e => setBuyPrice(e.target.value)}
                    className="w-full text-right px-2 py-1 border rounded"
                    placeholder="MXN/USDT"
                  />
                </td>
                <td className="p-2">MXN/USDT</td>
              </tr>
              {/* Aquí remarcamos C. de venta con el color del operador */}
              <tr className="border-b">
                <td className="p-2">C. de venta</td>
                <td
                  className="p-2 text-right font-semibold"
                  style={{ color: sellColor }}
                >
                  <input
                    type="number"
                    value={sellFactor}
                    onChange={e => setSellFactor(e.target.value)}
                    className="w-full text-right px-2 py-1 border rounded"
                    placeholder="Ej: 1.002"
                    style={{ borderColor: sellColor }}
                  />
                </td>
                <td className="p-2">mxn/usdt</td>
              </tr>
            </>
          )}

          {/* Comisión de red */}
          <tr className="border-b">
            <td className="p-2">C. de RED</td>
            <td className="p-2 text-right">
              <input
                type="number"
                value={networkFee}
                onChange={e => setNetworkFee(e.target.value)}
                className="w-full text-right px-2 py-1 border rounded"
                placeholder="USDT"
              />
            </td>
            <td className="p-2">USDT</td>
          </tr>
        </tbody>
      </table>

      {/* Resultado */}
      <div className="flex justify-between items-center text-lg font-bold">
        <span>Cantidad</span>
        <span>
          {mode === 'cliente'
            ? calcClientAmount().toLocaleString(undefined, { minimumFractionDigits: 6 })
            : calcOperatorAmount().toLocaleString(undefined, { minimumFractionDigits: 6 })
          } USDT
        </span>
      </div>
    </div>
  )
}
