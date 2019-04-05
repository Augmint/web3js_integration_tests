const Web3 = require("web3");

const TRANSACTION_CONFIRMATION_BLOCKS = 3;

const WEBSOCKET_OPTIONS = {
    defaultBlock: "latest",

    transactionConfirmationBlocks: TRANSACTION_CONFIRMATION_BLOCKS,
    transactionBlockTimeout: 5
};

const HTTP_OPTIONS = {
    defaultBlock: "latest",

    transactionPollingTimeout: 480
};

const providers = [
    new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"), null, WEBSOCKET_OPTIONS),
    new Web3(new Web3.providers.HttpProvider("http://localhost:8545"), null, HTTP_OPTIONS)
];

providers.forEach(web3 => console.log(web3.currentProvider.constructor.name, "version: ", web3.version));

module.exports = {
    get TRANSACTION_CONFIRMATION_BLOCKS() {
        return TRANSACTION_CONFIRMATION_BLOCKS;
    },
    get providers() {
        return providers;
    },
    getWeb3ContractInstance
};

async function getWeb3ContractInstance(_web3, truffleArtifactPath) {
    const contractArtifact = require(truffleArtifactPath);
    const abi = contractArtifact.abi;
    const networkId = await _web3.eth.net.getId();
    const address = contractArtifact.networks[networkId].address;

    return new _web3.eth.Contract(abi, address);
}
