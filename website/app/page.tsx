"use client";

import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IAdapter, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK, getSolanaChainConfig } from "@web3auth/base";
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";

import RPC from "@/utils/solanaRPC";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { Button } from "@/components/ui/Button";
import axios from "axios";

const clientId = "BA1oKhn6yjmiOTEc_aKzfjNuKcjsGba0_TSrQ18at3CCXkOSGlDD5NKv6Blz3Gv3q4Be8azAUr5vwyBcqT3Ewcc"; // get from https://dashboard.web3auth.io

function App() {
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
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();

    if (web3auth.connected) {
      setLoggedIn(true);
    }
    setProvider(web3authProvider);
  };

  const addChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    // Get custom chain configs for your chain from https://web3auth.io/docs/connect-blockchain
    const chainConfig = getSolanaChainConfig(0x3)!;

    await web3auth?.addChain(chainConfig);
    uiConsole("New Chain Added");
  };

  const switchChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    await web3auth?.switchChain({ chainId: "0x3" });
    uiConsole("Chain Switched");
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const sendVersionTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendVersionTransaction();
    uiConsole(receipt);
  };

  const signVersionedTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.signVersionedTransaction();
    uiConsole(receipt);
  };

  const signAllVersionedTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.signAllVersionedTransaction();
    uiConsole(receipt);
  };

  const signAllTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.signAllTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <Button variant='outline' onClick={getUserInfo} className="card">
            Get User Info
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={authenticateUser} className="card">
            Get ID Token
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={addChain} className="card">
            Add Chain
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={switchChain} className="card">
            Switch Chain
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={getAccounts} className="card">
            Get Account
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={getBalance} className="card">
            Get Balance
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={sendTransaction} className="card">
            Send Transaction
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={sendVersionTransaction} className="card">
            Send Version Transaction
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={signVersionedTransaction} className="card">
            Sign Versioned Transaction
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={signAllVersionedTransaction} className="card">
            Sign All Versioned Transaction
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={signAllTransaction} className="card">
            Sign All Transaction
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={signMessage} className="card">
            Sign Message
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={getPrivateKey} className="card">
            Get Private Key
          </Button>
        </div>
        <div>
          <Button variant='outline' onClick={logout} className="card">
            Log Out
          </Button>
        </div>
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const unloggedInView = (
    <Button variant='outline' onClick={login} className="card">
      Login
    </Button>
  );

  const saveUserToDB = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
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
  useEffect(() => {
    if (loggedIn) {
      saveUserToDB();
    }
  }, [loggedIn]);

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