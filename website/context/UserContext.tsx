"use client";

import { IProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { Dispatch, ReactNode, SetStateAction, useContext, useState, createContext } from "react";


interface ProfileContextType {
    provider: IProvider | null;
    setProvider: Dispatch<SetStateAction<IProvider | null>>;
    web3auth: Web3Auth | null;
    setWeb3auth: Dispatch<SetStateAction<Web3Auth | null>>;
}

const ProfileContext = createContext<ProfileContextType>({
    provider: null,
    setProvider: () => {},
    web3auth: null,
    setWeb3auth: () => {}
});

export const GetProfileContext = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({children}: {children: ReactNode}) => {
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [provider, setProvider] = useState<IProvider | null>(null);

    return (
        <ProfileContext.Provider value={{ provider, setProvider, web3auth, setWeb3auth }}>
            {children}
        </ProfileContext.Provider>
    );
};