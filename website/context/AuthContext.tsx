// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK, getSolanaChainConfig, UserInfo } from "@web3auth/base";
// AuthAdapter might not be needed if simplifying UI config
// import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import axios from "axios"; // Keep axios for API calls
import { useRouter } from 'next/navigation';
import { SessionData } from '@/lib/session'; // Import SessionData type

// data key 

import { getBalance, getPrivateKey } from "@/utils/web3AuthHandler";
import { Keypair } from "@solana/web3.js";
import { createDataAccount } from "@/utils/transactionHandler";


const clientId = "BA1oKhn6yjmiOTEc_aKzfjNuKcjsGba0_TSrQ18at3CCXkOSGlDD5NKv6Blz3Gv3q4Be8azAUr5vwyBcqT3Ewcc"; // Use your actual Client ID

interface AuthContextType {
  web3auth: Web3Auth | null;
  provider: IProvider | null; // Web3Auth provider, might be null even if logged in via session
  loggedIn: boolean; // Derived from server session primarily
  user: SessionData | null; // Use SessionData type for user state
  isLoading: boolean; // Loading state for session check & web3auth init
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter(); // Initialize useRouter
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false); // Default to false
  const [user, setUser] = useState<SessionData | null>(null); // Use SessionData type
  const [isLoading, setIsLoading] = useState(true); // Start loading until session is checked
  const [dataAccount, setDataAccount] = useState<string | null>(null);
  const chainConfig = getSolanaChainConfig(0x3)!; // Devnet

  // Effect to initialize Web3Auth instance (runs once)
  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const solanaPrivateKeyProvider = new SolanaPrivateKeyProvider({
          config: { chainConfig: chainConfig },
        });

        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: "0x3", // Devnet
            rpcTarget: "https://api.devnet.solana.com",
            displayName: "Solana Devnet",
            blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
            ticker: "SOL",
            tickerName: "Solana",
          },
          privateKeyProvider: solanaPrivateKeyProvider,
          uiConfig: {
             appName: "Solocare",
             mode: "dark",
             theme: { primary: "#00D1B2" },
          }
        });

        await web3authInstance.initModal({
           modalConfig: {
             [WALLET_ADAPTERS.AUTH]: { // Revert back to AUTH as per original code and type definition
               label: "auth", // Keep label as 'auth' or change if needed
               loginMethods: {
                 google: { name: "google login", showOnModal: true },
                 // Disable others if only Google is needed
                 facebook: { name: "facebook login", showOnModal: false },
                 reddit: { name: "reddit login", showOnModal: false },
                 twitch: { name: "twitch login", showOnModal: false },
                 discord: { name: "discord login", showOnModal: false },
                 line: { name: "line login", showOnModal: false },
                 linkedin: { name: "linkedin login", showOnModal: false },
                 twitter: { name: "twitter login", showOnModal: false },
                 github: { name: "github login", showOnModal: false },
                 apple: { name: "apple login", showOnModal: false },
                 x: { name: "x login", showOnModal: false },
                 wechat: { name: "wechat login", showOnModal: false },
                 weibo: { name: "weibo login", showOnModal: false },
                 kakao: { name: "kakao login", showOnModal: false },
                 farcaster: { name: "farcaster login", showOnModal: false },
                 email_passwordless: { name: "email_passwordless login", showOnModal: false },
                 sms_passwordless: { name: "sms-passwordless login", showOnModal: false }
               },
               showOnModal: true,
             },
           },
        });

        setWeb3auth(web3authInstance);
        // We don't set loggedIn/user here based on web3auth.connected anymore
        // We rely on the session check below.
        // We also don't set the provider here initially. It's set after successful login.

      } catch (error) {
        console.error("Web3Auth Init Error:", error);
        // Handle init error - maybe set a specific error state?
      }
      // Note: isLoading is controlled by the session check effect below
    };

    initWeb3Auth();
  }, []); // Empty dependency array ensures this runs only once

  // Effect to check server session on load (runs once)
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<SessionData>('/api/auth/user');
        const sessionData = response.data;
        if (sessionData?.isLoggedIn) {
          setLoggedIn(true);
          setUser(sessionData);
          console.log("Existing session found:", sessionData);
          // If web3auth is already initialized and connected from a previous session
          // within the same browser tab lifecycle, we might want to sync the provider.
          // This is less common as usually a page reload triggers this check.
          // if (web3auth?.connected) {
          //   setProvider(web3auth.provider);
          // }
        } else {
          setLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setLoggedIn(false); // Assume not logged in on error
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []); // Empty dependency array ensures this runs only once

  const hexToUint8Array = (hexString: string): Uint8Array => {
    if (hexString.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }
    const arrayBuffer = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        const byteValue = parseInt(hexString.substr(i, 2), 16);
        arrayBuffer[i / 2] = byteValue;
    }
    return arrayBuffer;
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const createDataAccountForUser = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return;
    }
    const user = await web3auth.getUserInfo();
    const userPrivateKey = await getPrivateKey(provider);
    if (!userPrivateKey) return console.log("userPrivateKey not found");
    console.log("userPrivateKey: ", userPrivateKey);
    const privateKeyUint8Array = hexToUint8Array(userPrivateKey);
    const userKeyPair = Keypair.fromSecretKey(privateKeyUint8Array);
    const dataPublicKey = await createDataAccount(userKeyPair, user.email);

    console.log("dataPublicKey: ", dataPublicKey);

    try {
      // Save data account
      const saveDataAccountResponse = await axios.post('/api/user/save-data-account', {
        email: user.email,
        dataAccount: dataPublicKey, // Assuming dataPublicKey is a PublicKey object
      });

      if (saveDataAccountResponse.data.success) {
        console.log("Data account saved successfully");
      } else {
        console.error("Failed to save data account:", saveDataAccountResponse.data.error);
      }

      // Save encryption key (Assuming you have a function to get the encryption key)
      const encryptionKey = userPrivateKey; // Or however you derive/get the encryption key
      const saveEncryptionKeyResponse = await axios.post('/api/user/save-encryption-key', {
        email: user.email,
        encryptionKey: encryptionKey,
      });

      if (saveEncryptionKeyResponse.data.success) {
        console.log("Encryption key saved successfully");
      } else {
        console.error("Failed to save encryption key:", saveEncryptionKeyResponse.data.error);
      }

    } catch (error) {
      console.error("Error saving data account or encryption key:", error);
    }
  }

  const checkForDataAccount = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return;
    }
    const user = await web3auth.getUserInfo();
    const response = await axios.post('/api/user/get-data-account/', {
      email: user.email
    });
    console.log("api complete");
    console.log("checkForDataAccount: ",response);

    if (!response.data.success) {
      console.log("Data account not found");
      setDataAccount(null);
    } else {
      console.log("Date account found");
      setDataAccount(response.data.dataAccount);
    }
  }


  // Login function updated to create server session
  const login = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      // Connect to Web3Auth
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider); // Set provider after successful connection

      if (web3auth.connected && web3authProvider) {
        // Get user info from Web3Auth
        const web3userInfo = await web3auth.getUserInfo();
        console.log(web3userInfo);

        // Prepare data for server session
        const sessionPayload: Partial<SessionData> = {
          email: web3userInfo.email,
          name: web3userInfo.name,
          profileImage: web3userInfo.profileImage,
          idToken: web3userInfo.idToken, // Include the idToken
          // Add other relevant fields from web3userInfo if needed in SessionData
        };

        // Call the login API endpoint to create the server session
        const response = await axios.post<SessionData>('/api/auth/login', sessionPayload);
        const createdSession = response.data;

        if (createdSession?.isLoggedIn) {
          // Update context state based on the session created by the server
          setLoggedIn(true);
          setUser(createdSession);
          console.log("Server session created successfully:", createdSession);
          // Optional: Redirect after successful login and session creation
          // router.push('/patient');
        } else {
          throw new Error("Server session creation failed.");
        }
      } else {
         throw new Error("Web3Auth connection failed or provider not available.");
      }
      // **Data Account Check and Creation Logic**
      // await checkForDataAccount();
      // if (!dataAccount) {
      //   console.log("Creating data account...");
      //   await createDataAccountForUser();
      //   await checkForDataAccount(); // Refetch to ensure it exists
      // }
      // **End Data Account Check and Creation Logic**
    } catch (error) {
      console.error("Login Process Error:", error);
      // Reset state on error
      setProvider(null);
      setLoggedIn(false);
      setUser(null);
      // Optionally call web3auth.logout() here if connection was partially successful
      if (web3auth?.connected) {
          await web3auth.logout().catch(err => console.error("Web3Auth logout error during login cleanup:", err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function updated to destroy server session
  const logout = async () => {
    setIsLoading(true);
    try {
      // Call the logout API endpoint first to destroy the server session
      await axios.post('/api/auth/logout');
      console.log("Server session destroyed.");

      // Then, logout from Web3Auth if the instance exists
      if (web3auth) {
        await web3auth.logout();
        console.log("Web3Auth logged out.");
      }
    } catch (error) {
      console.error("Logout Process Error:", error);
      // Still attempt to clear client state even if API/Web3Auth logout fails
    } finally {
      // Clear client-side state regardless of errors
      setProvider(null);
      setLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      // Redirect to home page after logout
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ web3auth, provider, loggedIn, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};