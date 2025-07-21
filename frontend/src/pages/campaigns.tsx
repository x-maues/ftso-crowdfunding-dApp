'use client';

import { useCrowdfundingFactory } from '../hooks/useCrowdfunding';
import { CampaignCard } from '../components/CampaignCard';
import { useState, useEffect, useRef } from 'react';
import { useCrowdfundingCampaign } from '../hooks/useCrowdfunding';
import { Navbar } from '../components/Navbar';
import { getFormattedFlrUsdPrice } from '../utils/ftso';

// Separate component to handle campaign card with hooks
function CampaignCardWrapper({ address, onRefresh }: { address: `0x${string}`, onRefresh: () => void }) {
  const { contribute } = useCrowdfundingCampaign(address);
  
  return (
    <div>
      <CampaignCard
        address={address}
        onContribute={async (amount) => {
          try {
            await contribute(amount);
            await onRefresh();
          } catch (error: any) {
            // Handle user rejection or other errors gracefully
            if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
              console.log('Transaction was rejected by user');
              return;
            }
            // For other errors, you might want to show a notification
            console.error('Error contributing to campaign:', error);
          }
        }}
        onFinalize={async () => {
          try {
            await onRefresh();
          } catch (error) {
            console.error('Error finalizing campaign:', error);
          }
        }}
      />
    </div>
  );
}

export default function CampaignsPage() {
  const { campaignAddresses, isLoadingCampaigns, errorLoadingCampaigns, refetchCampaignAddresses } = useCrowdfundingFactory();
  const [sortedCampaigns, setSortedCampaigns] = useState<{ active: `0x${string}`[], completed: `0x${string}`[] }>({
    active: [],
    completed: []
  });
  const [flrUsdPrice, setFlrUsdPrice] = useState<string>('0');
  const processedAddresses = useRef<Set<string>>(new Set());

  // Fetch FLR/USD price on component mount and every 30 seconds
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
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Create a separate component for campaign status check
  function CampaignStatusChecker({ address, onStatus }: { address: `0x${string}`, onStatus: (isCompleted: boolean) => void }) {
    const { campaignInfo } = useCrowdfundingCampaign(address);
    
    useEffect(() => {
      if (campaignInfo) {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const isCompleted = campaignInfo.campaignClosed || 
                          campaignInfo.fundingGoalReached || 
                          currentTime > campaignInfo.deadline;
        
        if (!processedAddresses.current.has(address)) {
          processedAddresses.current.add(address);
          onStatus(isCompleted);
        }
      }
    }, [campaignInfo, address, onStatus]);

    return null;
  }

  // Sort campaigns by address to maintain consistent order
  const sortCampaigns = (campaigns: `0x${string}`[]) => {
    return [...campaigns].sort((a, b) => a.localeCompare(b));
  };

  useEffect(() => {
    if (!campaignAddresses) return;

    // Reset processed addresses when campaign addresses change
    processedAddresses.current.clear();
    
    // Initially put all campaigns in active list
    setSortedCampaigns({
      active: [...campaignAddresses],
      completed: []
    });
  }, [campaignAddresses]);

  if (isLoadingCampaigns) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 pt-24 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-pink-100 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <div className="h-4 bg-pink-100 rounded w-3/4"></div>
                    <div className="h-4 bg-pink-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (errorLoadingCampaigns) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 pt-24 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error loading campaigns: {errorLoadingCampaigns.message}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 pt-24 mt-20 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Crowdfunding Campaigns</h1>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <span className="text-gray-600">Current FLR/USD:</span>
              <span className="font-bold text-xl text-pink-600">${flrUsdPrice}</span>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="space-y-4 mt-16">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-green-500 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-900">Active Campaigns</h2>
            </div>
            {sortedCampaigns.active.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortCampaigns(sortedCampaigns.active).map((address) => (
                  <CampaignCardWrapper
                    key={address}
                    address={address}
                    onRefresh={refetchCampaignAddresses}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-500">No active campaigns found</p>
              </div>
            )}
          </div>

          {/* Completed Campaigns */}
          <div className="space-y-4 mt-16">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-red-500 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-900">Completed Campaigns</h2>
            </div>
            {sortedCampaigns.completed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortCampaigns(sortedCampaigns.completed).map((address) => (
                  <CampaignCardWrapper
                    key={address}
                    address={address}
                    onRefresh={refetchCampaignAddresses}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-500">No completed campaigns found</p>
              </div>
            )}
          </div>

          {/* Hidden status checkers */}
          {campaignAddresses?.map(address => (
            <CampaignStatusChecker
              key={address}
              address={address}
              onStatus={(isCompleted) => {
                setSortedCampaigns(prev => {
                  const newActive = prev.active.filter(a => a !== address);
                  const newCompleted = prev.completed.filter(a => a !== address);
                  
                  if (isCompleted) {
                    newCompleted.push(address);
                  } else {
                    newActive.push(address);
                  }
                  
                  return { active: newActive, completed: newCompleted };
                });
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}