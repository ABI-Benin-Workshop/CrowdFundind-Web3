"use client"
import React, { createContext, useState } from 'react';
import abi from '@/abi/contractAbi.json';
import { ethers } from 'ethers';
export const StateContext = createContext();

export default function StateContextProvider({ children }) {
    // 0x2ea0Bb8C8eb072302504a8d72a678de8c501f226
    const provider = new ethers.BrowserProvider(window.ethereum)
    // const signer = provider.getSigner()
    const getContract = async () => {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract('0xdF54e5161Be95D30c98bDCA6F6D029D8337EBB42', abi, signer);
        return contract;
    }

    // const contract = new ethers.Contract('0x2ea0Bb8C8eb072302504a8d72a678de8c501f226', abi, provider);

    const [address, setAddress] = useState(null);
    const ethereum = window.ethereum;
    const connect = async () => {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setAddress(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    }
    const publishCampaign = async (form) => {
        try {
            const contract = await getContract();
            const signer = await provider.getSigner();
            console.log("signer ", signer)
            await contract.createCampaign(
                // owner
                form.title, // title
                form.description, // description
                form.target,
                new Date(form.deadline).getTime(), // deadline,
                form.image,
            );

        } catch (error) {
            console.log("Error calling contract", error)
            // throw new Error('contract call failure')
        }
    }

    const getCampaigns = async () => {
      try {
        const contract = await getContract();
        const campaigns = await contract.getCampaigns();
        console.log("campaigns", campaigns);

        const parsedCampaings = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.formatEther(campaign.target.toString()),
            deadline: parseInt(campaign.deadline.toString()),
            amountCollected: ethers.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: i
        }));

        return parsedCampaings;
      } catch (error) {
        console.log("Error getting campaigns", error);
      }
    }

    const getUserCampaigns = async () => {
        try {
        console.log("Hello");
             const allCampaigns = await getCampaigns();
             console.log("allCampaigns", allCampaigns);
        // console.log("allCampaigns", allCampaigns);

        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner.toLowerCase() === address.toLowerCase());

        return filteredCampaigns;
        } catch (error) {
         console.log("Error ",error);   
        }
       
    }

    const donate = async (pId, amount) => {
        const contract = await getContract();
        const data = await contract.donateToCampaign(pId, { value: ethers.parseEther(amount) });

        return data;
    }
    const getCampaign = async (title) => {
        const data = await getCampaigns();
        const filteredCampaign = await data.filter(item => item.title.toLowerCase().replace(/ /g, "-") === title)
        return filteredCampaign[0]
    }
    const getDonations = async (pId) => {
        const contract= await getContract();
        const donations = await contract.getDonators(pId);
        const numberOfDonations = donations[0].length;

        const parsedDonations = [];

        for (let i = 0; i < numberOfDonations; i++) {
            parsedDonations.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString())
            })
        }

        return parsedDonations;
    }


    return (
        <StateContext.Provider
            value={{
                address,
                // contract,
                connect,
                createCampaign: publishCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations,
                getCampaign
            }}
        >
            {children}
        </StateContext.Provider>
    )
}
