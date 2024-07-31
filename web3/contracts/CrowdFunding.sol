// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool completed;
    }

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;
    address public developer;
    uint256 public developerBalance;

    event CampaignCreated(
        uint256 indexed campaignId,
        address owner,
        string title,
        uint256 target,
        uint256 deadline
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address donator,
        uint256 amount
    );

    event CampaignCompleted(
        uint256 indexed campaignId,
        uint256 amountCollected
    );

    event DeveloperFundsWithdrawn(uint256 amount);

    constructor() {
        developer = msg.sender;
    }

    modifier onlyDeveloper() {
        require(
            msg.sender == developer,
            "Only the developer can perform this action"
        );
        _;
    }

    modifier onlyOwner(uint256 _campaignId) {
        require(
            msg.sender == campaigns[_campaignId].owner,
            "Only the campaign owner can perform this action"
        );
        _;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(
            block.timestamp < _deadline,
            "The deadline should be a date in the future."
        );

        Campaign storage newCampaign = campaigns[numberOfCampaigns];
        newCampaign.owner = msg.sender;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;
        newCampaign.image = _image;
        newCampaign.completed = false;

        emit CampaignCreated(
            numberOfCampaigns,
            msg.sender,
            _title,
            _target,
            _deadline
        );

        return numberOfCampaigns++;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(
            block.timestamp < campaigns[_id].deadline,
            "Campaign has ended"
        );
        require(!campaigns[_id].completed, "Campaign is completed");

        uint256 amount = msg.value;
        uint256 fee = (amount * 2) / 100; // 2% fee
        uint256 donation = amount - fee;

        Campaign storage campaign = campaigns[_id];
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        developerBalance += fee;

        (bool sent, ) = payable(campaign.owner).call{value: donation}("");
        require(sent, "Donation transfer failed");

        campaign.amountCollected += amount;

        emit DonationReceived(_id, msg.sender, donation);

        if (campaign.amountCollected >= campaign.target) {
            campaign.completed = true;
            emit CampaignCompleted(_id, campaign.amountCollected);
        }
    }

    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }

        return allCampaigns;
    }

    function getCampaign(uint256 _id) public view returns (Campaign memory) {
        Campaign storage campaign = campaigns[_id];
        return campaign;
    }

    function withdrawDeveloperFunds() public onlyDeveloper {
        uint256 amount = developerBalance;
        developerBalance = 0;
        (bool success, ) = payable(developer).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit DeveloperFundsWithdrawn(amount);
    }

    function withdrawCampaignFunds(
        uint256 _campaignId
    ) public onlyOwner(_campaignId) {
        require(
            block.timestamp >= campaigns[_campaignId].deadline,
            "Campaign is still active"
        );
        require(
            !campaigns[_campaignId].completed,
            "Campaign funds already withdrawn"
        );

        uint256 amount = campaigns[_campaignId].amountCollected;
        campaigns[_campaignId].amountCollected = 0;
        campaigns[_campaignId].completed = true;
        (bool success, ) = payable(campaigns[_campaignId].owner).call{
            value: amount
        }("");
        require(success, "Withdrawal failed");

        emit CampaignCompleted(_campaignId, amount);
    }
}
