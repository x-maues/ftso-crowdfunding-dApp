// lib/constants.ts
import CrowdfundingFactoryAbi from '../abis/CrowdfundingFactory.json';
import CrowdfundingCampaignAbi from '../abis/CrowdfundingCampaign.json';
import { flare } from 'wagmi/chains'; 

export const FACTORY_ADDRESS = '0xc1EAF17ebCD0ef0287E67f992a892A4e727e96c3' as const; // Your deployed factory address

export const CROWDFUNDING_FACTORY_ABI = CrowdfundingFactoryAbi as any; 
export const CROWDFUNDING_CAMPAIGN_ABI = CrowdfundingCampaignAbi as any;

// Target network for contract interactions (ensure this matches your RainbowKit/Wagmi setup)
// For Coston2, you might need to define it if not pre-configured in wagmi/chains
// Example for Coston2:
export const coston2 = {
  id: 114,
  name: 'Coston2',
  nativeCurrency: { name: 'Coston2 Flare', symbol: 'CFLR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
  testnet: true,
} as const;

export const TARGET_CHAIN = coston2; // Or flare if mainnet