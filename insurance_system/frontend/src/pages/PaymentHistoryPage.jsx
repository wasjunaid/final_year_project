import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw, Wallet } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import TablePagination from '../components/ui/TablePagination';
import { paymentService } from '../services/paymentService';

const PaymentHistoryPage = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('insuranceWalletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
      fetchHistory(storedWalletAddress);
    }
  }, []);

  const fetchHistory = async (address) => {
    if (!address) {
      setError('No wallet address configured. Please set your wallet address first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await paymentService.getInsurancePaymentHistory(address);
      setHistory(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment history');
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
    fetchHistory(address);
  };

  const handleRefresh = () => {
    if (walletAddress) fetchHistory(walletAddress);
  };

  const formatAddress = (address) => `${address.slice(0, 10)}...${address.slice(-8)}`;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return { date: date.toLocaleDateString(), time: date.toLocaleTimeString() };
  };

  const renderTypeBadge = (type) => {
    const isInsurance = type === 'INSURANCE';
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isInsurance ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
        {isInsurance ? 'Insurance Payment' : type}
      </span>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [history?.transactions?.length]);

  const allTransactions = history?.transactions || [];
  const totalPages = Math.ceil(allTransactions.length / PAGE_SIZE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return allTransactions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allTransactions, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-68 px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment History</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track blockchain insurance payment transactions.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {!walletAddress ? (
          <section className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-8 text-center space-y-3">
            <div className="flex justify-center text-gray-400"><Wallet size={42} /></div>
            <p className="text-gray-600 dark:text-gray-400">No wallet address configured</p>
            <Button variant="primary" onClick={openSetWallet}>Set Wallet Address</Button>
          </section>
        ) : (
          <>
            {history && (
              <section className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transaction History</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Wallet: <span className="font-mono text-xs">{formatAddress(walletAddress)}</span></p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)' }}>
                    <p className="text-sm text-white/90">Total Paid (ETH)</p>
                    <p className="text-2xl font-bold text-white">{history.totalPaid}</p>
                  </div>
                  <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }}>
                    <p className="text-sm text-white/90">Total Transactions</p>
                    <p className="text-2xl font-bold text-white">{history.transactionCount}</p>
                  </div>
                </div>
              </section>
            )}

            <section className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-0 overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
              ) : history && history.transactions.length > 0 ? (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-[#252525]">
                      <tr>
                        {['From', 'To', 'Amount (ETH)', 'Type', 'Claim ID', 'Date'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((tx, index) => {
                        const { date, time } = formatDate(tx.date);
                        return (
                          <tr key={index} className="border-t border-gray-100 dark:border-dark-bg-tertiary">
                            <td className="px-3 py-2 font-mono text-xs">{formatAddress(tx.from)}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2 font-mono text-xs">
                                {formatAddress(tx.to)} <ArrowRight size={14} />
                              </div>
                            </td>
                            <td className="px-3 py-2 font-semibold">{tx.amount}</td>
                            <td className="px-3 py-2">{renderTypeBadge(tx.transactionType)}</td>
                            <td className="px-3 py-2"><span className="inline-flex rounded-full border border-gray-300 dark:border-[#555] px-2 py-0.5 text-xs">#{tx.claimId}</span></td>
                            <td className="px-3 py-2"><div>{date}</div><div className="text-xs text-gray-500 dark:text-gray-400">{time}</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No transactions found</p>
              )}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={allTransactions.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                label="transactions"
              />
            </section>
          </>
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

export default PaymentHistoryPage;

