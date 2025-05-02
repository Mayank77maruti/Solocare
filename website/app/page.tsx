"use client";

import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IAdapter, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK, getSolanaChainConfig } from "@web3auth/base";
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";

import RPC from "@/utils/solanaRPC";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { Button } from "@/components/ui/Button";
import axios from "axios";
import { GetProfileContext } from "@/context/UserContext";
import { getBalance, getPrivateKey } from "@/utils/web3AuthHandler";
import { Keypair } from "@solana/web3.js";
import { createDataAccount } from "@/utils/transactionHandler";

const clientId = "BA1oKhn6yjmiOTEc_aKzfjNuKcjsGba0_TSrQ18at3CCXkOSGlDD5NKv6Blz3Gv3q4Be8azAUr5vwyBcqT3Ewcc"; // get from https://dashboard.web3auth.io

function App() {
  // const { web3auth, setWeb3auth, provider, setProvider } = GetProfileContext();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dataAccount, setDataAccount] = useState<string | null>(null);

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

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
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
  }

  const checkForDataAccount = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet")
      return;
    }
    const user = await web3auth.getUserInfo();
    const response = await axios.post('/api/auth/get-data-account/', {
      email: user.email
    });

    console.log("checkForDataAccount: ", response.data);

    if (!response.data.success) {
      console.log("Data account not found");
      setDataAccount(null);
    } else {
      console.log("Date account found");
      setDataAccount(response.data.dataAccount);
    }
  }

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
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <Button variant='outline' onClick={async () => {
            const balance = await getBalance(provider);
            uiConsole(balance);
          }} className="card">
            Get Balance
          </Button>
        </div>
        {
          dataAccount &&
          <Button variant='outline' onClick={createDataAccountForUser} className="card">
            Make Data Account
          </Button>
        }
        <div>
          <Button variant='outline' onClick={logout} className="card">
            Log Out
          </Button>
        </div>
      </div>
    </>
  );

  const unloggedInView = (
    <Button variant='outline' onClick={login} className="card">
      Login
    </Button>
  );

  useEffect(() => {
    if (loggedIn && web3auth?.connected) {
      saveUserToDB();
      checkForDataAccount();
    }
  }, [loggedIn, web3auth?.connected]);

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/modal" rel="noreferrer">
          Web3Auth{" "}
        </a>
        & React Solana Example
      </h1>

      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
    </div>
  );
}

export default App;