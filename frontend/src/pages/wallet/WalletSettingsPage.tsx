import React, { useMemo } from 'react';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useWalletSettingsController } from '../../hooks/wallet/useWalletSettingsController';
import type { NavbarConfig } from '../../models/navbar/model';
import { Wallet, Edit, Save, X, RefreshCw, Trash2 } from 'lucide-react';

const WalletSettingsPage: React.FC = () => {
  const {
    walletAddress,
    balance,
    loading,
    error,
    isEditing,
    tempAddress,
    setTempAddress,
    saveWalletAddress,
    startEditing,
    cancelEditing,
    removeWalletAddress,
    refreshBalance,
    clearError,
  } = useWalletSettingsController();

  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'Wallet Settings',
      subtitle: 'Manage your blockchain wallet address for payments',
    }),
    []
  );

  useNavbarController(navbarConfig);

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert
          message={error}
          type="error"
          onClose={clearError}
        />
      )}

      {/* Wallet Address Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Wallet Address
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure your Ethereum wallet address
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {!walletAddress && !isEditing ? (
            <div className="text-center py-8">
              <Wallet className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No wallet address configured
              </p>
              <button
                onClick={startEditing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Edit size={16} />
                Add Wallet Address
              </button>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveWalletAddress}
                  disabled={!tempAddress.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Address
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Address
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white break-all">
                    {walletAddress}
                  </code>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startEditing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit Address
                </button>
                <button
                  onClick={removeWalletAddress}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Balance Card */}
      {walletAddress && !isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Wallet Balance
              </h2>
              <button
                onClick={refreshBalance}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading balance...</p>
              </div>
            ) : balance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance (ETH)</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {balance.balance}
                  </p>
                </div>
                <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance (Wei)</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono break-all">
                    {balance.balanceWei}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Unable to fetch balance
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletSettingsPage;
