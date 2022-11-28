// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CrowdFunding is Initializable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    CountersUpgradeable.Counter private _userId;
    CountersUpgradeable.Counter private _campaignId;
    CountersUpgradeable.Counter private _categoryId;
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

    struct Category {
        uint256 id;
        string name;
        bool status;
        uint timestamp;
    }
    struct User {
        uint256 id;
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
        uint256 id;
        string name;
        string description;
        string imageHash;
        uint256 goalAmount;
        uint256 currentBalance;
        uint deadline;
        address payable creator;
        CampaignStatus campaignStatus;
        CampaignApprovalStatus campaignApprovalStatus;
        bool status;
        uint timestamp;
    }
    struct UserContribution {
        uint256 campaignId;
        uint256 amount;
        uint timestamp;
    }
    struct Contribution {
        address payable contributor;
        uint256 amount;
    }
    struct AddCampaignPayload {
        string _name;
        string _description;
        string _imageHash;
        uint256 _goalAmount;
        uint256 _deadline;
        File[] _files;
    }

    Category[] private _categories;
    mapping(address => User) private _users;
    Campaign[] private _campaigns;
    mapping(uint256 => File[]) private _campaignFiles;
    mapping(address => UserContribution[]) private _userContributions;
    mapping(address => uint256[]) private _fundRaiserCampaigns;
    mapping(uint256 => Contribution[]) private _contributions;

    // instead of constructor using initializer
    function initialize() public initializer {
        __Ownable_init();

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
        // create some categories by default
        _categoryId.increment();
        _categories.push(
            Category(_categoryId.current(), "Medical", true, block.timestamp)
        );
        _categoryId.increment();
        _categories.push(
            Category(_categoryId.current(), "NGO", true, block.timestamp)
        );
        _categoryId.increment();
        _categories.push(
            Category(_categoryId.current(), "Business", true, block.timestamp)
        );
        _categoryId.increment();
        _categories.push(
            Category(_categoryId.current(), "Personal", true, block.timestamp)
        );
        _categoryId.increment();
        _categories.push(
            Category(_categoryId.current(), "Others", true, block.timestamp)
        );
    }

    // Modifires ==============
    modifier hasValidAddress() {
        require(msg.sender != address(0), "Not a valid address!");
        _;
    }
    modifier createCategoryValidator(string calldata _name) {
        require(bytes(_name).length > 0, "Category name is required!");
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
    modifier campaignContributionValidator(uint256 _id) {
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
    modifier onlyAfterDeadline(uint256 _id) {
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
    modifier addCampaignValidator(AddCampaignPayload memory data) {
        require(bytes(data._name).length > 10, "Name is required!");
        require(
            bytes(data._description).length > 50,
            "Description is required!"
        );
        require(
            bytes(data._imageHash).length == 32,
            "Image IPFS hash is required!"
        );
        require(data._goalAmount > 0, "Goal Amount is required!");
        require(data._deadline > 0, "Deadline is required!");
        if (data._files.length > 0) {
            for (uint i = 0; i < data._files.length; i++) {
                require(
                    bytes(data._files[i].ipfsHash).length == 32,
                    "Files IPFS hash is required!"
                );
            }
        }
        _;
    }

    // Functions ==============

    function createCategory(
        string calldata _name
    ) external onlyOwner createCategoryValidator(_name) {
        _categoryId.increment();
        _categories.push(
            Category(_categoryId.current(), _name, true, block.timestamp)
        );
    }

    function deleteCategory(uint256 _id) external onlyOwner {
        for (uint i = 0; i < _categories.length; i++) {
            if (_categories[i].id == _id) {
                _categories[i].status = false;
            }
        }
    }

    function createUser(
        string calldata _name,
        string calldata _email
    )
        external
        hasValidAddress
        createUserValidator(_name, _email)
        returns (uint256)
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
        AddCampaignPayload memory data
    ) external hasValidAddress isFundRaiser returns (uint256) {
        _campaignId.increment();
        _campaigns.push(
            Campaign(
                _campaignId.current(),
                data._name,
                data._description,
                data._imageHash,
                data._goalAmount,
                0,
                data._deadline,
                payable(msg.sender),
                CampaignStatus.Fundraising,
                CampaignApprovalStatus.Created,
                true,
                block.timestamp
            )
        );

        for (uint i = 0; i < data._files.length; i++) {
            _campaignFiles[_campaignId.current()].push(
                File(data._files[i].ipfsHash)
            );
        }
        emit CampaignCreated(_campaignId.current());
        return _campaignId.current();
    }

    function approveCampaign(uint256 _id) external onlyOwner {
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

    function rejectCampaign(uint256 _id) external onlyOwner {
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                _campaigns[i].campaignApprovalStatus = CampaignApprovalStatus
                    .Rejected;
                emit CampaignRejected(_id);
            }
        }
    }

    function completeCampaign(
        uint256 _id
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

    function contribute(
        uint256 _id
    ) external payable hasValidAddress campaignContributionValidator(_id) {
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

                // add into user's Contribution
                _addUserContribution(_id);

                // add campaign Contribution history
                _addCampaignContribution(_id);
            }
        }
    }

    function _addUserContribution(uint256 _id) private {
        bool existing = false;
        for (uint i = 0; i < _userContributions[msg.sender].length; i++) {
            if (_userContributions[msg.sender][i].campaignId == _id) {
                _userContributions[msg.sender][i].amount += msg.value;
                _userContributions[msg.sender][i].timestamp = block.timestamp;

                existing = true;
            }
        }
        if (!existing) {
            _userContributions[msg.sender].push(
                UserContribution(_id, msg.value, block.timestamp)
            );
        }
    }

    function _addCampaignContribution(uint256 _id) private {
        _contributions[_id].push(Contribution(payable(msg.sender), msg.value));
    }

    function getUserContributions()
        external
        view
        hasValidAddress
        returns (UserContribution[] memory)
    {
        return _userContributions[msg.sender];
    }

    function getCampaignContributions(
        uint256 _id
    ) external view hasValidAddress returns (Contribution[] memory) {
        return _contributions[_id];
    }

    // Events ==============

    event CampaignCreated(uint256 indexed id);
    event CampaignApproved(uint256 indexed id);
    event CampaignRejected(uint256 indexed id);
    event CampaignCompleted(uint256 indexed id);
}
