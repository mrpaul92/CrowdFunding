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
    uint private constant VERIFICATION_AMOUNT = 10000000000000000;
    uint withdrawableBalance;

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
        string slug;
        string description;
        string imageHash;
        uint256 goalAmount;
        uint256 currentBalance;
        uint deadline;
        address payable creator;
        CampaignStatus campaignStatus;
        CampaignApprovalStatus campaignApprovalStatus;
        uint256 categoryId;
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
        string _slug;
        string _description;
        uint256 _categoryId;
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
    mapping(string => uint256) private _slugToCampaignIdMapping;

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
        for (uint i = 0; i < _categories.length; i++) {
            require(
                keccak256(abi.encodePacked(_categories[i].name)) !=
                    keccak256(abi.encodePacked(_name)),
                "Category name already exists!"
            );
        }
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
        // slug must be unique
        for (uint i = 0; i < _campaigns.length; i++) {
            require(
                keccak256(abi.encodePacked(_campaigns[i].slug)) !=
                    keccak256(abi.encodePacked(data._slug)),
                "Slug must be unique!"
            );
        }
        require(
            bytes(data._description).length > 50,
            "Description is required!"
        );
        require(data._categoryId > 0, "Category Id is required!");
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
    modifier requiresVerificationAmount() {
        require(
            msg.value >= VERIFICATION_AMOUNT,
            "Verification cost does not met!"
        );
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

    function getCategories()
        external
        view
        hasValidAddress
        returns (Category[] memory)
    {
        return _categories;
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
    )
        external
        payable
        hasValidAddress
        isFundRaiser
        requiresVerificationAmount
        returns (uint256)
    {
        _campaignId.increment();
        _campaigns.push(
            Campaign(
                _campaignId.current(),
                data._name,
                data._slug,
                data._description,
                data._imageHash,
                data._goalAmount,
                0,
                data._deadline,
                payable(msg.sender),
                CampaignStatus.Fundraising,
                CampaignApprovalStatus.Created,
                data._categoryId,
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
        _slugToCampaignIdMapping[data._slug] = _campaignId.current();

        withdrawableBalance += VERIFICATION_AMOUNT;
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
                if (_campaigns[i].currentBalance > _campaigns[i].goalAmount) {
                    uint extraAmount = _campaigns[i].currentBalance -
                        _campaigns[i].goalAmount;
                    withdrawableBalance += extraAmount;
                }
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
                    uint extraAmount = _campaigns[i].currentBalance -
                        _campaigns[i].goalAmount;
                    withdrawableBalance += extraAmount;
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

    function getCampaignById(
        uint256 _id
    ) public view hasValidAddress returns (Campaign memory) {
        Campaign memory campaignData = Campaign(
            0,
            "",
            "",
            "",
            "",
            0,
            0,
            0,
            payable(address(this)),
            CampaignStatus.Completed,
            CampaignApprovalStatus.Rejected,
            0,
            false,
            block.timestamp
        );
        for (uint i = 0; i < _campaigns.length; i++) {
            if (_campaigns[i].id == _id) {
                campaignData = Campaign(
                    _campaigns[i].id,
                    _campaigns[i].name,
                    _campaigns[i].slug,
                    _campaigns[i].description,
                    _campaigns[i].imageHash,
                    _campaigns[i].goalAmount,
                    _campaigns[i].currentBalance,
                    _campaigns[i].deadline,
                    _campaigns[i].creator,
                    _campaigns[i].campaignStatus,
                    _campaigns[i].campaignApprovalStatus,
                    _campaigns[i].categoryId,
                    _campaigns[i].status,
                    _campaigns[i].timestamp
                );
            }
        }
        return campaignData;
    }

    function getCampaignBySlug(
        string calldata _slug
    ) public view hasValidAddress returns (Campaign memory) {
        uint256 campaignId = _slugToCampaignIdMapping[_slug];
        require(campaignId > 0, "Campaign Not found!");
        Campaign memory campaignData = getCampaignById(campaignId);
        return campaignData;
    }

    function getWithdrawableBalance() public view onlyOwner returns (uint) {
        return withdrawableBalance;
    }

    function withdraw() external onlyOwner {
        address ownerAddress = OwnableUpgradeable.owner();
        payable(ownerAddress).transfer(withdrawableBalance);
        emit withdrawalComplete(withdrawableBalance);
        withdrawableBalance = 0;
    }

    function getVerificationAmount() external pure returns (uint) {
        return VERIFICATION_AMOUNT;
    }

    function getContactEmail() external pure returns (string memory) {
        return ADMIN_EMAIL;
    }

    // Events ==============

    event CampaignCreated(uint256 indexed id);
    event CampaignApproved(uint256 indexed id);
    event CampaignRejected(uint256 indexed id);
    event CampaignCompleted(uint256 indexed id);
    event withdrawalComplete(uint256 indexed amount);
}
