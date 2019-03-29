pragma solidity >=0.4.25 <0.6.0;

contract DummyContract {

	event DummyEvent(address indexed from, address indexed to, uint256 value);

	function dummyFx(address to, uint value) public returns(bool sufficient) {

		emit DummyEvent(msg.sender, to, value);
		return true;
	}

}
