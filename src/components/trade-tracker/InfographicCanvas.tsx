import { forwardRef } from 'react';
import { TrendingUp, TrendingDown, Wallet, Trophy } from 'lucide-react';

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
        className="p-10 min-w-[450px]"
        style={{
          background: 'linear-gradient(145deg, #0f0f23 0%, #1a1a3e 35%, #0d1b2a 70%, #0a0a1a 100%)',
          fontFamily: 'Phetsarath, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-30%',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-20%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <div className="text-center mb-10 relative">
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
            }}
          >
            <TrendingUp className="h-6 w-6" style={{ color: '#F59E0B' }} />
            <span className="text-xl font-bold" style={{ color: '#F59E0B' }}>
              ຕິດຕາມການຊື້ຂາຍ
            </span>
          </div>
          <h1 
            className="text-3xl font-bold mb-3"
            style={{ 
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {periodLabel}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', letterSpacing: '2px' }}>
            ລາຍງານຜົນການຊື້ຂາຍ
          </p>
        </div>

        {/* Accounts */}
        <div className="space-y-5 mb-8 relative">
          {accountsData.map((account, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)',
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <Wallet className="h-5 w-5" style={{ color: '#60A5FA' }} />
                </div>
                <span className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                  {account.nickname}
                </span>
                <span 
                  className="text-sm px-3 py-1 rounded-full"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {account.currency}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ຍອດເງິນເລີ່ມຕົ້ນ
                  </p>
                  <p className="font-bold text-xl" style={{ color: '#ffffff' }}>
                    {formatCurrency(account.initialBalance, account.currency)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ກຳໄລ/ຂາດທຶນ
                  </p>
                  <p 
                    className="font-bold text-xl flex items-center gap-2"
                    style={{ color: account.periodProfitLoss >= 0 ? '#22C55E' : '#EF4444' }}
                  >
                    {account.periodProfitLoss >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {account.periodProfitLoss >= 0 ? '+' : ''}
                    {formatCurrency(account.periodProfitLoss, account.currency)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ຍອດເງິນສຸດທ້າຍ
                  </p>
                  <p className="font-bold text-xl" style={{ color: '#ffffff' }}>
                    {formatCurrency(account.periodBalance, account.currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Combined Total */}
        {combinedTotal && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.08) 50%, rgba(245, 158, 11, 0.12) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              boxShadow: '0 12px 40px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  padding: '12px',
                  borderRadius: '14px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                }}
              >
                <Trophy className="h-6 w-6" style={{ color: '#ffffff' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: '#F59E0B' }}>
                ລວມທັງໝົດ
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ຍອດເງິນເລີ່ມຕົ້ນ
                </p>
                <p className="font-bold text-2xl" style={{ color: '#ffffff' }}>
                  {formatCurrency(combinedTotal.initialBalance)}
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ກຳໄລ/ຂາດທຶນ
                </p>
                <p 
                  className="font-bold text-2xl flex items-center gap-2"
                  style={{ color: combinedTotal.periodProfitLoss >= 0 ? '#22C55E' : '#EF4444' }}
                >
                  {combinedTotal.periodProfitLoss >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {combinedTotal.periodProfitLoss >= 0 ? '+' : ''}
                  {formatCurrency(combinedTotal.periodProfitLoss)}
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ຍອດເງິນສຸດທ້າຍ
                </p>
                <p className="font-bold text-2xl" style={{ color: '#ffffff' }}>
                  {formatCurrency(combinedTotal.periodBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center relative">
          <div 
            style={{ 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              marginBottom: '16px',
            }} 
          />
          <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>
            ສ້າງໂດຍ Trade Tracker • {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
    );
  }
);

InfographicCanvas.displayName = 'InfographicCanvas';

export default InfographicCanvas;
