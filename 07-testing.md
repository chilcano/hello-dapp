# 05. Testing

## Steps

__Step 1. Define the scope__


```sh
## Backend
$ pnpm start

> backend@1.0.0 start /home/chilcano/repos/me/how-tos/doc/dapp-security-testing/my-app/apps/backend
> ts-node index.ts

Backend API listening on port 3001

## Frontend
$ pnpm dev

> my-app@0.0.0 dev /home/chilcano/repos/me/how-tos/doc/dapp-security-testing/my-app/apps/frontend
> vite


  VITE v7.0.3  ready in 91 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

__Step 2. Gather info__

```sh
curl 'https://eth-sepolia.g.alchemy.com/v2/FsKQ_GvAVwCXQyQV-MS7OR6L9Kt0lpG1' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'content-type: application/json' \
  -H 'origin: http://localhost:5173' \
  -H 'priority: u=1, i' \
  -H 'referer: http://localhost:5173/' \
  -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
  --data-raw '[{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"},{"method":"eth_getBalance","params":["0xf9d8c1696ccd76715d11ff755561ae1b1b11fa3c","latest"],"id":2,"jsonrpc":"2.0"}]'
```


```sh
curl 'https://eth-sepolia.g.alchemy.com/v2/FsKQ_GvAVwCXQyQV-MS7OR6L9Kt0lpG1' \
  -H 'content-type: application/json' \
  --data-raw '[{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"},{"method":"eth_getBalance","params":["0xf9d8c1696ccd76715d11ff755561ae1b1b11fa3c","latest"],"id":2,"jsonrpc":"2.0"}]' -s | jq .
```



```sh
curl 'http://localhost:3001/api/getLastBlock' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Connection: keep-alive' \
  -H 'If-None-Match: W/"17-+bU4JeXyjpBe+R2Xy5UN15FDWss"' \
  -H 'Origin: http://localhost:5173' \
  -H 'Referer: http://localhost:5173/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"'
```



#### From same computer host
```sh
curl 'http://localhost:3001/api/getLastBlock' -s | jq .
```