import React, { useState, useEffect, useRef } from 'react'

const OPERATORS = [
  { name: 'Gael',      color: '#FACC15', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Christian', color: '#F97316', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Santy',     color: '#3B82F6', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Flaco',     color: '#7F1D1D', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Andy',      color: '#EC4899', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Issac',     color: '#8B5CF6', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Andres',    color: '#22C55E', purchaseOffset: 0.00, saleOffset: 0.03, usePurchaseForFinal: false },
  { name: 'German',    color: '#A5B4FC', purchaseOffset: 0.00, saleOffset: 0.03, usePurchaseForFinal: false },
]

const NETWORK_COST = 2 // USDT

export default function OperationView() {
  const containerRef = useRef(null)

  // Cargar últimos valores de localStorage
  const [deposited, setDeposited] = useState(() => localStorage.getItem('op_deposit') || '')
  const [spot, setSpot]         = useState(() => localStorage.getItem('op_spot')     || '')
  const [operator, setOperator] = useState(() => localStorage.getItem('op_operator') || 'Issac')

  useEffect(() => { localStorage.setItem('op_deposit', deposited) }, [deposited])
  useEffect(() => { localStorage.setItem('op_spot',     spot)     }, [spot])
  useEffect(() => { localStorage.setItem('op_operator', operator) }, [operator])

  const op     = OPERATORS.find(o => o.name === operator)
  const depNum = parseFloat(deposited) || 0
  const spotNum= parseFloat(spot)      || 0

  // precios
  const buyPrice  = spotNum + op.purchaseOffset
  const sellPrice = spotNum + op.saleOffset

  // cálculos
  const rawAmount   = depNum / buyPrice
  const finalAmount = op.usePurchaseForFinal
    ? rawAmount - NETWORK_COST
    : depNum / spotNum - NETWORK_COST

  // usar la versión global de html2canvas
  const copyAsImage = async () => {
    if (!containerRef.current) return
    const canvas = await window.html2canvas(containerRef.current)
    canvas.toBlob(blob => {
      if (!blob) return
      const item = new ClipboardItem({ 'image/png': blob })
      navigator.clipboard.write([item])
    })
  }

  return (
    <div 
      ref={containerRef}
      className="max-w-md mx-auto p-4 border rounded-lg shadow-lg space-y-4"
      style={{ borderColor: op.color }}
    >
      <h2 className="text-xl font-bold text-center" style={{ color: op.color }}>
        NovaCoin · Operación
      </h2>

      <div>
        <label className="block text-sm font-semibold mb-1">Operador</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={operator}
          onChange={e => setOperator(e.target.value)}
        >
          {OPERATORS.map(o => (
            <option key={o.name} value={o.name}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm">CCY Depositado (MXN)</label>
          <input
            type="number"
            className="w-full border px-2 py-1 rounded"
            value={deposited}
            onChange={e => setDeposited(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Precio Spot</label>
          <input
            type="number"
            className="w-full border px-2 py-1 rounded"
            value={spot}
            onChange={e => setSpot(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-100 p-2 rounded space-y-1">
        <div className="flex justify-between"><span>TC Spot</span><span>${spotNum.toFixed(3)}</span></div>
        <div className="flex justify-between"><span>Precio compra</span><span>${buyPrice.toFixed(3)}</span></div>
        <div className="flex justify-between"><span>Precio venta</span><span>${sellPrice.toFixed(3)}</span></div>
        <div className="flex justify-between"><span>C. de RED</span><span>{NETWORK_COST} USDT</span></div>
      </div>

      <div className="text-lg font-semibold flex justify-between">
        <span>Cantidad</span>
        <span>{finalAmount.toFixed(3)} USDT</span>
      </div>

      <div className="flex justify-between space-x-2">
        <button
          onClick={copyAsImage}
          className="flex-1 bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
        >
          📸 Copiar como imagen
        </button>
        <button
          onClick={() => { setDeposited(''); setSpot('') }}
          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-500"
        >
          ❌ Limpiar
        </button>
      </div>
    </div>
  )
}
