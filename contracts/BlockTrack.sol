pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title BlockTrack
 * BlockTrack - a contract to track parcels on Blockchain.
 */
contract BlockTrack is ERC721Token, Ownable {

  // Constructor function to initialize the name and tag of the token.
  function BlockTrack() ERC721Token ("BlockTrack", "BT") public {
    // Sets initial parcel so ID 0 is taken.
    _internalMint(msg.sender, msg.sender, '0');
  }

  /**** Storage ****/

  // Containing all structs for the tokens in existence, struct is the index in array.
  Token[] tokens;

  // Mapping of all parcels (uint256) with their receiver (address).
  mapping (uint256 => address) internal ParcelToReceiver;

  // Mapping a shippingCompany (address) to its name (string).
  mapping (address => string) internal NameToShippingCompany;

  // Mapping a deliverer (adddress) to its name or identifier (string).
  mapping (address => string) internal NameToDeliverer;

  // Mapping a deliverer (adddress) to its location (string).
  mapping (address => string) internal LocationToDeliverer;

  // Mapping of parcels (uint256) receiving total to a receiver (address).
  mapping (address => uint256) internal ReceivingParcelsCount;

  // Mapping a deliverer (address) to an existing ShippingCompany (address)
  mapping (address => address) internal CompanyToDeliverer;

  // Mapping a secret code (uint256) to a receiver (address)
  mapping (address => bytes32) internal secretToReceiver;

  // Mapping a receiver (address) to a secret code (uint256)
  mapping (bytes32 => address) internal receiverToSecret;


  /**** Events ****/

  event handOff(address indexed owner, address indexed receiver, uint256 indexed tokenId, uint64 time, bool delivered, string delivererName, string receiverName, string location);
  // event delivererRegistered(address deliverer, string name, address shippingcompany);
  // event shippingCompanyRegistered(address shippingcompany, string name);

  // Constructor of the token.
  struct Token {
    uint64 mintedAt; // Time of token creation
    address shippingCompany; // Company that processes the shipment as first
    address receivingAddress; // Public key of receiving party
    string receivingPostalAddress; // Long string with entire address
  }

  /**
  * @dev Throws if called by anyone that's not a shippingcompany.
  */
  modifier onlyShippingCompany() {
    require(bytes(NameToShippingCompany[msg.sender]).length > 0);
    _;
  }

  /**
  * @dev Throws if called by anyone that's not a deliverer.
  */
  modifier OnlyDeliverer() {
    require(bytes(NameToDeliverer[msg.sender]).length > 0);
    _;
  }

   /**
  * @dev Checks if the receiving address is allowed to receive the token.
  */
  function allowedToReceive(uint256 _tokenId, bytes32 _secret) public OnlyDeliverer() view returns (bool allowed) {
    require(
        receiverToSecret[_secret] != 0
      );

    address _receiver = receiverToSecret[_secret];
    bytes32 _newSecret = secretToReceiver[_receiver];

    if (ParcelToReceiver[_tokenId] == _receiver && _secret == _newSecret) {
      return true;
    } else if (bytes(NameToDeliverer[_receiver]).length > 0 && _secret == _newSecret){
      return true;
    } else {
      return false;
    }
  }

  /**
  * @dev returns the role of the address that is submitted (Customer/Deliverer/Shipping Company)
  */
  function addressIsRole(address _address) public view returns (uint64 role) {
    if (bytes(NameToShippingCompany[_address]).length > 0) {
      return 2;
    } else if (bytes(NameToDeliverer[_address]).length > 0) {
      return 1;
    } else {
      return 0;
    }
  }

  /// @notice Returns the number of parcels owned by a specific address.
  /// @param _receiver The owner address to check.
  /// @dev Required for ERC-721 compliance
  function balanceOfReceiver(address _receiver) public view returns (uint256 count) {
      return ReceivingParcelsCount[_receiver];
  }

  /**
  * @dev Returns values for specific token id (uint256) that's called.
  */
  function getToken(uint256 _tokenId) external view returns (uint256 tokenId, uint64 mintedAt, string shippingCompany, address receivingAddress, string receivingPostalAddress) {
    Token memory token = tokens[_tokenId];

    mintedAt = token.mintedAt;
    shippingCompany = NameToShippingCompany[token.shippingCompany];
    receivingAddress = token.receivingAddress;
    receivingPostalAddress = token.receivingPostalAddress;
    tokenId = _tokenId;
  }

  /// @notice Returns a list of all tokens assigned to an address.
  /// @param _owner The owner whose parcels we are looking at.
  function tokensOfOwner(address _owner) external view returns(uint256[] ownerTokens) {
    uint256 tokenCount = balanceOf(_owner);

    if (tokenCount == 0) {
        // Return an empty array
        return new uint256[](0);
    } else {
        uint256[] memory result = new uint256[](tokenCount);
        uint256 totalParcels = totalSupply();
        uint256 resultIndex = 0;

        // We count on the fact that all parcels have IDs starting at 0 and increasing
        // sequentially up to the total count.
        uint256 parcelId;

        for (parcelId = 0; parcelId <= totalParcels; parcelId++) {
            if (tokenOwner[parcelId] == _owner) {
                result[resultIndex] = parcelId;
                resultIndex++;
            }
        }

        return result;
    }
  }

  /// @notice Returns a list of all tokens being received by an address.
  /// @param _receiver The parcels of the owner we are looking for.
  function parcelsOfReceiver(address _receiver) external view returns(uint256[] receiverParcels) {
    uint256 tokenCount = balanceOfReceiver(_receiver);

    if (tokenCount == 0) {
        // Return an empty array
        return new uint256[](0);
    } else {
        uint256[] memory result = new uint256[](tokenCount);
        uint256 totalParcels = totalSupply();
        uint256 resultIndex = 0;

        // We loop through all parcels starting at 0 all the way up to the total token count.
        uint256 parcelId;

        for (parcelId = 0; parcelId <= totalParcels; parcelId++) {
            if (ParcelToReceiver[parcelId] == _receiver) {
                result[resultIndex] = parcelId;
                resultIndex++;
            }
        }

        return result;
    }
  }

  /// @notice checks couple values before calling safeTransferFrom to transfer token
  /// @param _tokenId id of the token to be transfered.
  function transferTokenTo(uint256 _tokenId, bytes32 _secret) public OnlyDeliverer() {
    require(
        allowedToReceive(_tokenId, _secret)
      );

    address _to = receiverToSecret[_secret];
    _setSecret(_to);
    super.safeTransferFrom(msg.sender, _to, _tokenId);
    Token memory token = tokens[_tokenId];

    if (ParcelToReceiver[_tokenId] == _to) {
      emit handOff(msg.sender, _to, _tokenId, uint64(now), true, NameToDeliverer[msg.sender], 'Receiver', token.receivingPostalAddress);
    } else {
      emit handOff(msg.sender, _to, _tokenId, uint64(now), false, NameToDeliverer[msg.sender], NameToDeliverer[_to], LocationToDeliverer[_to]);
    }
  }

  /// @notice registers a new shippingCompany to its mapping.
  /// @param _shippingCompany address of the shipping company.
  /// @param _name name of the shipping company.
  function registerShippingCompany(address _shippingCompany, string _name) public onlyOwner {
    NameToShippingCompany[_shippingCompany] = _name;
    // emit shippingCompanyRegistered(_shippingCompany, _name);
  }

  /// @notice registers a new deliverer to its mapping.
  /// @param _deliverer address of the deliverer.
  /// @param _name name or identifier of the deliverer.
  function registerDeliverer(address _deliverer, string _name, string _location) public onlyShippingCompany() {
    NameToDeliverer[_deliverer] = _name;
    LocationToDeliverer[_deliverer] = _location;
    CompanyToDeliverer[_deliverer] = msg.sender;
    _setSecret(_deliverer);
    // emit delivererRegistered(_deliverer, _name, msg.sender);
  }

  function _internalMint(address _deliverer, address _receivingAddress, string _receivingPostalAddress) internal {
    Token memory token = Token({
      mintedAt: uint64(now),
      shippingCompany: msg.sender,
      receivingAddress: _receivingAddress,
      receivingPostalAddress: _receivingPostalAddress
    });

    // Generates new ID for the token.
    uint256 newTokenId = tokens.push(token) - 1;

    // Adds 1 to the total amount of parcels to be received by receiver.
    ReceivingParcelsCount[_receivingAddress] = ReceivingParcelsCount[_receivingAddress].add(1);
    // Maps Parcel to it's receiver.
    ParcelToReceiver[newTokenId] = _receivingAddress;

    if (secretToReceiver[_receivingAddress].length != 0) {
      _setSecret(_receivingAddress);
    }

    emit handOff(msg.sender, _deliverer, newTokenId, uint64(now), false, NameToShippingCompany[msg.sender], NameToDeliverer[_deliverer], LocationToDeliverer[_deliverer]);

    super._mint(_deliverer, newTokenId);
  }

  /// @notice generates a hashed secret based on the time and parcel receiver.
  function _setSecret(address _receiver) internal {
    bytes32 _secret = keccak256(uint64(now), _receiver);
    secretToReceiver[_receiver] = _secret;
    receiverToSecret[_secret] = _receiver;
  }

  /// @notice Gets the secret of the msg.sender
  function getSecret() external view returns (bytes32 secret) {
    return secretToReceiver[msg.sender];
  }

   /**
    * @dev Mints a token to an address.
    * @param _deliverer address of the future owner of the token
    * @param _receivingAddress address of the parcel receiver
    * @param _receivingPostalAddress postal address of the receiving public key
    */
  function registerParcel(address _deliverer, address _receivingAddress, string _receivingPostalAddress) public onlyShippingCompany() {
    require(bytes(NameToDeliverer[_deliverer]).length > 0);
    _internalMint(_deliverer, _receivingAddress, _receivingPostalAddress);
  }
}