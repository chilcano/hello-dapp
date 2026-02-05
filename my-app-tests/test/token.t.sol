// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/StdStorage.sol";

// Importa tu contrato (ajusta el path según tu repo)
import "../src/example1/token.sol";

contract TokenTest is Test {
    using stdStorage for StdStorage;

    Token token;

    address owner = address(0xA11CE);
    address alice = address(0xB0B);
    address bob   = address(0xC0C0A);

    function setUp() public {
        vm.prank(owner);
        token = new Token();
    }

    // -------------------------
    // Helpers
    // -------------------------

    /// @dev Setea balances[address] directamente en storage (porque el contrato no tiene mint)
    function _setBalance(address who, uint256 amount) internal {
        // Token.balances es un mapping public, así que tiene un slot fijo.
        // Con stdstore encontramos el slot sin calcularlo a mano.
        stdstore
            .target(address(token))
            .sig(token.balances.selector)
            .with_key(who)
            .checked_write(amount);
    }

    // -------------------------
    // Ownable / Pausable
    // -------------------------

    function test_owner_is_deployer() public {
        assertEq(token.owner(), owner);
    }

    function test_pause_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(bytes("Ownable: Caller is not the owner."));
        token.pause();

        vm.prank(owner);
        token.pause();
        assertTrue(token.paused());
    }

    function test_resume_onlyOwner() public {
        vm.prank(owner);
        token.pause();
        assertTrue(token.paused());

        vm.prank(alice);
        vm.expectRevert(bytes("Ownable: Caller is not the owner."));
        token.resume();

        vm.prank(owner);
        token.resume();
        assertFalse(token.paused());
    }

    function test_transfer_reverts_when_paused() public {
        _setBalance(alice, 10);

        vm.prank(owner);
        token.pause();

        vm.prank(alice);
        vm.expectRevert(bytes("Pausable: Contract is paused."));
        token.transfer(bob, 1);
    }

    function test_transfer_works_when_not_paused() public {
        _setBalance(alice, 10);

        vm.prank(alice);
        token.transfer(bob, 3);

        assertEq(token.balances(alice), 7);
        assertEq(token.balances(bob), 3);
    }

    // -------------------------
    // Bug crítico: underflow por unchecked
    // -------------------------

    function test_underflow_allows_mint_from_zero_balance() public {
        // Alice empieza con 0 por defecto.
        assertEq(token.balances(alice), 0);
        assertEq(token.balances(bob), 0);

        // Transfiere 1 desde balance 0 => unchecked underflow
        vm.prank(alice);
        token.transfer(bob, 1);

        // Alice termina con uint256 max (0 - 1 bajo unchecked)
        assertEq(token.balances(alice), type(uint256).max);

        // Bob recibe 1 "minted"
        assertEq(token.balances(bob), 1);
    }

    function test_underflow_allows_stealing_any_amount() public {
        // Aunque Bob tuviera 0, Alice puede "enviar" cantidades enormes
        uint256 amount = 1_000_000 ether;

        vm.prank(alice);
        token.transfer(bob, amount);

        // Alice queda con (0 - amount) mod 2^256
        // Bob recibe amount
        assertEq(token.balances(bob), amount);
        assertEq(token.balances(alice), type(uint256).max - (amount - 1));
    }
}
