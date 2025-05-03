"use client";

import Navbar from '@/components/PagesUi/Navbar';
import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK, getSolanaChainConfig } from "@web3auth/base";
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import axios from "axios";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const clientId = "BA1oKhn6yjmiOTEc_aKzfjNuKcjsGba0_TSrQ18at3CCXkOSGlDD5NKv6Blz3Gv3q4Be8azAUr5vwyBcqT3Ewcc";

export default function Home() {
  const router = useRouter();

  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

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
                  logoDark: "url to your custom logo which will shown in dark mode",
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
                  showOnModal: false
                },
                sms_passwordless: {
                  name: "sms-passwordless login",
                  showOnModal: false
                }
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

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();

    if (web3auth.connected) {
      setLoggedIn(true);
    }
    setProvider(web3authProvider);
  };

  const logout = async () => {
      if (!web3auth) {
          console.log("web3auth not initialized yet");
          return;
      }
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
  };

  const saveUserToDB = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return;
    }
    console.log("setting user");
    const user = await web3auth.getUserInfo();
    const response = await axios.post('/api/auth/signup/', {
      email: user.email
    });

    console.log("response: ", response.data);

    if (response.data.success) {
      router.push('/patient');
    }
  }

  useEffect(() => {
    if (loggedIn && web3auth?.connected) {
      saveUserToDB();
    }
  }, [loggedIn, web3auth?.connected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to{' '}
            <span className="text-blue-600">Solocare</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your trusted partner in healthcare management. Streamline your medical journey with our comprehensive platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {
              loggedIn ? (
                <div className="rounded-md shadow">
                  <Link
                    href='/onboarding'
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="rounded-md shadow">
                  <button
                    onClick={login}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Login
                  </button>
                </div>
              )
            }
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Pre-screening</h3>
            <p className="mt-2 text-base text-gray-500">
              Complete a quick pre-screening assessment before your appointment to help doctors better understand your condition.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
            <p className="mt-2 text-base text-gray-500">
              Access and manage your medical records securely in one place. Upload reports and view your health history.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Appointment Management</h3>
            <p className="mt-2 text-base text-gray-500">
              Schedule and manage your appointments easily. Receive reminders and updates about your upcoming visits.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
