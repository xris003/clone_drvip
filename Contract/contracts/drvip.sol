//  // SPDX-License-Identifier: GPL-3.0

//  pragma solidity >=0.7.0 <0.9.0;

//  import "hardhat/console.sol";
//  import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
//  import "@openzeppelin/contracts/utils/Counters.sol";

// contract Badge is ERC1155 {
//     using Counters for Counters.Counter;
//     Counters.Counter private _badgeId;

//     address payable contractacct = payable (address(this));

//     // modifier onlyOwner() {
//     //     require(
//     //         msg.sender == merchant,
//     //         "You're not authorised to perform this function"
//     //     );
//     //     _;
//     // }

//     struct ListedBadge {
//         uint256 badgeId;
//         address payable merchant;
//         uint quantity;
//         uint256 price;
//     }

//     // To map a badgeID to it's data.
//     mapping(string => ListedBadge) public nameofBadge;

//     // Map to check if a URI already exists
//     mapping(string => bool) public tokenURIExists;

//     constructor() ERC1155("BadgeItem") {
//         //merchant = msg.sender; // Set the merchant in the constructor
//     }

//     function createBadge(uint256 price, uint256 quantity, string calldata name) public {
        
//         require(price > 0, "cannot set negative amount");
//         require(quantity > 0, "Kindly set the quantity for your token");
       
//         _badgeId.increment();
//         uint256 badgeId = _badgeId.current();
//         address minter = msg.sender;

//         _mint(minter, badgeId, quantity, " "); // You might want to provide a more meaningful URI here

//         //Update the mapping of tokenId's to Token details, useful for retrieval functions
//         nameofBadge[name] = ListedBadge(
//             badgeId,
//             payable(msg.sender),
//             quantity,
//             price
//         );

//     }

//     function buyBadge(string calldata name) public payable {
//         uint price = nameofBadge[name].price;
//         address payable _merchant = nameofBadge[name].merchant;
//         // address buyer = msg.sender;

//         // require(amount >= price, "Amount is less than the price of the badge"); 

//         require(
//             msg.sender != _merchant,
//             "Owner can not buy his own NFT"
//         );

//         require(
//             msg.value == price,
//             "Please submit price in order to complete the purchase"
//         );

//         payable(_merchant).transfer(price);
        
//     }

//     function transferBadge(address to, uint quantity, string calldata name) public {
//         address payable merchant = nameofBadge[name].merchant;
//         uint tokenId = nameofBadge[name].badgeId;
//         require(msg.sender == merchant );

//         safeTransferFrom(merchant, to, tokenId, quantity, "");
//     }

//      function badgeBal(uint256 badgeId, string calldata name) public view  returns (uint256) {
//         address merchant = nameofBadge[name].merchant;
//         require(msg.sender == merchant);
//         return balanceOf(merchant, badgeId); 
//     }

//     function Approve(string calldata name) public {
        
//         setApprovalForAll(contractacct, true );
        
//         nameofBadge[name].merchant = payable(contractacct);
//     }

//     function checkApprovalForAll( string calldata name) internal view returns (bool) {
//     address payable merchant = nameofBadge[name].merchant;
//     // Use isApprovedForAll to check approval status
//     return isApprovedForAll(merchant, contractacct);
//     }

//     function transferTokensToSmartContract( uint256 quantity, string calldata name) public payable {
//         uint price = nameofBadge[name].price;
//         uint tokenId = nameofBadge[name].badgeId;
//         require(msg.value == price);

//          // Check if approval is already set
//     if (checkApprovalForAll(name)) {
//         // If not approved, set approval
//         Approve(name);
//     }

//         safeTransferFrom(contractacct, msg.sender, tokenId, quantity, "");

//         (payable(contractacct)).transfer(msg.value);

//           // (contractacct).transfer(price);
//     }
// }

 // SPDX-License-Identifier: GPL-3.0

 pragma solidity >=0.7.0 <0.9.0;

 import "hardhat/console.sol";
 import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
 import "@openzeppelin/contracts/utils/Counters.sol";

contract Badge is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _badgeId;

    address payable contractacct = payable (address(this));

    // modifier onlyOwner() {
    //     require(
    //         msg.sender == merchant,
    //         "You're not authorised to perform this function"
    //     );
    //     _;
    // }

    struct ListedBadge {
        uint256 badgeId;
        address contractaddr;
        address payable merchant;
        uint quantity;
        uint256 price;
    }

    // To map a badgeID to it's data.
    mapping(string => ListedBadge) public nameofBadge;

    // Map to check if a URI already exists
    mapping(string => bool) public tokenURIExists;

    constructor() ERC1155("BadgeItem") {
        //merchant = msg.sender; // Set the merchant in the constructor
    }

    function Approve(string calldata name) public {
        
        address contractaddr = address(this);

        setApprovalForAll(contractaddr, true );
        
        nameofBadge[name].contractaddr = contractacct;
    }

    function createBadge(uint256 price, uint256 quantity, string calldata name) public {
        address contractaddr = address(this);
        require(price > 0, "cannot set negative amount");
        require(quantity > 0, "Kindly set the quantity for your token");
       
        _badgeId.increment();
        uint256 badgeId = _badgeId.current();
        address minter = msg.sender;

        _mint(minter, badgeId, quantity, " "); 

        // Approve contract to send token on behalf of the owner
         Approve(name);

        //Update the mapping of tokenId's to Token details, useful for retrieval functions
        nameofBadge[name] = ListedBadge(
            badgeId,
            contractaddr,
            payable(msg.sender),
            quantity,
            price
        ); 

    }

    function buyBadge(string calldata name) public payable {
        uint price = nameofBadge[name].price;
        address payable _merchant = nameofBadge[name].merchant;
        // address buyer = msg.sender;

        // require(amount >= price, "Amount is less than the price of the badge"); 

        require(
            msg.sender != _merchant,
            "Owner can not buy his own NFT"
        );

        require(
            msg.value == price,
            "Please submit price in order to complete the purchase"
        );

        payable(_merchant).transfer(price);
        
    }

    function transferBadge(address to, uint quantity, string calldata name) public {
        address payable merchant = nameofBadge[name].merchant;
        uint tokenId = nameofBadge[name].badgeId;
        require(msg.sender == merchant );

        safeTransferFrom(merchant, to, tokenId, quantity, "");
    }

     function badgeBal(uint256 badgeId, string calldata name) public view  returns (uint256) {
        address merchant = nameofBadge[name].merchant;
        require(msg.sender == merchant);
        return balanceOf(merchant, badgeId); 
    }


    function checkApprovalForAll( string calldata name) internal view returns (bool) {
    address payable merchant = nameofBadge[name].merchant;
    // Use isApprovedForAll to check approval status
    return isApprovedForAll(merchant, contractacct);
    }

    function transferTokensToSmartContract( uint256 quantity, string calldata name) public payable {
        uint price = nameofBadge[name].price;
        uint tokenId = nameofBadge[name].badgeId;
        address contractaddr = nameofBadge[name].contractaddr;
        address payable merchant = nameofBadge[name].merchant;
        require(msg.value == price);

        safeTransferFrom(contractaddr, msg.sender, tokenId, quantity, "");

        (payable(merchant)).transfer(msg.value);

          // (contractacct).transfer(price);
    }
}
