// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CrowdFunding is Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _userId;
    Counters.Counter private _campaignId;
    string private constant ADMIN_EMAIL = "mrpaul92@gmail.com";

    enum UserRole {
        Admin,
        Fundraiser
    }
    enum CampaignStatus {
        Fundraising,
        Completed
    }
    enum CampaignApprovalStatus {
        Created,
        Approved,
        Rejected
    }

    struct User {
        uint id;
        string name;
        string email;
        address key;
        UserRole role;
        bool status;
        uint timestamp;
    }
    struct File {
        string ipfsHash;
    }
    struct Campaign {
        uint id;
        string name;
        string description;
        string imageHash;
        uint goalAmount;
        uint currentBalance;
        uint deadline;
        address payable creator;
        CampaignStatus campaignStatus;
        CampaignApprovalStatus campaignApprovalStatus;
        bool status;
        uint timestamp;
    }
    struct UserDonation {
        uint campaignId;
        uint amount;
    }

    mapping(address => User) private _users;
    Campaign[] private _campaigns;
    mapping(uint => File[]) private _campaignFiles;
    mapping(address => UserDonation[]) private _userDonations;
    mapping(address => uint[]) private _fundRaiserCampaigns;

    // constructor
    constructor() {
        // create the admin user by default
        _userId.increment();
        _users[msg.sender] = User(
            _userId.current(),
            "Admin",
            ADMIN_EMAIL,
            msg.sender,
            UserRole.Admin,
            true,
            block.timestamp
        );
    }

    // Modifires ==============
    modifier hasValidAddress() {
        require(msg.sender != address(0), "Not a valid address!");
        _;
    }
    modifier createUserValidator(
        string calldata _name,
        string calldata _email
    ) {
        require(bytes(_name).length > 0, "Name is required!");
        require(bytes(_email).length > 0, "Email is required!");
        _;
    }
    modifier isFundRaiser() {
        User memory userData = getCurrentUser();
        require(
            userData.role == UserRole.Fundraiser,
            "User is not FundRaiser!"
        );
        _;
    }
    modifier campaignDonationValidator(uint _id) {
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                require(
                    _campaigns[i].campaignStatus == CampaignStatus.Fundraising,
                    "Campaign reached its goal!"
                );
                require(
                    _campaigns[i].campaignApprovalStatus ==
                        CampaignApprovalStatus.Approved,
                    "Campaign is not Available for funding!"
                );
                require(msg.value > 0, "Amount required!");
            }
        }
        _;
    }
    modifier onlyAfterDeadline(uint _id) {
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                require(
                    block.timestamp > _campaigns[i].deadline,
                    "Deadline not met yet!"
                );
            }
        }
        _;
    }

    // Functions ==============

    function createUser(
        string calldata _name,
        string calldata _email
    )
        external
        hasValidAddress
        createUserValidator(_name, _email)
        returns (uint)
    {
        _userId.increment();
        _users[msg.sender] = User(
            _userId.current(),
            _name,
            _email,
            msg.sender,
            UserRole.Fundraiser,
            true,
            block.timestamp
        );
        return _userId.current();
    }

    function getCurrentUser()
        public
        view
        hasValidAddress
        returns (User memory)
    {
        return _users[msg.sender];
    }

    function getUserDetails(
        address _address
    ) external view onlyOwner returns (User memory) {
        require(_address == address(_address), "Not a valid address!");
        return _users[_address];
    }

    function addCampaign(
        string calldata _name,
        string calldata _description,
        string calldata _imageHash,
        uint _goalAmount,
        uint _deadline,
        File[] calldata _files
    ) external hasValidAddress isFundRaiser returns (uint) {
        // validating here because of local variable limit
        require(bytes(_name).length > 10, "Name is required!");
        require(bytes(_description).length > 50, "Description is required!");
        require(bytes(_imageHash).length == 32, "Image IPFS hash is required!");
        require(_goalAmount > 0, "Goal Amount is required!");
        require(_deadline > 0, "Deadline is required!");

        _campaignId.increment();
        _campaigns.push(
            Campaign(
                _campaignId.current(),
                _name,
                _description,
                _imageHash,
                _goalAmount,
                0,
                _deadline,
                payable(msg.sender),
                CampaignStatus.Fundraising,
                CampaignApprovalStatus.Created,
                true,
                block.timestamp
            )
        );

        for (uint i = 0; i < _files.length; i++) {
            _campaignFiles[_campaignId.current()].push(
                File(_files[i].ipfsHash)
            );
        }
        emit CampaignCreated(_campaignId.current());
        return _campaignId.current();
    }

    function approveCampaign(uint _id) external onlyOwner {
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                _campaigns[i].campaignApprovalStatus = CampaignApprovalStatus
                    .Approved;
                // update Findraisers campaigns
                _fundRaiserCampaigns[_campaigns[i].creator].push(
                    _campaigns[i].id
                );
                emit CampaignApproved(_id);
            }
        }
    }

    function rejectCampaign(uint _id) external onlyOwner {
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                _campaigns[i].campaignApprovalStatus = CampaignApprovalStatus
                    .Rejected;
                emit CampaignRejected(_id);
            }
        }
    }

    function completeCampaign(
        uint _id
    ) external onlyOwner onlyAfterDeadline(_id) {
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                _campaigns[i].campaignStatus = CampaignStatus.Completed;
                // transfer the goal amount to the creator
                _campaigns[i].creator.transfer(_campaigns[i].currentBalance);
                emit CampaignCompleted(_id);
            }
        }
    }

    function getAllCampaigns()
        external
        view
        hasValidAddress
        returns (Campaign[] memory)
    {
        return _campaigns;
    }

    function donate(
        uint256 _id
    ) external payable hasValidAddress campaignDonationValidator(_id) {
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                // update campaign balance
                _campaigns[i].currentBalance += msg.value;
                // check if currentBalance reached the goal update campaign status & transfer the goal amount to the creator
                if (_campaigns[i].currentBalance >= _campaigns[i].goalAmount) {
                    _campaigns[i].campaignStatus = CampaignStatus.Completed;
                    _campaigns[i].creator.transfer(_campaigns[i].goalAmount);
                    emit CampaignCompleted(_id);
                }

                // add into user's Donations
                _userDonations[msg.sender].push(UserDonation(_id, msg.value));
            }
        }
    }

    function getUserDonations() external view returns (UserDonation[] memory) {
        return _userDonations[msg.sender];
    }

    // Events ==============

    event CampaignCreated(uint indexed id);
    event CampaignApproved(uint indexed id);
    event CampaignRejected(uint indexed id);
    event CampaignCompleted(uint indexed id);
}
