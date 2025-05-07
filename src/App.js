// src/App.js
import React, { useState, useEffect } from 'react'
import Login             from './components/Login'
import LayoutHeader      from './components/LayoutHeader'
import TabNavigation     from './components/TabNavigation'
import GeneralBalanceView from './components/GeneralBalanceView'
import ClientsDatabase   from './components/ClientsDatabase'
import TransactionsView  from './components/TransactionsView'
import BinanceBotPanel   from './components/BinanceBotPanel'
import OperationTab      from './components/OperationTab'
import BitsoPanel        from './components/BitsoPanel'   // ← Nueva pestaña BITSO

import { db } from './firebase/config'
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore'
import { uploadClientsToFirebase } from './firebase/firebaseUploader'

const App = () => {
  // Estado de sesión
  const [user, setUser] = useState(null)
  // Estado de pestaña activa y datos de clientes
  const [activeTab, setActiveTab] = useState(1)
  const [clients, setClients] = useState([])
  const [syncMessage, setSyncMessage] = useState('')

  // Carga de datos solo cuando hay usuario
  useEffect(() => {
    if (!user) return
    const unsubscribe = onSnapshot(collection(db, 'clients'), async snapshot => {
      const updated = await Promise.all(
        snapshot.docs.map(async docSnap => {
          const c = docSnap.data()
          c.id = docSnap.id
          c.createdAt   = c.createdAt   ? new Date(c.createdAt)   : new Date()
          c.lastUpdated = c.lastUpdated ? new Date(c.lastUpdated) : c.createdAt

          const txSnap = await getDocs(collection(doc(db, 'clients', c.id), 'transactions'))
          c.transactions = txSnap.docs.map(tx => {
            const d = tx.data()
            d.id = tx.id
            return d
          })
          return c
        })
      )
      // Ordenar por última actualización
      updated.sort((a, b) => {
        const ta = (b.lastUpdated || b.createdAt).getTime()
        const tb = (a.lastUpdated || a.createdAt).getTime()
        return ta - tb
      })
      setClients(updated)
    })
    return () => unsubscribe()
  }, [user])

  // Función para actualizar clientes manualmente
  const updateClients = async newClients => {
    setClients(newClients)
    try {
      await uploadClientsToFirebase(newClients)
      setSyncMessage(`✅ Sincronizado: ${new Date().toLocaleTimeString()}`)
    } catch {
      setSyncMessage('❌ Error al sincronizar con Firebase')
    }
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
      <LayoutHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {syncMessage && (
          <div className="text-sm text-center mb-4 text-green-600">
            {syncMessage}
          </div>
        )}

        {activeTab === 1 && <GeneralBalanceView clients={clients} />}
        {activeTab === 2 && <ClientsDatabase clients={clients} updateClients={updateClients} />}
        {activeTab === 3 && <TransactionsView clients={clients} />}
        {activeTab === 4 && <BinanceBotPanel />}
        {activeTab === 5 && <OperationTab />}
        {activeTab === 6 && <BitsoPanel />}  {/* ← Pestaña BITSO */}
      </div>
    </div>
  )
}

export default App