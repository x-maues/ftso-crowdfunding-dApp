import { ethers, network } from "hardhat";
import { ContractTransactionReceipt, Contract, Interface } from "ethers";

// --- Helper: Log Campaign Information ---
// Accesses elements of the 'info' array (Ethers.js Result object) by index.
// Indices correspond to the return order of CrowdfundingCampaign.getCampaignInfo()
// getCampaignInfo returns: owner, beneficiary, fundingGoalInUsd, deadline, totalFundsRaised, fundingGoalReached, campaignClosed, title
function logCampaignInfo(
    label: string,
    info: any, // Ethers Result object (array-like with named properties)
    ftsoPriceRaw?: bigint,
    ftsoDecimals?: number
) {
    console.log(`\n--- ${label} ---`);
    console.log(`Title:                    ${info[7]}`); // _title
    console.log(`Owner:                    ${info[0]}`); // _owner
    console.log(`Beneficiary:              ${info[1]}`); // _beneficiary

    // info[2] is _fundingGoalInUsd from contract (Target_USD_Input * 1e18)
    // e.g., for a $10 goal, it's 10 * 10^18. formatUnits will show "10.0"
    console.log(`Funding Goal (USD Target):  ${ethers.formatUnits(info[2], 18)} USD`);

    console.log(`Deadline:                 ${new Date(Number(info[3]) * 1000).toLocaleString()}`); // _deadline
    console.log(`Total Funds Raised (FLR): ${ethers.formatEther(info[4])} FLR`); // _totalFundsRaised

    if (ftsoPriceRaw !== undefined && ftsoDecimals !== undefined && ftsoPriceRaw > 0n) {
        try {
            // raisedValueInUsd = (totalFundsRaised_Wei * FTSO_Price_Raw) / 10^FTSO_Decimals_Raw
            // This result is USD_Value * 10^18
            const raisedUsdEquivalentScaled = (BigInt(info[4]) * ftsoPriceRaw) / (10n ** BigInt(Math.abs(ftsoDecimals)));
            console.log(`Raised (USD Equivalent):    ${ethers.formatUnits(raisedUsdEquivalentScaled, 18)} USD (approx @ current FTSO)`);
        } catch (e) {
            console.log("Raised (USD Equivalent):    Error calculating USD equivalent.");
        }
    }

    console.log(`Funding Goal Reached:     ${info[5]}`); // _fundingGoalReached
    console.log(`Campaign Closed:          ${info[6]}`); // _campaignClosed
}

// --- Helper: Parse CampaignCreated Event ---
async function getCampaignAddressFromReceipt(receipt: ContractTransactionReceipt | null, factoryInterface: Interface): Promise<string> {
    if (!receipt || !receipt.logs) { // Check receipt itself too
        throw new Error("Transaction receipt or logs not found.");
    }
    const eventFragment = factoryInterface.getEvent("CampaignCreated");
    if (!eventFragment) {
        throw new Error("CampaignCreated event fragment not found in factory ABI.");
    }
    const campaignCreatedLog = receipt.logs.find(log =>
        log.topics[0] === eventFragment.topicHash
    );

    if (!campaignCreatedLog) {
        throw new Error("CampaignCreated event not found in transaction logs.");
    }
    const parsedLog = factoryInterface.parseLog(campaignCreatedLog as unknown as { topics: ReadonlyArray<string>, data: string });

    if (!parsedLog || parsedLog.name !== "CampaignCreated" || !parsedLog.args.campaign) {
        throw new Error("Could not parse CampaignCreated event or campaign address missing.");
    }
    return parsedLog.args.campaign;
}

async function main() {
    const allSigners = await ethers.getSigners();
    if (allSigners.length < 5) {
        console.error(`Error: Expected at least 5 signers for roles, but got ${allSigners.length}.`);
        console.error("Please check your hardhat.config.js for the network and ensure enough accounts are configured with private keys and have funds.");
        process.exit(1);
    }
    const [deployer, beneficiary, contributor1, contributor2, attacker] = allSigners;

    console.log("Deployer:                 ", deployer.address);
    console.log("Beneficiary:              ", beneficiary.address);
    console.log("Contributor 1:            ", contributor1.address);
    console.log("Contributor 2:            ", contributor2.address);
    console.log("Attacker:                 ", attacker.address);

    // --- 1. DEPLOY FACTORY ---
    console.log("\n--- DEPLOYING FACTORY ---");
    const CrowdfundingFactoryArtifact = await ethers.getContractFactory("CrowdfundingFactory");
    const factory = await CrowdfundingFactoryArtifact.connect(deployer).deploy() as Contract;
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("CrowdfundingFactory deployed to:", factoryAddress);
    const factoryInterface = CrowdfundingFactoryArtifact.interface;

    let campaignA_Address: string;
    let campaignA: Contract;
    let campaignB_Address: string;
    let campaignB: Contract;

    // --- UTILITY: Fetch current FLR/USD FTSO Price ---
    let ftsoPriceRaw: bigint = 188000n;      // Default: e.g., 0.0188 USD (raw value for FTSO)
    let ftsoDecimals: number = 7;            // Default: FTSO decimals for this price
    let ftsoPriceString: string = "0.0188";  // Default: Human-readable price

    try {
        console.log("\nAttempting to fetch live FLR/USD price from a temporary campaign...");
        const tempCampaignTx = await factory.connect(deployer).createCampaign(
            beneficiary.address, 1, 1, "Temp FTSO Price Check Campaign"
        );
        const tempReceipt = await tempCampaignTx.wait();
        if (!tempReceipt) throw new Error("Failed to get receipt for temp campaign creation for FTSO check.");
        const tempCampaignAddress = await getCampaignAddressFromReceipt(tempReceipt, factoryInterface);
        const tempCampaign = await ethers.getContractAt("CrowdfundingCampaign", tempCampaignAddress, deployer) as Contract;

        const priceData = await tempCampaign.getFlrUsdPrice.staticCall(); // Ethers Result: [price, decimals, timestamp]
        ftsoPriceRaw = BigInt(priceData[0]);
        ftsoDecimals = Number(priceData[1]);
        if (ftsoPriceRaw <= 0n) throw new Error("FTSO price raw value is zero or negative.");
        ftsoPriceString = ethers.formatUnits(ftsoPriceRaw, Math.abs(ftsoDecimals));
        console.log(`Successfully fetched FLR/USD Price: ${ftsoPriceString} (Raw: ${ftsoPriceRaw}, FTSO Decimals: ${ftsoDecimals})`);
    } catch (e: any) {
        console.warn(`\nWARNING: Could not fetch live FLR/USD price. Using defaults. Error: ${e.message}`);
        ftsoPriceString = "0.0188"; // Default if fetch fails
        ftsoDecimals = 7;          // Ensure this matches the raw default
        ftsoPriceRaw = ethers.parseUnits(ftsoPriceString, ftsoDecimals); // Calculate raw from default string and decimals
        console.log(`Using default FLR/USD Price: ${ftsoPriceString} (Raw: ${ftsoPriceRaw}, FTSO Decimals: ${ftsoDecimals})`);
    }

    // --- 2. SCENARIO 1: CAMPAIGN SUCCEEDS ---
    console.log("\n\n--- SCENARIO 1: CAMPAIGN SUCCEEDS ---");
    const goalA_USD_Target = 1; // Target: $1 USD

    console.log(`Creating Campaign A (Goal Target: $${goalA_USD_Target} USD, Duration: 1 day)...`);
    const txCreateA = await factory.connect(deployer).createCampaign(
        beneficiary.address, goalA_USD_Target, 1, "Successful Tech Startup"
    );
    const receiptA = await txCreateA.wait();
    if (!receiptA) throw new Error("Failed to get receipt for Campaign A creation.");
    campaignA_Address = await getCampaignAddressFromReceipt(receiptA, factoryInterface);
    campaignA = await ethers.getContractAt("CrowdfundingCampaign", campaignA_Address, deployer) as Contract;
    console.log("Campaign A created at:", campaignA_Address);
    logCampaignInfo("Campaign A - Initial State", await campaignA.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);

    // Calculate FLR needed to meet USD goal
    // Formula: FLR_Needed = USD_Goal / FLR_USD_Price
    // We need to handle decimals properly:
    // 1. Convert USD goal to wei (18 decimals)
    // 2. Convert FTSO price to proper decimals
    // 3. Calculate FLR amount with proper decimal handling
    const usdGoalInWei = BigInt(goalA_USD_Target) * BigInt(10**18); // Convert USD goal to wei
    const ftsoPriceInWei = ftsoPriceRaw * BigInt(10**11); // Convert FTSO price to wei (18 decimals)
    const requiredFlrWei = (usdGoalInWei * BigInt(10**18)) / ftsoPriceInWei;
    
    // Add 5% buffer for price fluctuations
    const requiredFlrWeiWithBuffer = (requiredFlrWei * BigInt(105)) / BigInt(100);
    const requiredFlrString = ethers.formatEther(requiredFlrWeiWithBuffer);
    
    console.log(`\nTo meet $${goalA_USD_Target} USD goal at $${ftsoPriceString}/FLR:`);
    console.log(`- Base FLR needed: ${ethers.formatEther(requiredFlrWei)} FLR`);
    console.log(`- With 5% buffer: ${requiredFlrString} FLR`);
    console.log(`Contributor 1 (${contributor1.address}) attempting to contribute ${requiredFlrString} FLR...`);

    try {
        const txContribA1 = await factory.connect(contributor1).contributeToCampaign(campaignA_Address, { value: requiredFlrWeiWithBuffer });
        const receiptContribA1 = await txContribA1.wait();
        if (!receiptContribA1) throw new Error("Failed to get receipt for Contributor 1's contribution to Campaign A.");
        console.log("Contribution 1 to Campaign A successful.");
    } catch(e: any) {
        console.error(`ERROR: Contribution 1 to Campaign A FAILED: ${e.message}`);
        console.error("This is likely due to 'insufficient funds' for Contributor 1. Ensure the account has enough FLR.");
    }
    logCampaignInfo("Campaign A - After Contribution 1", await campaignA.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);

    let campaignAInfo = await campaignA.getCampaignInfo(); // Ethers Result object
    if (!campaignAInfo[5]) { // fundingGoalReached is at index 5
        console.warn("WARN: Funding goal for Campaign A might not be marked as reached after contribution.");
        console.log("This could be due to FTSO price shifts or minor rounding. Forcing a checkGoalReached call...");
        try {
            const checkGoalTx = await campaignA.connect(deployer).checkGoalReached(); // Or any account since it's public
            await checkGoalTx.wait();
            console.log("Manual checkGoalReached call completed.");
            logCampaignInfo("Campaign A - After manual checkGoalReached", await campaignA.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);
        } catch(e: any) { console.error("Error calling checkGoalReached manually:", e.message)}
    }

    console.log("\nFinalizing Campaign A (as Owner)...");
    try {
        const beneficiaryBalanceBefore = await ethers.provider.getBalance(beneficiary.address);
        const finalizeTxA = await campaignA.connect(deployer).finalizeCampaign(); // Called by deployer (owner)
        const receiptFinalizeA = await finalizeTxA.wait();
        if (!receiptFinalizeA) throw new Error("Failed to get receipt for Campaign A finalization.");
        const beneficiaryBalanceAfter = await ethers.provider.getBalance(beneficiary.address);
        console.log("Campaign A finalized successfully.");
        logCampaignInfo("Campaign A - Final State", await campaignA.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);
        console.log(`Beneficiary FLR balance increased by: ${ethers.formatEther(beneficiaryBalanceAfter - beneficiaryBalanceBefore)} FLR`);
    } catch (e: any) {
        console.error(`Error finalizing Campaign A: ${e.message}`);
    }

    // --- 3. SCENARIO 2: CAMPAIGN FAILS ---
    console.log("\n\n--- SCENARIO 2: CAMPAIGN FAILS (DEADLINE PASSES) ---");
    const goalB_USD_Target = 2; // $1000 USD goal
    const durationB_Days = 1;

    console.log(`Creating Campaign B (Goal Target: $${goalB_USD_Target} USD, Duration: ${durationB_Days} days)...`);
    const txCreateB = await factory.connect(deployer).createCampaign(
        beneficiary.address, goalB_USD_Target, durationB_Days, "Ambitious Art Project"
    );
    const receiptB = await txCreateB.wait();
    if (!receiptB) throw new Error("Failed to get receipt for Campaign B creation.");
    campaignB_Address = await getCampaignAddressFromReceipt(receiptB, factoryInterface);
    campaignB = await ethers.getContractAt("CrowdfundingCampaign", campaignB_Address, deployer) as Contract;
    console.log("Campaign B created at:", campaignB_Address);
    logCampaignInfo("Campaign B - Initial State", await campaignB.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);

    // Calculate a reasonable contribution amount for Campaign B (10% of goal)
    const usdGoalBInWei = BigInt(goalB_USD_Target) * BigInt(10**18);
    const contributionBInWei = (usdGoalBInWei * BigInt(10)) / BigInt(100); // 10% of goal
    const contributionB_FLR = (contributionBInWei * BigInt(10**18)) / ftsoPriceInWei;
    
    console.log(`\nContributor 2 (${contributor2.address}) contributing ${ethers.formatEther(contributionB_FLR)} FLR (10% of goal) to Campaign B...`);
    try {
        const txContribB1 = await factory.connect(contributor2).contributeToCampaign(campaignB_Address, { value: contributionB_FLR });
        const receiptContribB1 = await txContribB1.wait();
        if(!receiptContribB1) throw new Error("Failed to get receipt for Contributor 2's contribution to Campaign B.");
        console.log("Contribution to Campaign B successful.");
    } catch (e: any) {
        console.error(`ERROR: Contribution to Campaign B FAILED: ${e.message}`);
    }
    logCampaignInfo("Campaign B - After Contribution", await campaignB.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);

    if (network.name === "hardhat" || network.name === "localhost") {
        console.log("\nSimulating time passing beyond Campaign B deadline (Hardhat/localhost network)...");
        const campaignBInfoResult = await campaignB.getCampaignInfo();
        const deadlineB_Timestamp = Number(campaignBInfoResult[3]); // _deadline is at index 3
        const currentBlock = await ethers.provider.getBlock("latest");
        if (!currentBlock) throw new Error("Could not get current block for time travel.");
        const currentTimeOnChain = currentBlock.timestamp;
        const timeToAdvance = deadlineB_Timestamp > currentTimeOnChain ? (deadlineB_Timestamp - currentTimeOnChain + 60) : 60; // 60s buffer

        await network.provider.send("evm_increaseTime", [timeToAdvance]);
        await network.provider.send("evm_mine"); // Mine a new block to apply the time change
        console.log(`Advanced EVM time by ${timeToAdvance} seconds. Current block timestamp should be past deadline.`);
        logCampaignInfo("Campaign B - After Time Travel (Before Finalization)", await campaignB.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);
    } else {
        console.log(`\nSkipping EVM time travel as network is '${network.name}'. Ensure campaign duration is appropriately short for testing or wait manually.`);
        console.log("For Campaign B finalization to proceed as 'deadline passed', the actual deadline must have elapsed on the live network.");
    }

    console.log("\nFinalizing Campaign B (as Owner)...");
    try {
        const finalizeTxB = await campaignB.connect(deployer).finalizeCampaign();
        const receiptFinalizeB = await finalizeTxB.wait();
        if (!receiptFinalizeB) throw new Error("Failed to get receipt for Campaign B finalization.");
        console.log("Campaign B finalized.");
        logCampaignInfo("Campaign B - Final State", await campaignB.getCampaignInfo(), ftsoPriceRaw, ftsoDecimals);
        // Note: Funds remain in Campaign B contract as there's no refund mechanism in this version.
    } catch (e: any) {
        console.error(`Error finalizing Campaign B: ${e.message}`);
        const latestCampaignBInfo = await campaignB.getCampaignInfo();
        if (Number(latestCampaignBInfo[3]) > Math.floor(Date.now()/1000) && !latestCampaignBInfo[5]) { // Check deadline and goal met
            console.error("Finalization likely failed because: (deadline hasn't passed on-chain OR goal was not met) AND (goal was not met). Ensure time travel worked or deadline has truly passed on the live network if applicable.");
        }
    }

    // --- 4. NEGATIVE TESTS / EDGE CASES ---
    console.log("\n\n--- NEGATIVE TESTS ---");
    if (campaignA_Address) { // Only if Campaign A was successfully created and finalized
        console.log("\nAttempting contribution to already closed Campaign A (should fail)...");
        try {
            await factory.connect(contributor1).contributeToCampaign(campaignA_Address, { value: ethers.parseEther("1") });
            console.error("FAIL: Contribution to closed Campaign A succeeded unexpectedly!");
        } catch (e: any) {
            console.log(`SUCCESS: Contribution to closed Campaign A failed as expected. (${e.message.slice(0,100)}...)`);
        }
    }

    if (campaignB_Address) { // Only if Campaign B was successfully created
        const latestCampaignBInfo = await campaignB.getCampaignInfo();
        if (latestCampaignBInfo[6]) { // If campaignClosed is true
            console.log("\nAttempting contribution to finalized Campaign B (should fail)...");
            try {
                await factory.connect(contributor1).contributeToCampaign(campaignB_Address, { value: ethers.parseEther("1") });
                console.error("FAIL: Contribution to finalized Campaign B succeeded unexpectedly!");
            } catch (e: any) {
                console.log(`SUCCESS: Contribution to finalized Campaign B failed as expected. (${e.message.slice(0,100)}...)`);
            }
        } else {
            console.log("\nSkipping contribution test to Campaign B as it's not marked closed yet.");
        }

        console.log("\nAttacker attempting to finalize Campaign B (should fail if not owner or already closed)...");
        try {
            await campaignB.connect(attacker).finalizeCampaign();
            console.error("FAIL: Attacker finalized Campaign B unexpectedly!");
        } catch (e: any) {
            console.log(`SUCCESS: Attacker finalizing Campaign B failed as expected. (${e.message.slice(0,100)}...)`);
        }
    }

    // --- 5. FACTORY READ FUNCTIONS ---
    console.log("\n\n--- FACTORY READ FUNCTIONS ---");
    const totalCampaigns = await factory.getCampaignCount();
    console.log("Total campaigns created by factory:", totalCampaigns.toString());

    const allCampaigns = await factory.getCampaigns();
    console.log("All campaign addresses from factory:", allCampaigns);

    const deployerCampaigns = await factory.getCreatorCampaigns(deployer.address);
    console.log(`Campaigns created by deployer (${deployer.address}):`, deployerCampaigns);
    console.log(`Deployer campaign count from factory: ${await factory.getCreatorCampaignCount(deployer.address)}`);

    if (totalCampaigns > 0n) { // Compare with BigInt zero
        const paginatedCampaigns = await factory.getCampaignsPaginated(0n, 2n); // Use BigInt for start/count
        console.log("Paginated campaigns (index 0, count 2):", paginatedCampaigns);
    }

    console.log("\n\n--- SCRIPT COMPLETED SUCCESSFULLY ---");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n--- SCRIPT FAILED ---");
        console.error(error);
        process.exit(1);
    });