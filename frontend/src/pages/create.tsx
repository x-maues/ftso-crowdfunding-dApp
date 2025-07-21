'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrowdfundingFactory } from '../hooks/useCrowdfunding';
import { Navbar } from '../components/Navbar';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { createCampaign, isSendingCreateCampaign, isConfirmingCreateCampaign, isConnected } = useCrowdfundingFactory();
  const [formData, setFormData] = useState({
    title: '',
    beneficiary: '',
    fundingGoal: '',
    duration: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Convert fundingGoal to a number and validate
      const fundingGoalNumber = parseFloat(formData.fundingGoal);
      if (isNaN(fundingGoalNumber) || fundingGoalNumber <= 0) {
        throw new Error("Funding goal must be a positive number");
      }

      // Convert duration to a number and validate
      const durationNumber = parseInt(formData.duration);
      if (isNaN(durationNumber) || durationNumber <= 0) {
        throw new Error("Duration must be a positive number of days");
      }

      await createCampaign(
        formData.beneficiary as `0x${string}`,
        fundingGoalNumber,
        durationNumber,
        formData.title
      );
      
      router.push('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error instanceof Error ? error.message : "Failed to create campaign");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 mt-28 pt-24 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Campaign</h1>
            
            {!isConnected && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 mb-4">Please connect your wallet to create a campaign</p>
                <ConnectButton />
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <label htmlFor="beneficiary" className="block text-sm font-medium text-gray-700 mb-1">
                  Beneficiary Address
                </label>
                <input
                  type="text"
                  id="beneficiary"
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                  pattern="^0x[a-fA-F0-9]{40}$"
                  placeholder="0x..."
                  disabled={!isConnected}
                />
              </div>

              <div>
                <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-700 mb-1">
                  Funding Goal (USD)
                </label>
                <input
                  type="number"
                  id="fundingGoal"
                  value={formData.fundingGoal}
                  onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="e.g., 1000"
                  disabled={!isConnected}
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                  min="1"
                  placeholder="e.g., 30"
                  disabled={!isConnected}
                />
              </div>

              <button
                type="submit"
                disabled={!isConnected || isSendingCreateCampaign || isConfirmingCreateCampaign}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isConnected ? 'Connect Wallet to Create' :
                 isSendingCreateCampaign ? 'Creating Campaign...' : 
                 isConfirmingCreateCampaign ? 'Confirming...' : 
                 'Create Campaign'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 