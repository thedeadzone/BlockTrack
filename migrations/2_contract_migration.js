var MyNonFungibleToken = artifacts.require("MyNonFungibleToken");

module.exports = function(deployer) {
    // deployment steps
    deployer.deploy(MyNonFungibleToken);
};