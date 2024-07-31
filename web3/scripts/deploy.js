const { ethers, run, network } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying CrowdFunding with the address ", deployer.address);
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();

    if (network.chainId == 11155111) {
        console.log("Wating for verifiv=cation")

        await crowdFunding.deploymentTransaction().wait(8)
        await verify(crowdFunding.address, [])
    }
}

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });