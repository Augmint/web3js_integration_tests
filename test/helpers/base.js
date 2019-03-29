const Web3 = require("web3");

const TRANSACTION_CONFIRMATION_BLOCKS = 3;
const OPTIONS = {
    transactionConfirmationBlocks: TRANSACTION_CONFIRMATION_BLOCKS
};

const providers = [
    new Web3(Web3.providers.WebsocketProvider("ws://localhost:8545"), null, OPTIONS),
    new Web3(Web3.providers.HttpProvider("http://localhost:8545"), null, OPTIONS)
];

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

    return _web3.eth.Contract(abi, address);
}
