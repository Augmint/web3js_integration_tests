module.exports = {
    takeSnapshot,
    revertSnapshot,
    advanceBlock
};

async function takeSnapshot(web3) {
    return await web3.currentProvider.send("evm_snapshot");
}

async function revertSnapshot(web3, snapshotId) {
    await web3.currentProvider.send("evm_revert", [snapshotId]);
}

async function advanceBlock(web3) {
    await web3.currentProvider.send("evm_mine");
}
