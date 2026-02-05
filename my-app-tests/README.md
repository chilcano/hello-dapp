# token.sol

## 1. Interpretación del contrato

### Ownable
- Guarda `owner = msg.sender` al desplegar el contrato.
- El modificador `onlyOwner` restringe funciones administrativas al `owner`.

### Pausable
- Mantiene un estado `_paused` (bool) privado.
- `pause()` y `resume()` solo pueden ejecutarse por `owner` (hereda `onlyOwner`).
- `paused()` expone el estado actual.
- El modificador `whenNotPaused` bloquea funciones si `_paused == true`.

### Token
- Mantiene saldos en `balances[address]`.
- `transfer(to, value)`:
  - Solo se ejecuta si el contrato **no está pausado** (`whenNotPaused`).
  - Actualiza saldos con:
    - `balances[msg.sender] -= value`
    - `balances[to] += value`
  - Todo dentro de `unchecked` para ahorrar gas.

### Comportamientos y riesgos clave
- **No hay validación de balance suficiente** (`require(balances[msg.sender] >= value)` no existe).
- Al estar en `unchecked`, si `balances[msg.sender] < value` ocurre **underflow** y el resultado “da la vuelta” (mod 2^256).
- Esto permite un bug crítico: **crear tokens de la nada (mint implícito)** transfiriendo desde una cuenta con 0 balance.
- No existe `mint()` ni inicialización de balances, así que el contrato queda en un estado donde:
  - Los balances empiezan en 0,
  - Pero **cualquiera puede explotar underflow** para obtener un saldo enorme y/o acreditar saldo a terceros.

## 2. Unit Tests

### Qué cubren estos tests:

1. `onlyOwner` aplicado correctamente a pause/resume.
2. `whenNotPaused` bloquea transfer cuando está pausado.
3. `transfer` funciona en caso “normal” (si forzamos balances).
4. Se demuestra el bug crítico: underflow en `unchecked` permite mintear desde balance 0.

### test/token.t.sol

```ts
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/StdStorage.sol";

// Importa tu contrato (ajusta el path según tu repo)
import "../src/Token.sol";

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
```

### Ejecutar tests unitarios

**1. Instala foundry**

```sh
curl -L https://foundry.paradigm.xyz | bash

source ~/.bashrc

foundryup

forge --version
```

**2. Inicializar el proyecto foundry**
```sh
cd <repo>
forge init
```

**3. Asegura que el contrato y correspondiente test esten el las rutas correctas**

**4. Ejecutar los tests**
```sh
forge test

```

Los resultados son:
```sh
[⠊] Compiling...
[⠒] Compiling 26 files with Solc 0.8.33
[⠑] Installing Solc version 0.8.33
[⠢] Successfully installed Solc 0.8.33
[⠆] Solc 0.8.33 finished in 970.66ms
Compiler run successful with warnings:
Warning (2018): Function state mutability can be restricted to view
  --> test/token.t.sol:43:5:
   |
43 |     function test_owner_is_deployer() public {
   |     ^ (Relevant source part starts here and spans across multiple lines).


Ran 7 tests for test/token.t.sol:TokenTest
[PASS] test_owner_is_deployer() (gas: 10213)
[PASS] test_pause_onlyOwner() (gas: 23752)
[PASS] test_resume_onlyOwner() (gas: 21925)
[PASS] test_transfer_reverts_when_paused() (gas: 226355)
[PASS] test_transfer_works_when_not_paused() (gas: 241144)
[PASS] test_underflow_allows_mint_from_zero_balance() (gas: 67771)
[PASS] test_underflow_allows_stealing_any_amount() (gas: 64338)
Suite result: ok. 7 passed; 0 failed; 0 skipped; finished in 3.77ms (5.05ms CPU time)

Ran 2 tests for test/Counter.t.sol:CounterTest
[PASS] testFuzz_SetNumber(uint256) (runs: 256, μ: 28900, ~: 29289)
[PASS] test_Increment() (gas: 28783)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 4.71ms (3.52ms CPU time)

Ran 2 test suites in 6.74ms (8.48ms CPU time): 9 tests passed, 0 failed, 0 skipped (9 total tests)
```

Qué demuestra este setup:

1. Cómo testear lógica de negocio, no solo happy paths
2. Cómo demostrar un bug crítico con tests reproducibles
3. Por qué unchecked sin validaciones es peligroso
4. Cómo auditar contratos aunque no tengan funciones de mint

Perfecto: todo está bien. Tus tests han pasado y, de hecho, eso confirma que:

1. `pause/resume` están correctamente restringidos a owner
2. `whenNotPaused` bloquea transferencias cuando está pausado
3. y lo más importante: 
  - el bug de underflow se reproduce (los tests `underflow_*` pasando significa que el contrato permite ese comportamiento)

**5. Otros comandos**

```sh
forge test -vv
forge test -vvvv
forge test --match-test underflow
```

