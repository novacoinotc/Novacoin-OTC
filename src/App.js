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

          // ✅ Convertir lastUpdated y createdAt en objetos Date
          if (client.lastUpdated) {
            client.lastUpdated = new Date(client.lastUpdated);
          }
          if (client.createdAt) {
            client.createdAt = new Date(client.createdAt);
          }

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
  const updateClients
