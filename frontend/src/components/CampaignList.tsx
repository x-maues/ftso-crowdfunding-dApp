import { CampaignCardWrapper } from './CampaignCardWrapper';

interface CampaignListProps {
  addresses: `0x${string}`[];
  onRefresh: () => void;
}

export function CampaignList({ addresses, onRefresh }: CampaignListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {addresses.map((address) => (
        <CampaignCardWrapper
          key={address}
          address={address}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
} 