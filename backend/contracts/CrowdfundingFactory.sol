// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./CrowdfundingCampaign.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract CrowdfundingFactory is Ownable {
    // Array to keep track of all campaigns
    address[] public campaigns;
    
    // Mapping from creator address to their campaigns
    mapping(address => address[]) public creatorCampaigns;
    
    // Events
    event CampaignCreated(address indexed owner, address campaign, string title);
 
    constructor() Ownable(msg.sender) {}
    
    
    function createCampaign( 
        address _beneficiary,
        uint256 _fundingGoalInUsd,
        uint256 _durationInDays,
        string memory _title
    ) external returns (address) {
        
        CrowdfundingCampaign newCampaign = new CrowdfundingCampaign(
            msg.sender,
            _beneficiary,
            _fundingGoalInUsd,
            _durationInDays,
            _title
        );
        
        campaigns.push(address(newCampaign));
        emit CampaignCreated(msg.sender, address(newCampaign), _title);
        
        // Add to creator's campaigns
        creatorCampaigns[msg.sender].push(address(newCampaign));
        
        return address(newCampaign);
    }
    
    
    function getCampaignCount() external view returns (uint256 count) {
        return campaigns.length;
    }
    
    
    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
    
    
    function getCreatorCampaignCount(address creator) external view returns (uint256 count) {
        return creatorCampaigns[creator].length;
    }
   
    function getCreatorCampaigns(address creator) external view returns (address[] memory) {
        return creatorCampaigns[creator];
    }
    
    function getCampaignsPaginated(uint256 startIndex, uint256 count) external view returns (address[] memory) {
        require(startIndex < campaigns.length, "Start index out of bounds");
        
        // Adjust count if it would exceed array bounds
        if (startIndex + count > campaigns.length) {
            count = campaigns.length - startIndex;
        }
        
        address[] memory result = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = campaigns[startIndex + i];
        }
        
        return result;
    }
    
   
    function contributeToCampaign(address campaignAddress) external payable {
        require(msg.value > 0, "Contribution must be greater than 0");
        
        // Verify that the campaign exists in our registry
        bool campaignExists = false;
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i] == campaignAddress) {
                campaignExists = true;
                break;
            }
        }
        require(campaignExists, "Campaign not found in registry");
        
        // Forward the contribution to the campaign
        CrowdfundingCampaign campaign = CrowdfundingCampaign(payable(campaignAddress));
        
        // Call the contribute function with the msg.value
        (bool success, ) = campaignAddress.call{value: msg.value}(
            abi.encodeWithSignature("contribute()")
        );
        
        require(success, "Contribution failed");
    }
} 