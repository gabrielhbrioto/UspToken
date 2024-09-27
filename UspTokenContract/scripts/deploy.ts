import { ethers } from "hardhat";

async function main() {

  const USPToken = await ethers.getContractFactory("USPToken");
  const usptoken = await USPToken.deploy();
 
  await usptoken.waitForDeployment();
  const address = await usptoken.getAddress();
  console.log(`Contract deployed to ${address}`);
 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
