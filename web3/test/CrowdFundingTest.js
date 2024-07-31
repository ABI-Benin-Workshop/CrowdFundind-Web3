const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CrowdFunding", function () {


    async function deployCrowdFundingFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        const crowdFunding = await CrowdFunding.deploy();
        const target = ethers.parseUnits("5", "ether")
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        const deadLine = (await time.latest()) + ONE_YEAR_IN_SECS;
        await crowdFunding.createCampaign("Title", "Description", target, deadLine, "Image");
        return {
            crowdFunding,
            owner,
            otherAccount
        }
    }

    describe("Deployment", () => {

        it("Should create a campain and set the right values", async function () {
            const { owner, otherAccount, crowdFunding } = await loadFixture(deployCrowdFundingFixture);
            const campainNumberBefore = parseInt(await crowdFunding.numberOfCampaigns());

            console.log("This is the campaign number before: ", campainNumberBefore.toString());
            const target = ethers.parseUnits("5", "ether")
            const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;

            const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
            const createCampaignTx = await crowdFunding.createCampaign("Title", "Description", target, unlockTime, "Image");
            await createCampaignTx.wait();
            const newCampaignNumber = parseInt(await crowdFunding.numberOfCampaigns());
            console.log("This is the campaign number after creating a campaign: ", newCampaignNumber.toString());
            expect(newCampaignNumber).to.equal(campainNumberBefore + 1);
        });

        it("Should donate to Campaign", async () => {
            const { owner, otherAccount, crowdFunding } = await loadFixture(deployCrowdFundingFixture);
            const amountDonated = ethers.parseUnits("5", "ether")
            const campaignDonation = await crowdFunding.donateToCampaign(0, { value: amountDonated })
            await campaignDonation.wait()
            const campaignAfterDOnation = await crowdFunding.getCampaign(0)
            const amountCollectedAfter = campaignAfterDOnation[5]

            expect(amountCollectedAfter.toString()).to.equal(amountDonated.toString())

        })

        it('Should fail if the account is not the owner of the campaign', async () => {

            const { owner, otherAccount, crowdFunding } = await loadFixture(deployCrowdFundingFixture);
            await expect( crowdFunding.connect(otherAccount).withdrawDeveloperFunds()).to.be.revertedWith(
                "Only the developer can perform this action"
            );
        }
        )
    })
})