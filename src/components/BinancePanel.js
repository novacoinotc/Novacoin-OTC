import React, { useState, useEffect } from 'react';
import BotControl from './Binance/BotControl';
import MyAds from './Binance/MyAds';
import BalanceOverview from './Binance/BalanceOverview';

const BinancePanel = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Panel Binance P2P</h2>
      <BalanceOverview />
      <MyAds />
      <BotControl />
    </div>
  );
};

export default BinancePanel;
