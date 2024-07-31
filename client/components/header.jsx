"use client";
import react, { useState,useContext } from "react";
import Image from "next/image";
import { logo, search } from '@/public/assets'
import { StateContext } from '@/context/context'
import Button from "./button";
import { useRouter } from 'next/navigation';
const Header = () => {
    const router = useRouter()
    const ethereum = window.ethereum
    if (!ethereum) {
        return <div>Install Metamask</div>
    }
    const { address,  connect } = useContext(StateContext);
    return (
        <div className="flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6">
            <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] bg-[#1c1c24] rounded-[100px]">
                <input type="text" placeholder="Search for campaigns" className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none" />

                <div className="w-[72px] h-full rounded-[20px] bg-[#4f46e5] flex justify-center items-center cursor-pointer">
                    <Image src={search} alt="search" className="w-[15px] h-[15px] object-contain" />
                </div>
            </div>
            <div className="sm:flex hidden flex-row justify-end gap-4">
                <Button
                    btnType="button"
                    title={address ? 'Create a campaign' : 'Connect'}
                    styles={'bg-blue-600'}
                    handleClick={() => {
                        if (address)
                            router.push('/create-campaign')
                        else connect()
                    }}
                />
            </div>
        </div>
    )
}

export default Header