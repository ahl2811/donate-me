# donate-me
- Install:
1. Install **MetaMask** extension for chrome
2. Install package: 
  `cd fe && yarn install`
  `cd be && yarn install`
* Deploy contract:
1. `cd be`
2. `yarn hardhat node`
3. `yarn deploy`
4. Copy contract address in console and update to `contractAddress` at `fe/src/constants.js`
![image](https://user-images.githubusercontent.com/49283968/188257951-05368c83-e7f5-45d7-9428-83f1a7ecb1d4.png)
![image](https://user-images.githubusercontent.com/49283968/188257988-c3c1a4a3-e56a-4dda-95a3-824e42d63fc1.png)

* Run Fe:
6. `cd fe`
7. `yarn start`
