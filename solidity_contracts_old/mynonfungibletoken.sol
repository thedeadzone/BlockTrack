pragma solidity ^0.4.23;

import "./safemath.sol";
import "./ownable.sol";
import "./ERC721.sol";


contract MyNonFungibleToken is ERC721 {
  /*** CONSTANTS ***/

  string public constant name = "BlockTrack";
  string public constant symbol = "BT";

  bytes4 constant InterfaceID_ERC165 =
    bytes4(keccak256('supportsInterface(bytes4)'));

  bytes4 constant InterfaceID_ERC721 =
    bytes4(keccak256('name()')) ^
    bytes4(keccak256('symbol()')) ^
    bytes4(keccak256('totalSupply()')) ^
    bytes4(keccak256('balanceOf(address)')) ^
    bytes4(keccak256('ownerOf(uint256)')) ^
    bytes4(keccak256('approve(address,uint256)')) ^
    bytes4(keccak256('transfer(address,uint256)')) ^
    bytes4(keccak256('transferFrom(address,address,uint256)')) ^
    bytes4(keccak256('tokensOfOwner(address)'));


  /*** DATA TYPES ***/

  struct Token {
    address mintedBy; // Address of token creator
    uint64 mintedAt; // Time of token creation
    uint64 shippingCompany; // Company that processes the shipment as first
    address receivingAddress; // Public key of receiving party
    uint256 receivingPostalAddress; // Stored as Json for easy handeling
  }


  /*** STORAGE ***/

  // Array containing all the structs for all tokens in existince, id of the struct is the index in the array.
  Token[] tokens;

  // Array containing all the verified addresses for parcel receiving.
  address[] verifiedAddresses;

  // Array containing all the verified shipping company addresses.
  address[] shippingCompanyAddresses;

  // Mapping of all the 
  mapping (uint256 => address) public tokenIndexToOwner;
  mapping (address => uint256) ownershipTokenCount;
  mapping (uint256 => address) public tokenIndexToApproved;

  /*** EVENTS ***/

  event createParcel(address owner, uint256 tokenId, uint64 shippingCompany, address receivingAddress);
  event handOff(address owner, address receiver, uint256 tokenId); //, uint64 location
  event registerDeliverer(address deliverer, uint64 name, uint64 company);


  /*** INTERNAL FUNCTIONS ***/

  function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
    return tokenIndexToOwner[_tokenId] == _claimant;
  }

  function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
    return tokenIndexToApproved[_tokenId] == _claimant;
  }

  function _approve(address _to, uint256 _tokenId) internal {
    tokenIndexToApproved[_tokenId] = _to;

    emit Approval(tokenIndexToOwner[_tokenId], tokenIndexToApproved[_tokenId], _tokenId);
  }

  function _transfer(address _from, address _to, uint256 _tokenId) internal {
    ownershipTokenCount[_to]++;
    tokenIndexToOwner[_tokenId] = _to;

    if (_from != address(0)) {
      ownershipTokenCount[_from]--;
      delete tokenIndexToApproved[_tokenId];
    }

    emit handOff(_from, _to, _tokenId);
  }

  function _mint(address _owner, uint64 shippingCompany, address receivingAddress, uint256 receivingPostalAddress) internal returns (uint256 tokenId) {
    Token memory token = Token({
      mintedBy: _owner,
      mintedAt: uint64(now),
      shippingCompany: shippingCompany,
      receivingAddress: receivingAddress,
      receivingPostalAddress: receivingPostalAddress
    });
    tokenId = tokens.push(token) - 1;

    emit createParcel(_owner, tokenId, shippingCompany, receivingAddress);

    _transfer(0, _owner, tokenId);
  }

  /*** ERC721 IMPLEMENTATION ***/

  function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
    return ((_interfaceID == InterfaceID_ERC165) || (_interfaceID == InterfaceID_ERC721));
  }

  function totalSupply() public view returns (uint256) {
    return tokens.length;
  }

  function balanceOf(address _owner) public view returns (uint256) {
    return ownershipTokenCount[_owner];
  }

  function ownerOf(uint256 _tokenId) external view returns (address owner) {
    owner = tokenIndexToOwner[_tokenId];

    require(owner != address(0));
  }

  function approve(address _to, uint256 _tokenId) external {
    require(_owns(msg.sender, _tokenId));

    _approve(_to, _tokenId);
  }

  function transfer(address _to, uint256 _tokenId) external {
    require(_to != address(0));
    require(_to != address(this));
    require(_owns(msg.sender, _tokenId));

    //require(_verified(_to))
    // Hier moet checken of het receiver address verified is.

    _transfer(msg.sender, _to, _tokenId);
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) external {
    require(_to != address(0));
    require(_to != address(this));
    require(_approvedFor(msg.sender, _tokenId));
    require(_owns(_from, _tokenId));

    _transfer(_from, _to, _tokenId);
  }

  function tokensOfOwner(address _owner) external view returns (uint256[]) {
    uint256 balance = balanceOf(_owner);

    if (balance == 0) {
      return new uint256[](0);
    } else {
      uint256[] memory result = new uint256[](balance);
      uint256 maxTokenId = totalSupply();
      uint256 idx = 0;

      uint256 tokenId;
      for (tokenId = 1; tokenId <= maxTokenId; tokenId++) {
        if (tokenIndexToOwner[tokenId] == _owner) {
          result[idx] = tokenId;
          idx++;
        }
      }
    }

    return result;
  }

  /*** OTHER EXTERNAL FUNCTIONS ***/

  function mint(uint64 shippingCompany, address receivingAddress, uint256 receivingPostalAddress) external returns (uint256) {
    return _mint(msg.sender, shippingCompany, receivingAddress, receivingPostalAddress);
  }

  function getToken(uint256 _tokenId) external view returns (address mintedBy, uint64 mintedAt, uint64 shippingCompany, address receivingAddress, uint256 receivingPostalAddress) {
    Token memory token = tokens[_tokenId];

    mintedBy = token.mintedBy;
    mintedAt = token.mintedAt;
    shippingCompany = token.shippingCompany;
    receivingAddress = token.receivingAddress;
    receivingPostalAddress = token.receivingPostalAddress;
  }

  // TODO: Function to add shpimentCompany to list (Don't forget to use event?)
  // TODO: Function to register public key with company (Don't forget to hook to event)



}