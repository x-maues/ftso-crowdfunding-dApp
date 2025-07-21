import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { flare } from 'wagmi/chains';
import { Chain } from 'viem';

const coston2: Chain = {
  id: 114,
  name: 'Coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'SafeRaise',
  projectId: 'YOUR_PROJECT_ID',
  chains: [coston2, flare],
  ssr: true
});
