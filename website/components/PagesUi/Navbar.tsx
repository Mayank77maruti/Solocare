'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK, getSolanaChainConfig } from "@web3auth/base";
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { useRouter } from 'next/navigation';

interface NavbarProps {
  role?: 'patient' | 'doctor' | 'admin';
}

const clientId = "BA1oKhn6yjmiOTEc_aKzfjNuKcjsGba0_TSrQ18at3CCXkOSGlDD5NKv6Blz3Gv3q4Be8azAUr5vwyBcqT3Ewcc";

export default function Navbar({ role }: NavbarProps) {
  const router = useRouter();

  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

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

  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!role) {
    // Landing page mode
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-xl font-bold text-blue-600">SoloCare</a>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Login</button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/doctors', label: 'Doctors' },
    { href: '/admin/patients', label: 'Patients' },
  ];

  const doctorLinks = [
    { href: '/doctor', label: 'Dashboard' },
  ];

  const patientLinks = [
    { href: '/patient', label: 'Dashboard' },
    { href: '/patient/reports', label: 'Reports' },
    { href: '/patient/chat', label: 'Chat' },
  ];

  const links = role === 'admin' 
    ? adminLinks 
    : role === 'doctor' 
    ? doctorLinks 
    : patientLinks;

  const logout = async () => {
    if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    router.push('/patient');
  };

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

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${role}`} className="text-xl font-bold text-blue-600">
                SoloCare
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    isActive(link.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 