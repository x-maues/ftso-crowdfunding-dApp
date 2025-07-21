// CampaignCard component (ensure this is the one being used)
// (Imports: formatEther, formatUnits, useCrowdfundingCampaign, types)

import { useCrowdfundingCampaign } from '../hooks/useCrowdfunding';
import { useAccount } from 'wagmi';
import { parseEther, formatUnits } from 'viem';
import { useState, useEffect } from 'react';
import { getFormattedFlrUsdPrice } from '../utils/ftso';
import dynamic from 'next/dynamic';

// Dynamically import Confetti to avoid SSR issues
const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

interface CampaignCardProps {
  address: `0x${string}`;
  onContribute: (amount: string) => Promise<void>;
  onFinalize: () => Promise<void>;
}

export function CampaignCard({ address, onContribute, onFinalize }: CampaignCardProps) {
  const { address: userAddress } = useAccount();
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flrUsdPrice, setFlrUsdPrice] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    amount: string;
    campaignTitle: string;
  } | null>(null);

  const {
    campaignInfo,
    isLoadingCampaignInfo,
    errorLoadingInfo,
    contribute,
    isSendingContribution,
    isConfirmingContribution,
    finalizeCampaign,
    isSendingFinalize,
    isConfirmingFinalize,
    withdrawFunds,
    isSendingWithdraw,
    isConfirmingWithdraw,
    isWithdrawSuccess,
    claimRefund,
    isSendingRefund,
    isConfirmingRefund,
    isRefundSuccess,
  } = useCrowdfundingCampaign(address);

  // Fetch FLR/USD price on component mount
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getFormattedFlrUsdPrice();
        setFlrUsdPrice(price);
      } catch (err) {
        console.error('Error fetching FLR/USD price:', err);
        setFlrUsdPrice('0');
      }
    };
    fetchPrice();
  }, []);

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoadingCampaignInfo) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (errorLoadingInfo || !campaignInfo) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading campaign information</p>
      </div>
    );
  }

  const {
    title,
    beneficiary,
    fundingGoalUsdString,
    totalFundsRaisedFlrString,
    deadlineDate,
    fundingGoalReached,
    campaignClosed,
  } = campaignInfo;

  // Calculate progress percentage and FLR conversion
  const flrPrice = parseFloat(flrUsdPrice) ;
  // Convert USD goal to FLR using the current price
  const goalInFlr = parseFloat(fundingGoalUsdString) / flrPrice;
  const raisedInFlr = parseFloat(totalFundsRaisedFlrString) || 0;
  const progressPercentage = goalInFlr > 0 ? Math.min((raisedInFlr / goalInFlr) * 100, 100) : 0;

  // Calculate time remaining
  const now = new Date();
  const timeLeft = deadlineDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
  const isExpired = daysLeft === 0;

  // Format numbers to appropriate precision
  const formatAmount = (amount: number, isUsd: boolean = false) => {
    if (isUsd) {
      return amount.toFixed(2);
    }
    // For FLR, show more precision since the amounts are larger
    return amount.toFixed(4);
  };

  const handleContribute = async () => {
    if (!contributionAmount) {
      setError('Please enter an amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onContribute(contributionAmount);
      setContributionAmount('');
      setIsModalOpen(false);
      
      // Show success message and confetti
      setSuccessDetails({
        amount: contributionAmount,
        campaignTitle: title
      });
      setShowSuccessMessage(true);
      setShowConfetti(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessDetails(null);
      }, 3000);
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contribute');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onFinalize();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize campaign');
    } finally {
      setIsLoading(false);
    }
  };

  // Add logic to check if user is beneficiary and if user can claim refund
  const isBeneficiary = userAddress && beneficiary && userAddress.toLowerCase() === beneficiary.toLowerCase();
  const canWithdraw = fundingGoalReached && !campaignClosed && isBeneficiary;
  const canClaimRefund = campaignClosed && !fundingGoalReached && campaignInfo && campaignInfo.userContribution && campaignInfo.userContribution > 0;

  // Format beneficiary address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#EC4899', '#DB2777', '#BE185D', '#F472B6', '#F9A8D4']}
        />
      )}

      {/* Success Message Overlay */}
      {showSuccessMessage && successDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 scale-100 animate-slide-down border border-pink-100">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Contribution Successful!
              </h3>
              
              <div className="space-y-2">
                <p className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {successDetails.amount} FLR
                </p>
                <p className="text-gray-600">
                  contributed to
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {successDetails.campaignTitle}
                </p>
              </div>

              <p className="text-gray-500 italic">
                Thank you for supporting this campaign! Your contribution makes a difference.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-pink-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate pr-2" title={title}>
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="text-pink-500 hover:text-pink-600 transition-colors cursor-pointer"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              campaignClosed ? 'bg-red-100 text-red-800' :
              fundingGoalReached ? 'bg-green-100 text-green-800' :
              isExpired ? 'bg-red-100 text-red-800' :
              'bg-green-100 text-green-800'
            }`}>
              {campaignClosed ? 'Closed' :
               fundingGoalReached ? 'Goal Reached' :
               isExpired ? 'Expired' :
               'Active'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Goal:</span>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">${formatAmount(parseFloat(fundingGoalUsdString), true)} USD</span>
                <span className="text-pink-400">/</span>
                <span className="font-bold text-gray-900">{formatAmount(goalInFlr)} FLR</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Raised:</span>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{formatAmount(raisedInFlr)} FLR</span>
                <span className="text-pink-400">/</span>
                <span className="font-bold text-gray-900">${formatAmount(raisedInFlr * flrPrice, true)} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-sm"></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 block mb-1">Beneficiary</span>
            <button
              onClick={() => setIsBeneficiaryModalOpen(true)}
              className="font-mono text-xs md:text-sm truncate block max-w-[200px] text-pink-600 hover:text-pink-800 hover:underline transition-colors duration-200 cursor-pointer"
              title="Click to view full address"
            >
              {formatAddress(beneficiary)}
            </button>
          </div>
          <div className="text-right">
            <span className="text-gray-600 block mb-1">Time Remaining</span>
            <span className="font-bold text-gray-900">
              {isExpired ? 'Campaign ended' : `${daysLeft} days left`}
            </span>
          </div>
        </div>

        {!campaignClosed && !isExpired && !fundingGoalReached && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium shadow-md hover:from-pink-600 hover:to-pink-700 transition-all duration-200 cursor-pointer"
          >
            Contribute Now
          </button>
        )}

        {fundingGoalReached && !campaignClosed && (
          <button
            onClick={handleFinalize}
            disabled={isLoading || isSendingFinalize || isConfirmingFinalize}
            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSendingFinalize ? 'Sending...' :
             isConfirmingFinalize ? 'Confirming...' :
             'Finalize Campaign'}
          </button>
        )}
        {canWithdraw && (
          <button
            onClick={async () => {
              setIsLoading(true);
              setError(null);
              try {
                await withdrawFunds();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to withdraw funds');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading || isSendingWithdraw || isConfirmingWithdraw}
            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSendingWithdraw ? 'Sending...' : isConfirmingWithdraw ? 'Confirming...' : 'Withdraw Funds'}
          </button>
        )}
        {canClaimRefund && (
          <button
            onClick={async () => {
              setIsLoading(true);
              setError(null);
              try {
                await claimRefund();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to claim refund');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading || isSendingRefund || isConfirmingRefund}
            className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSendingRefund ? 'Sending...' : isConfirmingRefund ? 'Confirming...' : 'Claim Refund'}
          </button>
        )}
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Campaign Details</h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Campaign Title</h4>
                <p className="text-lg font-semibold text-gray-900 break-words">{title}</p>
              </div>

              {/* Campaign Address */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Campaign Address</h4>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all">{address}</p>
                  <a
                    href={`https://coston2-explorer.flare.network/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 cursor-pointer"
                    title="View on Explorer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Beneficiary Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Beneficiary Address</h4>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all">{beneficiary}</p>
                  <a
                    href={`https://coston2-explorer.flare.network/address/${beneficiary}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 cursor-pointer"
                    title="View on Explorer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Funding Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Funding Goal</h4>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">${formatAmount(parseFloat(fundingGoalUsdString), true)} USD</p>
                    <p className="text-gray-600">{formatAmount(goalInFlr)} FLR</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Total Raised</h4>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{formatAmount(raisedInFlr)} FLR</p>
                    <p className="text-gray-600">${formatAmount(raisedInFlr * flrPrice, true)} USD</p>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Progress</h4>
                <div className="space-y-2">
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-right font-semibold text-gray-900">{progressPercentage.toFixed(1)}%</p>
                </div>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <p className="font-semibold text-gray-900">
                    {campaignClosed ? 'Campaign Closed' :
                     fundingGoalReached ? 'Goal Reached' :
                     isExpired ? 'Expired' :
                     'Active'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Time Remaining</h4>
                  <p className="font-semibold text-gray-900">
                    {isExpired ? 'Campaign ended' : `${daysLeft} days left`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  Close
                </button>
                {!campaignClosed && !isExpired && !fundingGoalReached && (
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 cursor-pointer"
                  >
                    Contribute Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Contribute to Campaign</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (FLR)
                </label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Enter amount in FLR"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  min="0"
                  step="0.01"
                />
                {flrPrice > 0 && contributionAmount && (
                  <p className="mt-1 text-sm text-gray-500">
                    ≈ ${(parseFloat(contributionAmount) * flrPrice).toFixed(2)} USD
                  </p>
                )}
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContribute}
                  disabled={isLoading || isSendingContribution || isConfirmingContribution}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSendingContribution ? 'Sending...' :
                   isConfirmingContribution ? 'Confirming...' :
                   'Contribute'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Modal */}
      {isBeneficiaryModalOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setIsBeneficiaryModalOpen(false)}
        >
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Beneficiary Address</h3>
              <button
                onClick={() => setIsBeneficiaryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-mono text-sm break-all">{beneficiary}</p>
              </div>

              <a
                href={`https://coston2-explorer.flare.network/address/${beneficiary}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-center rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 cursor-pointer"
              >
                View on Explorer
              </a>

              <button
                onClick={() => setIsBeneficiaryModalOpen(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = `
@keyframes slide-down {
  0% {
    opacity: 0;
    transform: translateY(-100%) scale(0.95);
  }
  60% {
    opacity: 1;
    transform: translateY(10%) scale(1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-slide-down {
  animation: slide-down 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}