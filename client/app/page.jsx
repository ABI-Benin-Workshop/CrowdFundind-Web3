"use client"
import Image from "next/image";
import React, { useState, useEffect,useContext } from 'react'
import  DisplayCampaigns  from '@/components/display-campaigns.jsx';
import { StateContext } from '@/context/context'
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, getCampaigns } = useContext(StateContext);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if(address) fetchCampaigns();
  }, [address, ]);
  return (
    <DisplayCampaigns 
    title="Toutes les campagnes"
    isLoading={isLoading}
    campaigns={campaigns}
  />
  );
}
