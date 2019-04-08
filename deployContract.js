const Web3 = require("web3");

const web3 = new Web3(
  Web3.providers.WebsocketProvider("ws://localhost:32768"),
  null,
  {
    defaultBlock: "latest",
    defaultGas: 5000000,
    defaultGasPrice: 1,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 480
  }
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

  // Defining New Contract
  let myContract = new web3.eth.Contract(abi);

  // Deploying contract using Web3
  const receipt = await myContract
    .deploy({
      data: bytecode,
      arguments: []
    })
    .send({
      from: accounts[0]
    })
    .on("receipt", receipt => {
      console.log(receipt);
    });

  return receipt;
}

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        name: "value",
        type: "uint256"
      }
    ],
    name: "DummyEvent1",
    type: "event",
    signature:
      "0x06b4eddee5a8666a5c5defb4ccc27abe1b2c1f10ae3616ac6c6f80e6abc15395"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address"
      },
      {
        indexed: false,
        name: "value",
        type: "uint256"
      }
    ],
    name: "DummyEvent2",
    type: "event",
    signature:
      "0xd59447e897a6e372f35a0abff84af902cb63bb343d956ef3eb9c952e86d67c70"
  },
  {
    constant: false,
    inputs: [
      {
        name: "to",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      }
    ],
    name: "dummyFx1",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x0e47cb15"
  },
  {
    constant: false,
    inputs: [
      {
        name: "value",
        type: "uint256"
      }
    ],
    name: "dummyFx2",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xb7e44f9c"
  },
  {
    constant: false,
    inputs: [],
    name: "revertMe",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x2ef4d922"
  }
];
const bytecode =
  "0x608060405234801561001057600080fd5b506101f4806100206000396000f3fe608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630e47cb151461005c5780632ef4d922146100b7578063b7e44f9c146100ce575b600080fd5b34801561006857600080fd5b506100b56004803603604081101561007f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610109565b005b3480156100c357600080fd5b506100cc610172565b005b3480156100da57600080fd5b50610107600480360360208110156100f157600080fd5b8101908080359060200190929190505050610177565b005b8173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f06b4eddee5a8666a5c5defb4ccc27abe1b2c1f10ae3616ac6c6f80e6abc15395836040518082815260200191505060405180910390a35050565b600080fd5b3373ffffffffffffffffffffffffffffffffffffffff167fd59447e897a6e372f35a0abff84af902cb63bb343d956ef3eb9c952e86d67c70826040518082815260200191505060405180910390a25056fea165627a7a72305820b079d7746c2d6f8a5d8de28e5e8c145e49c98747a3be5891f495eb22a21c85ec0029";
