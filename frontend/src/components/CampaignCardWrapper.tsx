import { useCrowdfundingCampaign } from '../hooks/useCrowdfunding';
import { CampaignCard } from './CampaignCard';

interface CampaignCardWrapperProps {
  address: `0x${string}`;
  onRefresh: () => void;
}

export function CampaignCardWrapper({ address, onRefresh }: CampaignCardWrapperProps) {
  const campaign = useCrowdfundingCampaign(address);

  return (
    <CampaignCard
      address={address}
      onContribute={async (amount) => {
        await campaign.contribute(amount);
        onRefresh();
      }}
      onFinalize={async () => {
        await campaign.finalizeCampaign();
        onRefresh();
      }}
    />
  );
} 