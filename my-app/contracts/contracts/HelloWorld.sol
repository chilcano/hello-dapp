// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HelloWorld {
    string public message = "Hello, World!";

    event MessageUpdated(string newMessage); // 👈 event definition

    function setMessage(string calldata _newMessage) public {
        message = _newMessage;
        emit MessageUpdated(_newMessage); // 👈 emit event
    }
}