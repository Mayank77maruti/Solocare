'use client';

import Navbar from '@/components/PagesUi/Navbar';
import ReportCard from '@/components/PagesUi/ReportCard';
import { useAuth } from '@/context/AuthContext';
import { solocareData } from '@/lib/contractTypes';
import { mockReports } from '@/lib/mockData';
import { decryptData, importKey } from '@/utils/encryption';
import { getDataAccount, getEncryptionKey, getExistingAccountData } from '@/utils/transactionHandler';
import { getPrivateKey } from '@/utils/web3AuthHandler';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from '@web3auth/auth-adapter';
import { CHAIN_NAMESPACES, getSolanaChainConfig, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';
import { useEffect, useState } from 'react';

interface recordData {
  date: string;
  fileUrl: string;
}

export default function PatientReports() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [allReports, setAllReports] = useState<recordData[]>([]);
  const [lodading, setLoading] = useState<boolean>(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const hexToUint8Array = (hexString: string): Uint8Array => {
    if (hexString.length % 2 !== 0) {
      throw new Error("Invalid hex string");
    }
    const arrayBuffer = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      const byteValue = parseInt(hexString.substr(i, 2), 16);
      arrayBuffer[i / 2] = byteValue;
    }
    return arrayBuffer;
  };

  const getReportsFromSmartContract = async () => {
    setLoading(true);
    try {
      if (!provider) {
        setLoading(false);
        return console.log("provider not initialized yet");
      }
      if (!web3auth) {
        setLoading(false);
        return console.log("web3auth not initialized yet");
      }
      const userPrivateKey = await getPrivateKey(provider);
      if (!userPrivateKey) {
        setLoading(false);
        return console.log("userPrivateKey not found");
      }
      console.log("userPrivateKey: ", userPrivateKey);
      const privateKeyUint8Array = hexToUint8Array(userPrivateKey);
      const userKeyPair = Keypair.fromSecretKey(privateKeyUint8Array);

      let dataAccountPublicKey: string;

      const user = await web3auth.getUserInfo();
      dataAccountPublicKey = await getDataAccount(user.email);
      console.log("dataAccountPublicKey: ", dataAccountPublicKey);

      if (!dataAccountPublicKey) {
        setLoading(false);
        return console.log("dataAccountPublicKey not found");
      }

      console.log("dataAccountPublicKey: ", dataAccountPublicKey);

      // Getting encrypted data from the account
      const existingDataOnAccount = (await getExistingAccountData(
        new PublicKey(dataAccountPublicKey)
      )) as solocareData;
      console.log("existingDataOnAccount: ", existingDataOnAccount);

      // Decrypting the data
      const encryptionKey = await getEncryptionKey(user.email);
      console.log(encryptionKey);

      console.log("before importing key");
      const key = await importKey(encryptionKey);
      console.log("after importing key");

      if (existingDataOnAccount.iv === "" || existingDataOnAccount.ciphertext === "") {
        setAllReports([]);
      } else {
        const decryptedData = await decryptData(
          existingDataOnAccount.ciphertext,
          existingDataOnAccount.iv,
          key
        );
        console.log("decryptedData: ", decryptedData);
        setAllReports(decryptedData);
      }
    } catch (error) {
      setLoading(false);
      console.log("error getting reports from smart contract: ", error);
    } finally {
      setLoading(false);
    }
  }

  const clientId = "BA1oKhn6yjmiOTEc_aKzfjNuKcjsGba0_TSrQ18at3CCXkOSGlDD5NKv6Blz3Gv3q4Be8azAUr5vwyBcqT3Ewcc";
  const chainConfig = getSolanaChainConfig(0x3)!;

  useEffect(() => {
    const init = async () => {
      try {
        const solanaPrivateKeyPrvoider = new SolanaPrivateKeyProvider({
          config: { chainConfig: chainConfig },
        });

        const web3auth = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: "0x3", // Use "0x1" for mainnet
            rpcTarget: "https://api.devnet.solana.com",
            displayName: "Solana Devnet",
            blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
            ticker: "SOL",
            tickerName: "Solana",
          },
          privateKeyProvider: solanaPrivateKeyPrvoider,
        });

        // Setup external adapters
        const authAdapter = new AuthAdapter({
          adapterSettings: {
            clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
            network: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET, // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
            uxMode: UX_MODE.REDIRECT,
            whiteLabel: {
              appName: "W3A Heroes",
              appUrl: "https://web3auth.io",
              logoLight: "https://web3auth.io/images/web3auth-logo.svg",
              logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
              defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl, tr
              mode: "dark", // whether to enable dark mode. defaultValue: auto
              theme: {
                primary: "#00D1B2",
              } as WHITE_LABEL_THEME,
              useLogoLoader: true,
            } as WhiteLabelData,
          },
          privateKeyProvider: solanaPrivateKeyPrvoider,
        });
        web3auth.configureAdapter(authAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.AUTH]: {
              label: "auth",
              loginMethods: {
                google: {
                  name: "google login",
                  logoDark:
                    "url to your custom logo which will shown in dark mode",
                },
                facebook: {
                  // it will hide the facebook option from the Web3Auth modal.
                  name: "facebook login",
                  showOnModal: false,
                },
                reddit: {
                  name: "reddit login",
                  showOnModal: false,
                },
                twitch: {
                  name: "twitch login",
                  showOnModal: false,
                },
                discord: {
                  name: "discord login",
                  showOnModal: false,
                },
                line: {
                  name: "line login",
                  showOnModal: false,
                },
                linkedin: {
                  name: "linkedin login",
                  showOnModal: false,
                },
                twitter: {
                  name: "twitter login",
                  showOnModal: false,
                },
                github: {
                  name: "github login",
                  showOnModal: false,
                },
                apple: {
                  name: "apple login",
                  showOnModal: false,
                },
                x: {
                  name: "x login",
                  showOnModal: false,
                },
                wechat: {
                  name: "wechat login",
                  showOnModal: false,
                },
                weibo: {
                  name: "weibo login",
                  showOnModal: false,
                },
                kakao: {
                  name: "kakao login",
                  showOnModal: false,
                },
                farcaster: {
                  name: "farcaster login",
                  showOnModal: false,
                },
                email_passwordless: {
                  name: "email_passwordless login",
                  showOnModal: false,
                },
                sms_passwordless: {
                  name: "sms-passwordless login",
                  showOnModal: false,
                },
              },
              // setting it to false will hide all social login methods from modal.
              showOnModal: true,
            },
          },
        });
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    getReportsFromSmartContract();
  }, [loggedIn, web3auth?.connected]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="patient" />

      {
        lodading && (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth={4}
                stroke="currentColor"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4.93 4.93a10 10 0 0114.14 14.14l1.41 1.41a12 12 0 00-16.97-16.97l1.42 1.42z"
              />
            </svg>
          </div>
        )
      }

      {
        !lodading && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
              <button onClick={getReportsFromSmartContract} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Request New Report
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {!lodading && allReports.map((report, index) => (
                <ReportCard
                  key={index}
                  report={report}
                />
              ))}
            </div>

            {!lodading && mockReports.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't received any medical reports yet.
                </p>
              </div>
            )}
          </main>
        )
      }
    </div>
  );
} 