var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "0af6a67a5e6c4576a2b0132877dce63c";
var mnemonic = "soon effort fire slab profit great borrow bacon stem wedding quit clean";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    
    development: {
      host: "127.0.0.1",
      port: "7545",
      network_id: "*", // match any network id

    },
    /*
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 4700000
    }
    */
   ropsten: {
    provider: function() {
    return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey)
    },
    network_id: 3,
    gas: 4698712
  }
  }
};