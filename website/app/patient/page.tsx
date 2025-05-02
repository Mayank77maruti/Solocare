"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/PagesUi/Navbar";
import FileUpload from "@/components/PagesUi/FileUpload";
import { mockAppointments } from "@/lib/mockData";
import { uploadToIPFS } from "@/utils/uploader";
import { getBalance, getPrivateKey } from "@/utils/web3AuthHandler";
import {
  AuthAdapter,
  WHITE_LABEL_THEME,
  WhiteLabelData,
} from "@web3auth/auth-adapter";
import {
  CHAIN_NAMESPACES,
  getSolanaChainConfig,
  IProvider,
  UX_MODE,
  WALLET_ADAPTERS,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { Upload } from "lucide-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  addMedicalRecord,
  connection,
  createDataAccount,
  getDataAccount,
  getEncryptionKey,
  getExistingAccountData,
  PROGRAM_ID,
} from "@/utils/transactionHandler";
import { decryptData, encryptData, importKey } from "@/utils/encryption";
import { schema, solocareData } from "@/lib/contractTypes";
import * as borsh from "borsh";
import axios from "axios";

interface recordData {
  date: string;
  fileUrl: string;
}

export default function PatientDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [record, setRecord] = useState<recordData>({
    date: "",
    fileUrl: "",
  });

  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dataAccount, setDataAccount] = useState<string | null>(null);
  const [solanaBalance, setSolanaBalance] = useState<number>(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // In a real application, you would upload the file here
    console.log("Selected file:", file.name);
  };

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

  const getSolBalance = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }

    const balance = await getBalance(provider);
    console.log("balance: ", balance);
    if (!balance) return console.log("balance not found");
    setSolanaBalance(parseInt(balance)/1000000000);
  }

  const checkForDataAccount = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    const response = await axios.post("/api/user/get-data-account/", {
      email: user.email,
    });

    console.log("checkForDataAccount: ", response.data);

    if (!response.data.success) {
      console.log("Data account not found");
      setDataAccount(null);
    } else {
      console.log("Date account found");
      setDataAccount(response.data.dataAccount);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!provider) return console.log("provider not initialized yet");
      if (!web3auth) {
        return console.log("web3auth not initialized yet");
      }
      const userPrivateKey = await getPrivateKey(provider);
      if (!userPrivateKey) return console.log("userPrivateKey not found");
      console.log("userPrivateKey: ", userPrivateKey);
      const privateKeyUint8Array = hexToUint8Array(userPrivateKey);
      const userKeyPair = Keypair.fromSecretKey(privateKeyUint8Array);

      let dataAccountPublicKey: string;

      const user = await web3auth.getUserInfo();
      dataAccountPublicKey = await getDataAccount(user.email);
      console.log("dataAccountPublicKey: ", dataAccountPublicKey);

      if (!dataAccountPublicKey) {
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

      if (!selectedFile) return console.log("File not selected");
      const formData = new FormData();
      formData.append("file", selectedFile);
      console.log("formData: ", formData);

      const uploadFileResponse = await uploadToIPFS(formData);
      const uploadFileResponseJson = JSON.parse(uploadFileResponse);

      console.log("File upload response: ", uploadFileResponseJson);

      if (!uploadFileResponseJson.success) {
        return console.log(
          "Error uploading file: ",
          uploadFileResponseJson.message
        );
      }

      const fileUrl = uploadFileResponseJson.fileURL;
      if (!fileUrl || fileUrl === "") return console.log("File URL not found");

      let newData: solocareData;

      if (
        existingDataOnAccount.iv === "" ||
        existingDataOnAccount.ciphertext === ""
      ) {
        const dataToEncrypt = [];
        const recordToInsert: recordData = {
          date: record.date,
          fileUrl: fileUrl,
        };
        dataToEncrypt.push(recordToInsert);
        newData = await encryptData(dataToEncrypt, key);
      } else {
        const decryptedData = await decryptData(
          existingDataOnAccount.ciphertext,
          existingDataOnAccount.iv,
          key
        );
        console.log("decryptedData initially: ", decryptedData);
        const recordToInsert: recordData = {
          date: record.date,
          fileUrl: fileUrl,
        };
        decryptedData.push(recordToInsert);
        console.log("new data to encrypt: ", decryptedData);
        newData = await encryptData(decryptedData, key);
      }

      console.log("new encrypted data: ", newData);
      const dataBuffer = Buffer.concat([
        Buffer.from([0]),
        Buffer.from(borsh.serialize(schema, newData)),
      ]);

      const signature = await addMedicalRecord(
        userKeyPair,
        new PublicKey(dataAccountPublicKey),
        dataBuffer
      );
      console.log("Add record transaction signature: ", signature);

      setRecord({
        date: "",
        fileUrl: "",
      });
      setSelectedFile(null);
    } catch (error) {
      console.log("Error uploading record: ", error);
    }
  };

  const createDataAccountForUser = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    const userPrivateKey = await getPrivateKey(provider);
    if (!userPrivateKey) return console.log("userPrivateKey not found");
    console.log("userPrivateKey: ", userPrivateKey);
    const privateKeyUint8Array = hexToUint8Array(userPrivateKey);
    const userKeyPair = Keypair.fromSecretKey(privateKeyUint8Array);
    const dataPublicKey = await createDataAccount(userKeyPair, user.email);

    if (!dataPublicKey) {
      setDataAccount(null);
      return console.log("dataPublicKey not created");
    }

    console.log("dataPublicKey: ", dataPublicKey);
    setDataAccount(dataPublicKey);
  };

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
    checkForDataAccount();
    getSolBalance();
  }, [loggedIn, web3auth?.connected]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="patient" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Patient Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upcoming Appointments
            </h2>
            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        Appointment with Dr. {appointment.doctorId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {appointment.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Medical Reports */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload Medical Reports
            </h2>
            {
              dataAccount ? (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.jpg,.png"
                />
              ) : (
                <div className="w-full flex justify-center items-center h-full flex-col">
                  <p className="my-2 ">Create a data account on Solana to upload medical records</p>
                  <p>Solana Balance: {solanaBalance} SOL</p>
                  <div>
                    <button onClick={getSolBalance} className="mt-2 mx-2 inline-flex items-center px-3 py-2 cursor-pointer border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      Get Solana Balance
                    </button>
                    <button onClick={createDataAccountForUser} className="mt-2 mx-2 inline-flex items-center px-3 py-2 cursor-pointer border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      Create Data Account (0.7 SOL)
                    </button>
                  </div>
                </div>
              )
            }
            {selectedFile && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Selected file: {selectedFile.name}
                </p>
              </div>
            )}
            {
              dataAccount && (
                <button onClick={handleSubmit} className="w-full mt-4 flex cursor-pointer justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Submit
                </button>
              )
            }
          </div>
        </div>
      </main>
    </div>
  );
}
