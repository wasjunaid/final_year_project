import React, { useEffect, useState } from 'react';
import { RefreshCw, Wallet } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import { paymentService } from '../services/paymentService';

const WalletBalancePage = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [walletInput, setWalletInput] = useState('');

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('insuranceWalletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
      fetchBalance(storedWalletAddress);
    }
  }, []);

  const fetchBalance = async (address) => {
    if (!address) {
      setError('No wallet address configured. Please set your wallet address first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await paymentService.getWalletBalance(address);
      setBalance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const openSetWallet = () => {
    setWalletInput(walletAddress || '');
    setOpenWalletModal(true);
  };

  const handleSetWalletAddress = () => {
    const address = walletInput.trim();
    if (!address) {
      setOpenWalletModal(false);
      return;
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid Ethereum address format');
      return;
    }

    localStorage.setItem('insuranceWalletAddress', address);
    setWalletAddress(address);
    setOpenWalletModal(false);
    fetchBalance(address);
  };

  const handleRefresh = () => {
    if (walletAddress) fetchBalance(walletAddress);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-68 px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Wallet Balance</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor your insurance wallet address and balance.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <section className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Wallet size={24} /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Wallet Address</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configured Ethereum wallet used for transactions.</p>
            </div>
          </div>

          {!walletAddress ? (
            <div className="text-center py-8 space-y-3">
              <div className="flex justify-center text-gray-400"><Wallet size={42} /></div>
              <p className="text-gray-600 dark:text-gray-400">No wallet address configured</p>
              <Button variant="primary" onClick={openSetWallet}>Set Wallet Address</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-[#252525] p-3 flex items-center justify-between gap-3">
                <p className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">{walletAddress}</p>
                <Button size="sm" variant="outline" onClick={openSetWallet}>Change</Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">This address is used for blockchain-related insurance payments.</p>
            </div>
          )}
        </section>

        {walletAddress && (
          <section className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Wallet Balance</h2>
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
            ) : balance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                  <p className="text-sm text-white/90">Balance (ETH)</p>
                  <p className="text-3xl font-bold mt-2">{balance.balance}</p>
                </div>
                <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
                  <p className="text-sm text-white/90">Balance (Wei)</p>
                  <p className="text-sm font-semibold mt-2 break-all">{balance.balanceWei}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Click refresh to fetch your balance.</p>
            )}
          </section>
        )}
      </main>

      {openWalletModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Set Wallet Address</h3>
            <TextInput
              label="Ethereum Address"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="0x..."
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenWalletModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSetWalletAddress}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalancePage;

