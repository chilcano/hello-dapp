🔹 Obtener el número de bloque actual

curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://eth-sepolia.g.alchemy.com/v2/ABC123demoKey

🔹 Consultar saldo de una dirección

curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x00000000219ab540356cBB839Cbe05303d7705Fa","latest"],"id":2}' \
  https://eth-sepolia.g.alchemy.com/v2/ABC123demoKey
