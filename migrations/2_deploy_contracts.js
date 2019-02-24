var OwnerToken = artifacts.require("./OwnerToken.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, OwnerToken);
  deployer.deploy(OwnerToken).then(function() {
    return deployer.deploy(Election, OwnerToken.address);
  });
};
