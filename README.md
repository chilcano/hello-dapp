# Building a dApp using React + TypeScript + Vite

## 1. Playing with Ethereum RPC API 

* Go to [hello-dapp/snip-postman](./snip-postman/)
* You will need an Infura and/or Alchemy Free Plan account.


## 2. Hello dApp - Development, deployment and testing

* [01-setup-env-and-simple-mono-repo.md](01-setup-env-and-simple-mono-repo.md)
* [02-add-smart-contrat-and-react.md](02-add-smart-contrat-and-react.md)
* [03-deploy-testnet-and-use-alchemy.md](03-deploy-testnet-and-use-alchemy.md)
* [04-add-backend-to-rpc.md](04-add-backend-to-rpc.md)
* [05-add-serverless.md](05-add-serverless.md)
* [06-update-backend-with-vercel.md](06-update-backend-with-vercel.md)
* [07-testing.md](07-testing.md)

### 2.1. Deploy dApp in Vercel

* You will need a Vercel Free Plan account
* Fork this project into your Github account in order to configure it.
* From Vercel Admin UI, add your forked dapp and configure it properly.
* Changes detected in your repo will be propagated in Vercel.

## 3. CI/CD automation

* Compartir wallet-keys con Vercel
  - [08-wallet-keys-to-vercel.md](08-wallet-keys-to-vercel.md)
  - [Github workflow](.github/workflow/push-wallet-keys-to-vercel.yaml)

## 4. Securing SDLC dApp

* SCA (Trivy y Trivy Operator) & DAST (ZAP y Nuclei)
  - https://github.com/chilcano/how-tos/blob/main/doc/sca/trivy_security_dependencies_checking.md
  - https://github.com/chilcano/how-tos/blob/main/doc/playing_with_trivy_operator/trivy-operator-guide-README.md 
* DAST (ZAP y Nuclei)
  - https://github.com/chilcano/how-tos/blob/main/src/hacktools/project-discovery-nuclei.md 
  - https://github.com/chilcano/how-tos/tree/main/doc/owasp-zap 

## 5. Monitoring dApp

- [Estrategia para Web3 Monitoring](10-web3-monitoring-plan.md)
- [Example 1: Monitorizar un smart contract](10-example1-contract-mon.md)
