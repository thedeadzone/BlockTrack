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


  mapping (uint256 => address) internal ParcelReceivers;

  /**** Events ****/

  event createParcel(address owner, uint256 tokenId, string shippingCompany, address receivingAddress); // AKA Mint
  event handOff(address owner, address receiver, uint256 tokenId); //, uint64 location
  event registerDeliverer(address deliverer, string name, string company);

  struct Token {
    address mintedBy; // Address of token creator
    uint64 mintedAt; // Time of token creation
    uint256 shippingCompany; // Company that processes the shipment as first
    address receivingAddress; // Public key of receiving party
    uint256 receivingPostalAddress; // Stored as Json for easy handeling
  }

  function _mint(address _to, uint256 _tokenId) internal {
    super._mint(_to, _tokenId);

    emit handOff(address(0), _to, _tokenId);
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

    uint256 newTokenId = tokens.push(token) - 1;

    emit createParcel(_to, newTokenId, shippingCompany, receivingAddress);

    // uint256 newTokenId = _getNextTokenId(); // -> Indien bovenstaande tokenId niet werkt dan weer via functie hieronder
    _mint(_to, newTokenId);
    // _setTokenURI(newTokenId, _tokenURI);
  }

  /**
    * @dev calculates the next token ID based on totalSupply
    * @return uint256 for the next token ID
    */
    // function _getNextTokenId() private view returns (uint256) {
    //     return totalSupply().add(1); 
    // }

  function getToken(uint256 _tokenId) external view returns (address mintedBy, uint64 mintedAt, string shippingCompany, address receivingAddress, string receivingPostalAddress) {
    Token memory token = tokens[_tokenId];

    mintedBy = token.mintedBy;
    mintedAt = token.mintedAt;
    shippingCompany = token.shippingCompany;
    receivingAddress = token.receivingAddress;
    receivingPostalAddress = token.receivingPostalAddress;
  }

  
  // TODO: Function to add shpimentCompany to list (Don't forget to use event?)
  // TODO: Function to register public key with company (Don't forget to hook to event)
  // TODO: Transfer from moet checken of public key registered is.
  // TODO: Function that checks if you have parcels that you should receive.

}