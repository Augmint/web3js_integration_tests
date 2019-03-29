pragma solidity >=0.4.25 <0.6.0;

contract DummyContract {

	event DummyEvent1(address indexed from, address indexed to, uint256 value); // for getPastEvents tests
	event DummyEvent2(address indexed from,  uint256 value);  // for contractEvents tests

	function dummyFx1(address to, uint value) public {
		emit DummyEvent1(msg.sender, to, value);
	}

	function dummyFx2(uint value) public {
		emit DummyEvent2(msg.sender, value);
	}

	function revertMe() public {
		revert();
	}

}
