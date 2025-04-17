import React, { useState, useEffect } from 'react';
import LayoutHeader from './components/LayoutHeader';
import TabNavigation from './components/TabNavigation';
import GeneralBalanceView from './components/GeneralBalanceView';
import ClientsDatabase from './components/ClientsDatabase';
import TransactionsView from './components/TransactionsView';
import BinanceBotPanel from './components/BinanceBotPanel';

import { db } from './firebase/config';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { uploadClientsToFirebase } from './firebase/firebaseUploader';

const App = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [clients, setClients] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');

  // 🔁 Escuchar cambios en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'clients'), async (snapshot) => {
      const updatedClients = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const client = docSnap.data();
          client.id = docSnap.id;

          const txSnapshot = await getDocs(collection(doc(db, 'clients', client.id), 'transactions'));
          client.transactions = txSnapshot.docs.map((tx) => {
            const txData = tx.data();
            txData.id = tx.id;
            return txData;
          });

          return client;
        })
      );

      // ✅ Ordenar por fecha de última modificación o creación
      const sortedByLastUpdate = updatedClients.sort((a, b) => {
        const aTime = new Date(a.lastUpdated || a.createdAt).getTime();
        const bTime = new Date(b.lastUpdated || b.createdAt).getTime();
        return bTime - aTime;
      });

      setClients(sortedByLastUpdate);
    });

    return () => unsubscribe();
  }, []);

  // 🔼 Subir datos manualmente (si hay cambios locales)
  const updateClients = async (newClients) => {
    setClients(newClients);
    try {
      await uploadClientsToFirebase(newClients);
      const now = new Date().toLocaleTimeString();
      setSyncMessage(`✅ Sincronizado: ${now}`);
    } catch {
      setSyncMessage('❌ Error al sincronizar con Firebase');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
      <LayoutHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {syncMessage && (
          <div className="text-sm text-center mb-4 text-green-600">{syncMessage}</div>
        )}

        {activeTab === 1 && <GeneralBalanceView clients={clients} />}
        {activeTab === 2 && <ClientsDatabase clients={clients} updateClients={updateClients} />}
        {activeTab === 3 && <TransactionsView clients={clients} />}
        {activeTab === 4 && <BinanceBotPanel />}
      </div>
    </div>
  );
};

export default App;