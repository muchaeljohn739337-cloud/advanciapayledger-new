'use client';
import { useState, useEffect } from 'react';
import WalletConnect from '@/components/WalletConnect';

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export default function CryptoPurchasePage() {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<CryptoCurrency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('BTC');
  const [purchaseAmount, setPurchaseAmount] = useState<string>('100');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCryptoPrices();
  }, []);

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch('/api/crypto/prices');
      const data = await response.json();
      setCurrencies(data);
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
    }
  };

  const handleWalletConnected = (address: string, provider: string) => {
    setConnectedWallet(address);
    setWalletType(provider);
    setError(null);
  };

  const handleWalletDisconnected = () => {
    setConnectedWallet(null);
    setWalletType(null);
  };

  const initiateStripePurchase = async () => {
    if (!connectedWallet) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/crypto/purchase/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: selectedCurrency,
          amountUSD: parseFloat(purchaseAmount),
          walletAddress: connectedWallet,
          walletType
        })
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to Stripe KYC + Payment flow
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error || 'Purchase initiation failed');
      }

    } catch (error: any) {
      setError('Purchase failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateCryptoPurchase = async () => {
    if (!connectedWallet) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/crypto/purchase/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: selectedCurrency,
          amountUSD: parseFloat(purchaseAmount),
          walletAddress: connectedWallet,
          walletType
        })
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to crypto payment gateway
        window.location.href = result.paymentUrl;
      } else {
        setError(result.error || 'Crypto purchase initiation failed');
      }

    } catch (error: any) {
      setError('Purchase failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCurrencyData = currencies.find(c => c.symbol === selectedCurrency);
  const estimatedAmount = selectedCurrencyData 
    ? (parseFloat(purchaseAmount) / selectedCurrencyData.price).toFixed(8)
    : '0';

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Purchase Cryptocurrency</h1>
        <p className='text-gray-600'>Buy crypto with KYC verification through Stripe or direct payment</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Wallet Connection */}
        <div className='order-2 lg:order-1'>
          <WalletConnect 
            onConnected={handleWalletConnected}
            onDisconnected={handleWalletDisconnected}
          />
        </div>

        {/* Purchase Form */}
        <div className='order-1 lg:order-2'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg'>
            <h2 className='text-xl font-bold mb-6'>Purchase Details</h2>

            {error && (
              <div className='alert alert-error mb-4'>
                <span>{error}</span>
              </div>
            )}

            {/* Currency Selection */}
            <div className='form-control mb-4'>
              <label className='label'>
                <span className='label-text'>Cryptocurrency</span>
              </label>
              <select 
                className='select select-bordered w-full'
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                {currencies.map((currency) => (
                  <option key={currency.symbol} value={currency.symbol}>
                    {currency.symbol} - {currency.name} ({currency.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className='form-control mb-4'>
              <label className='label'>
                <span className='label-text'>Amount (USD)</span>
              </label>
              <input 
                type='number'
                className='input input-bordered w-full'
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                min='10'
                max='10000'
                step='0.01'
              />
            </div>

            {/* Estimated Amount */}
            {selectedCurrencyData && (
              <div className='alert alert-info mb-6'>
                <div>
                  <h3 className='font-bold'>Estimated Amount</h3>
                  <p>{estimatedAmount} {selectedCurrency}</p>
                  <p className='text-sm'>Price: {selectedCurrencyData.price.toFixed(2)} USD</p>
                </div>
              </div>
            )}

            {/* Purchase Buttons */}
            <div className='space-y-4'>
              <button
                onClick={initiateStripePurchase}
                disabled={!connectedWallet || isLoading}
                className='btn btn-primary w-full'
              >
                {isLoading ? (
                  <>
                    <span className='loading loading-spinner loading-sm'></span>
                    Processing...
                  </>
                ) : (
                  <>
                    🔒 Buy with Stripe KYC ({purchaseAmount} USD)
                  </>
                )}
              </button>

              <button
                onClick={initiateCryptoPurchase}
                disabled={!connectedWallet || isLoading}
                className='btn btn-secondary w-full'
              >
                {isLoading ? (
                  <>
                    <span className='loading loading-spinner loading-sm'></span>
                    Processing...
                  </>
                ) : (
                  <>
                    ⚡ Buy with Crypto ({purchaseAmount} USD)
                  </>
                )}
              </button>
            </div>

            {!connectedWallet && (
              <div className='alert alert-warning mt-4'>
                <span>👈 Connect your wallet to enable purchases</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='text-center p-6'>
          <div className='text-4xl mb-2'>🔒</div>
          <h3 className='font-bold mb-2'>Secure KYC</h3>
          <p className='text-sm text-gray-600'>Stripe-powered identity verification</p>
        </div>
        
        <div className='text-center p-6'>
          <div className='text-4xl mb-2'>⚡</div>
          <h3 className='font-bold mb-2'>Instant Credit</h3>
          <p className='text-sm text-gray-600'>Crypto credited directly to your wallet</p>
        </div>
        
        <div className='text-center p-6'>
          <div className='text-4xl mb-2'>🌍</div>
          <h3 className='font-bold mb-2'>Global Access</h3>
          <p className='text-sm text-gray-600'>Available worldwide with multiple payment methods</p>
        </div>
      </div>
    </div>
  );
}
