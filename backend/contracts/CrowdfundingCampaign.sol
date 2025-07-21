// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {FtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/FtsoV2Interface.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CrowdfundingCampaign is ReentrancyGuard {

    bytes21 public constant FLR_USD_ID = 0x01464c522f55534400000000000000000000000000;
    
    address public owner;
    address public beneficiary;
    uint256 public fundingGoalInUsd;
    uint256 public deadline;
    uint256 public totalFundsRaised;
    bool public fundingGoalReached;
    bool public campaignClosed;
    string public title;
    
    mapping(address => uint256) public contributions;
    
    //events
    event FundingReceived(address indexed contributor, uint256 amount, uint256 currentTotal);
    event CampaignFinalized(uint256 totalRaised, bool fundingGoalReached);
    event RefundClaimed(address indexed contributor, uint256 amount);
    event FundsWithdrawn(address indexed beneficiary, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(
        address _owner,
        address _beneficiary,
        uint256 _fundingGoalInUsd,
        uint256 _durationInDays,
        string memory _title
    ) {
        require(_owner != address(0), "Invalid owner");
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_fundingGoalInUsd > 0, "Invalid goal");
        
        owner = _owner;
        beneficiary = _beneficiary;
        fundingGoalInUsd = _fundingGoalInUsd * 1e18;
        deadline = block.timestamp + (_durationInDays * 1 days);
        title = _title;
    }
    
    function getFlrUsdPrice() public returns (uint256 price, int8 decimals, uint64 timestamp) {
        FtsoV2Interface ftsoV2 = ContractRegistry.getFtsoV2();
        return ftsoV2.getFeedById(FLR_USD_ID);
    }
    
    
    function contribute() external payable nonReentrant {
        require(!campaignClosed, "Campaign closed");
        require(block.timestamp <= deadline, "Deadline passed");
        require(msg.value > 0, "Zero contribution");
        
        contributions[msg.sender] += msg.value;
        totalFundsRaised += msg.value;
        
        emit FundingReceived(msg.sender, msg.value, totalFundsRaised);
        checkGoalReached();
    }
    
    function checkGoalReached() public {
        if (campaignClosed) return;
        
        (uint256 currentPrice, int8 currentDecimals, ) = getFlrUsdPrice();
        uint256 raisedValueInUsd = (totalFundsRaised * currentPrice) / (10 ** uint8(currentDecimals));
        
        if (raisedValueInUsd >= fundingGoalInUsd) {
            fundingGoalReached = true;
        }
    }
    
    function claimRefund() external nonReentrant {
        require(campaignClosed, "Campaign not finalized");
        require(!fundingGoalReached, "Goal was reached, no refunds");
        uint256 contributed = contributions[msg.sender];
        require(contributed > 0, "No contribution to refund");
        contributions[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: contributed}("");
        require(success, "Refund transfer failed");
        emit RefundClaimed(msg.sender, contributed);
    }

    function withdrawFunds() external nonReentrant {
        require(fundingGoalReached, "Goal not reached");
        require(!campaignClosed, "Campaign already finalized");
        require(msg.sender == beneficiary, "Only beneficiary can withdraw");
        campaignClosed = true;
        checkGoalReached();
        uint256 amount = totalFundsRaised;
        totalFundsRaised = 0;
        emit CampaignFinalized(amount, fundingGoalReached);
        (bool success, ) = payable(beneficiary).call{value: amount}("");
        require(success, "Withdraw transfer failed");
        emit FundsWithdrawn(beneficiary, amount);
    }

    function finalizeCampaign() external onlyOwner nonReentrant {
        require(!campaignClosed, "Already closed");
        require(block.timestamp > deadline || fundingGoalReached, "Still active");
        campaignClosed = true;
        checkGoalReached();
        emit CampaignFinalized(totalFundsRaised, fundingGoalReached);
        if (fundingGoalReached) {
            uint256 amount = totalFundsRaised;
            totalFundsRaised = 0;
            (bool success, ) = payable(beneficiary).call{value: amount}("");
            require(success, "Transfer failed");
            emit FundsWithdrawn(beneficiary, amount);
        }
    }
    
    function getCampaignInfo() external view returns (
        address _owner,
        address _beneficiary,
        uint256 _fundingGoalInUsd,
        uint256 _deadline,
        uint256 _totalFundsRaised,
        bool _fundingGoalReached,
        bool _campaignClosed,
        string memory _title
    ) {
        return (
            owner,
            beneficiary,
            fundingGoalInUsd,
            deadline,
            totalFundsRaised,
            fundingGoalReached,
            campaignClosed,
            title
        );
    }
    
    receive() external payable {
        require(msg.sender == owner, "Direct transfers not allowed");
    }
} 
