const Web3 = require("web3");

const OPTIONS = {
  defaultBlock: "latest",
  transactionConfirmationBlocks: 3,
  transactionBlockTimeout: 5
};

const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8545"),
  null,
  OPTIONS
);

console.log(
  web3.currentProvider.constructor.name,
  "version:",
  web3.version,
  "web3.eth.transactionConfirmationBlocks:",
  web3.eth.transactionConfirmationBlocks,
  "web3.transactionConfirmationBlocks:",
  web3.transactionConfirmationBlocks
);

sendTx()
  .then(receipt => {
    console.log("Got receipt");
  })
  .catch(error => console.log("Got error:", error));

async function sendTx() {
  const accounts = await web3.eth.personal.getAccounts();

  const tx = web3.eth
    .sendTransaction({
      to: accounts[1],
      from: accounts[0],
      value: web3.utils.toWei("0.1", "ether")
    })
    .on("transactionHash", txHash => {
      //web3.currentProvider.send("evm_mine");
      console.log("on transactionHash", txHash);
    })
    .on("receipt", receipt => {
      console.log("on receipt");
    })
    .on("confirmation", (confirmationNumber, receipt) => {
      // ganache.advanceBlock(web3); // execution of it seems to be blocked by sendTransaction in beta52
      console.log("on confirmation", confirmationNumber);
    })
    .on("error", error => {
      console.log("on error", error);
    });

  const receipt = await tx;
  return receipt;
}
