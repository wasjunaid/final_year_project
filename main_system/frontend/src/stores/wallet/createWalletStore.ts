import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WalletState {
  // State
  walletAddress: string | null;
  
  // Actions
  setWalletAddress: (address: string) => void;
  clearWalletAddress: () => void;
}

// Factory to create wallet store - enables testing with different storage implementations
export const createWalletStore = () => {
  return create<WalletState>()(
    persist(
      (set) => ({
        // Initial state
        walletAddress: null,

        // Set wallet address
        setWalletAddress: (address) => {
          set({ walletAddress: address });
        },

        // Clear wallet address
        clearWalletAddress: () => {
          set({ walletAddress: null });
        },
      }),
      {
        name: 'wallet-storage',
        storage: createJSONStorage(() => localStorage),
        // Persist wallet address
        partialize: (state) => ({
          walletAddress: state.walletAddress,
        }),
      }
    )
  );
};
