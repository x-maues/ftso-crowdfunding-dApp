# Flare Crowdfunding dApp

A decentralized crowdfunding platform built on Flare Network that allows users to create and contribute to campaigns using FLR tokens. The platform uses FTSO (Flare Time Series Oracle) to track campaign goals in USD while accepting contributions in FLR.

## Features

- Create crowdfunding campaigns with USD-denominated goals
- Real-time FLR/USD price tracking via FTSO
- Automatic goal tracking and campaign finalization
- Support for multiple campaigns with different durations
- Factory pattern for easy campaign creation and management

## Getting Started

1. Clone and install dependencies:

   ```console
   git clone <repository-url>
   cd <repository-name>
   yarn install
   ```

2. Set up environment variables:

   ```console
   cp .env.example .env
   ```

   Add the following values in `.env`:
   - `PRIVATE_KEY_1`: Your wallet's private key...
   (5 accounts needed)
   - `FACTORY_ADDRESS`: The deployed factory contract address (after deployment)

3. Compile the contracts:

   ```console
   yarn hardhat compile
   ```

## Testing

Run the test suite:

```console
yarn hardhat test
```

The tests cover:
- Campaign creation and management
- Contributions and goal tracking
- Campaign finalization
- Edge cases and security checks

## Deployment (you're going to need 5 signer or 5 accounts' private key to run the tests in the deployment script)

1. Deploy to Coston2 testnet:

   ```console
   
   npx hardhat run scripts/deploy.ts --network coston2
   ```

2. Deploy to Flare mainnet:

   ```console
   yarn hardhat run scripts/deploy.ts --network flare
   ```

The deployment script will:
- Deploy the factory contract
- Create test campaigns
- Demonstrate campaign interactions
- Show FTSO price integration

## Contract Structure 

contracts/fund/ -

- `CrowdfundingFactory.sol`: Factory contract for creating and managing campaigns
- `CrowdfundingCampaign.sol`: Individual campaign contract with FTSO integration

## Development

The project uses:
- Hardhat for development and testing
- TypeScript for type safety
- FTSO for price feeds
- Flare Network for deployment

## Resources

- [Flare Developer Hub](https://dev.flare.network/)
- [FTSO Documentation](https://docs.flare.network/tech/ftso/)
- [Hardhat Documentation](https://hardhat.org/docs)
