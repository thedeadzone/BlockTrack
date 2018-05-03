pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title BlockTrack
 * BlockTrack - a contract to track parcels on Blockchain.
 */
contract BlockTrack is ERC721Token, Ownable {

  function BlockTrack() ERC721Token ("BlockTrack", "BT") public { }

  /**** Storage ****/

  // Containing all structs for the tokens in existence, struct is the index in array.
  Token[] tokens;

  // Array containing all the verified addresses for parcel receiving.
  address[] verifiedAddresses;

  // Array containing all the verified shipping company addresses.
  address[] shippingCompanyAddresses;

  mapping (uint256 => address) internal ParcelToReceiver;

  mapping (address => uint256) internal ReceivingParcelsCount;

  /**** Events ****/

  event createParcel(address owner, uint256 indexed tokenId, string indexed shippingCompany, address indexed receivingAddress); // AKA Mint
  event handOff(address owner, address indexed receiver, uint256 indexed tokenId, uint64 time); //, uint64 location
  event registerDeliverer(address deliverer, string name, string company);

  struct Token {
    address mintedBy; // Address of token creator
    uint64 mintedAt; // Time of token creation
    string shippingCompany; // Company that processes the shipment as first
    address receivingAddress; // Public key of receiving party
    string receivingPostalAddress; // Stored as Json for easy handeling
  }

  function _mint(address _to, uint256 _tokenId) internal {
    super._mint(_to, _tokenId);

    emit handOff(address(0), _to, _tokenId, uint64(now));
  }

  /**
    * @dev Mints a token to an address with a tokenURI.
    * @param _to address of the future owner of the token
    */
  function mintTo(address _to, string shippingCompany, address receivingAddress, string receivingPostalAddress) public onlyOwner {
    Token memory token = Token({
      mintedBy: msg.sender,
      mintedAt: uint64(now),
      shippingCompany: shippingCompany,
      receivingAddress: receivingAddress,
      receivingPostalAddress: receivingPostalAddress
    });

    // Adds 1 to the total amount of parcels to be received by receiver.
    ReceivingParcelsCount[receivingAddress] = ReceivingParcelsCount[receivingAddress].add(1);
    
    // Generates new ID for the token.
    uint256 newTokenId = tokens.push(token) - 1;

    // Maps Parcel to it's receiver.
    ParcelToReceiver[newTokenId] = receivingAddress;

    emit createParcel(_to, newTokenId, shippingCompany, receivingAddress);

    _mint(_to, newTokenId);
  }

  /// @notice Returns the number of parcels owned by a specific address.
  /// @param _receiver The owner address to check.
  /// @dev Required for ERC-721 compliance
  function balanceOfReceiver(address _receiver) public view returns (uint256 count) {
      return ReceivingParcelsCount[_receiver];
  }

  function getToken(uint256 _tokenId) external view returns (address mintedBy, uint64 mintedAt, string shippingCompany, address receivingAddress, string receivingPostalAddress) {
    Token memory token = tokens[_tokenId];

    mintedBy = token.mintedBy;
    mintedAt = token.mintedAt;
    shippingCompany = token.shippingCompany;
    receivingAddress = token.receivingAddress;
    receivingPostalAddress = token.receivingPostalAddress;
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
  /// @param _receiver The owner whose parcels we are looking for.
  function parcelsOfReceiver(address _receiver) external view returns(uint256[] receiverTokens) {
    uint256 tokenCount = balanceOfReceiver(_receiver);

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
            if (ParcelToReceiver[parcelId] == _receiver) {
                result[resultIndex] = parcelId;
                resultIndex++;
            }
        }

        return result;
    }
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public canTransfer(_tokenId) {
    super.safeTransferFrom(_from, _to, _tokenId);

    if (ParcelToReceiver[_tokenId] == _to) {
      // Removes 1 from the total amount of parcels to be received by receiver.
      ReceivingParcelsCount[_to] = ReceivingParcelsCount[_to].sub(1);
    }
    // TODO: Statement toevoegen (zoals CanTransfer) die checkt of public key registered is en dus mag ontvanger
  }
  
  // TODO: Function to add shpimentCompany to list (Don't forget to use event?)
  // TODO: Function to register public key (deliverer) with company (Don't forget to hook to event) + add to list of allowed public keys
  // TODO: Transfer from moet checken of public key registered is.

}