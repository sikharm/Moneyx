import { forwardRef } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface AccountData {
  nickname: string;
  currency: string;
  initialBalance: number;
  periodBalance: number;
  periodProfitLoss: number;
}

interface CombinedTotal {
  initialBalance: number;
  periodBalance: number;
  periodProfitLoss: number;
}

interface InfographicCanvasProps {
  accountsData: AccountData[];
  periodLabel: string;
  combinedTotal: CombinedTotal | null;
}

const InfographicCanvas = forwardRef<HTMLDivElement, InfographicCanvasProps>(
  ({ accountsData, periodLabel, combinedTotal }, ref) => {
    const formatCurrency = (amount: number, currency: string = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency === 'Cents' ? 'USD' : currency,
        minimumFractionDigits: 2,
      }).format(currency === 'Cents' ? amount / 100 : amount);
    };

    return (
      <div
        ref={ref}
        className="p-8 min-w-[400px]"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-white font-semibold">Trade Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{periodLabel}</h1>
          <p className="text-gray-400 text-sm">Trading Performance Report</p>
        </div>

        {/* Accounts */}
        <div className="space-y-4 mb-6">
          {accountsData.map((account, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur rounded-xl p-5 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">{account.nickname}</span>
                <span className="text-gray-500 text-sm">({account.currency})</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Initial Balance</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(account.initialBalance, account.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Period P/L</p>
                  <p className={`font-bold text-lg flex items-center gap-1 ${
                    account.periodProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {account.periodProfitLoss >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {account.periodProfitLoss >= 0 ? '+' : ''}
                    {formatCurrency(account.periodProfitLoss, account.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Period Balance</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(account.periodBalance, account.currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Combined Total */}
        {combinedTotal && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur rounded-xl p-5 border border-green-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-500 p-1.5 rounded-full">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-semibold">Combined Total</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-300 text-xs mb-1">Initial Balance</p>
                <p className="text-white font-bold text-xl">
                  {formatCurrency(combinedTotal.initialBalance)}
                </p>
              </div>
              <div>
                <p className="text-gray-300 text-xs mb-1">Period P/L</p>
                <p className={`font-bold text-xl ${
                  combinedTotal.periodProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {combinedTotal.periodProfitLoss >= 0 ? '+' : ''}
                  {formatCurrency(combinedTotal.periodProfitLoss)}
                </p>
              </div>
              <div>
                <p className="text-gray-300 text-xs mb-1">Period Balance</p>
                <p className="text-white font-bold text-xl">
                  {formatCurrency(combinedTotal.periodBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Generated by Trade Tracker • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }
);

InfographicCanvas.displayName = 'InfographicCanvas';

export default InfographicCanvas;
