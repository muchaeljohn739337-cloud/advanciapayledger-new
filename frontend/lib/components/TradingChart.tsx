'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function TradingChart() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'BTC/USD', price: 43250.50, change: 1250.30, changePercent: 2.98 },
    { symbol: 'ETH/USD', price: 2280.75, change: -45.20, changePercent: -1.94 },
    { symbol: 'AAPL', price: 178.25, change: 3.50, changePercent: 2.00 },
    { symbol: 'TSLA', price: 242.84, change: -5.16, changePercent: -2.08 }
  ]);

  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const [timeframe, setTimeframe] = useState('1D');

  const generateChartData = () => {
    const labels = [];
    const data = [];
    const basePrice = 42000;
    
    for (let i = 0; i < 30; i++) {
      labels.push(`${i}h`);
      const randomChange = (Math.random() - 0.5) * 2000;
      data.push(basePrice + randomChange + (i * 50));
    }

    return {
      labels,
      datasets: [
        {
          label: selectedAsset,
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 2,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxTicksLimit: 8,
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * 10,
        change: item.change + (Math.random() - 0.5) * 2,
        changePercent: item.changePercent + (Math.random() - 0.5) * 0.5
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Live Market</h2>
            <p className="text-gray-400 text-sm">Real-time trading analytics</p>
          </div>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {marketData.map((asset) => (
          <motion.button
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset.symbol)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl transition-all ${
              selectedAsset === asset.symbol
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-400'
                : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-left">
              <p className="text-gray-400 text-xs mb-1">{asset.symbol}</p>
              <p className="text-white font-bold text-lg mb-1">
                ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center gap-1 text-sm ${
                asset.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {asset.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-800/30 rounded-xl p-4 mb-4" style={{ height: '400px' }}>
        <Line data={generateChartData()} options={chartOptions} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">24h High</p>
          <p className="text-white font-bold text-lg">$43,850.25</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">24h Low</p>
          <p className="text-white font-bold text-lg">$41,200.50</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">24h Volume</p>
          <p className="text-white font-bold text-lg">$2.4B</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Market Cap</p>
          <p className="text-white font-bold text-lg">$845.2B</p>
        </div>
      </div>
    </div>
  );
}
