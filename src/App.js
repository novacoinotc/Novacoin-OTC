// src/App.js
import React, { useState, useEffect } from 'react'
import Login from './components/Login'                  // ← Importa tu nuevo componente de login
import LayoutHeader   from './components/LayoutHeader'
import TabNavigation  from './components/TabNavigation'
import GeneralBalanceView from './components/GeneralBalanceView'
import ClientsDatabase   from './components/ClientsDatabase'
import TransactionsView  from './components/TransactionsView'
import BinanceBotPanel   from './components/BinanceBotPanel'
import OperationTab      from './components/OperationTab'

import { db } from './firebase/config'
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore'
import { uploadClientsToFirebase } from './firebase/firebaseUploader'

const App = () => {
  // Estado de sesión
  const [user, setUser] = useState(null)
  // Sólo cargamos datos de Firebase cuando ya estamos autenticados
  const [activeTab, setActiveTab] = useState(1)
  const [clients, setClients]     = useState([])
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    if (!user) return
    const unsubscribe = onSnapshot(collection(db, 'clients'), async snapshot => {
      const updated = await Promise.all(
        snapshot.docs.map(async docSnap => {
          const c = docSnap.data()
          c.id = docSnap.id
          c.createdAt   = c.createdAt   ? new Date(c.createdAt)    : new Date()
          c.lastUpdated = c.lastUpdated ? new Date(c.lastUpdated)  : c.createdAt

          const txSnap = await getDocs(collection(doc(db,'clients',c.id),'transactions'))
          c.transactions = txSnap.docs.map(tx => {
            const d = tx.data()
            d.id = tx.id
            return d
          })
          return c
        })
      )
      updated.sort((a,b) => (new Date(b.lastUpdated||b.createdAt) - new Date(a.lastUpdated||a.createdAt)))
      setClients(updated)
    })
    return () => unsubscribe()
  }, [user])

  const updateClients = async newClients => {
    setClients(newClients)
    try {
      await uploadClientsToFirebase(newClients)
      setSyncMessage(`✅ Sincronizado: ${new Date().toLocaleTimeString()}`)
    } catch {
      setSyncMessage('❌ Error al sincronizar con Firebase')
    }
  }

  // Si no hay usuario, mostramos sólo la pantalla de login
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
      </div>
    </div>
  )
}

export default App