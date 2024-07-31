"use client"
import React, { useState, useEffect,useContext } from 'react'

import DisplayCampaigns from '@/components/display-campaigns.jsx';
import { StateContext } from '@/context/context'
import Button from '@/components/button.jsx';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address,  getUserCampaigns } = useContext(StateContext);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getUserCampaigns();
    console.log("User campgaigns", data);
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    console.log("address", address);
    if(address) fetchCampaigns();
  }, [address]);

  return (
    <>
    <DisplayCampaigns 
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
    </>
  )
}

export default Profile