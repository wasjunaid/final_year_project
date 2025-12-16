import React, { useMemo } from 'react';
import Table, { type TableColumn } from '../../components/Table';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { usePaymentHistoryController } from '../../hooks/payment/usePaymentHistoryController';
import type { NavbarConfig } from '../../models/navbar/model';
import type { PaymentTransactionModel } from '../../models/payment';
import { ArrowRight, RefreshCw, Wallet } from 'lucide-react';

interface PaymentHistoryPageProps {
  type: 'patient' | 'hospital';
}

const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = ({ type }) => {
  const { history, loading, error, walletAddress, fetchHistory, clearError } = 
    usePaymentHistoryController({ type });

  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'Payment History',
      subtitle: `View all ${type === 'patient' ? 'payments made' : 'payments received'} from your wallet`,
    }),
    [type]
  );

  useNavbarController(navbarConfig);

  const getTransactionTypeBadge = (transactionType: string) => {
    switch (transactionType.toUpperCase()) {
      case 'PATIENT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Patient Payment
          </span>
        );
      case 'INSURANCE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Insurance Payment
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {transactionType}
          </span>
        );
    }
  };

  const columns: TableColumn<PaymentTransactionModel>[] = [
    {
      key: 'from',
      header: 'From',
      render: (row) => (
        <span className="font-mono text-xs">
          {row.from.slice(0, 10)}...{row.from.slice(-8)}
        </span>
      ),
    },
    {
      key: 'to',
      header: 'To',
      render: (row) => (
        <span className="font-mono text-xs">
          {row.to.slice(0, 10)}...{row.to.slice(-8)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (ETH)',
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.amount}
        </span>
      ),
    },
    {
      key: 'transactionType',
      header: 'Type',
      render: (row) => getTransactionTypeBadge(row.transactionType),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => {
        const date = new Date(row.date);
        return (
          <div className="text-sm">
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
  ];

  if (!walletAddress) {
    return (
      <div className="p-6">
        <Alert
          message="Please configure your wallet address in Wallet Settings first"
          type="warning"
        />
        <div className="mt-6 text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Wallet className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Wallet Configured
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add your wallet address in Wallet Settings to view payment history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert
          message={error}
          type="error"
          onClose={clearError}
        />
      )}

      {/* Summary Cards */}
      {history && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total {type === 'patient' ? 'Paid' : 'Received'}
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {history.totalPaid} ETH
            </p>
          </div>
          
          <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total (Wei)
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono break-all">
              {history.totalPaidWei}
            </p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Transaction Count
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {history.transactionCount}
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Wallet: <code className="font-mono text-xs">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</code>
              </p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
          </div>
        ) : history && history.transactions.length > 0 ? (
          <Table
            columns={columns}
            data={history.transactions}
            loading={loading}
            elevated={false}
            itemsPerPage={15}
          />
        ) : (
          <div className="p-12 text-center">
            <ArrowRight className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              No transactions found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
