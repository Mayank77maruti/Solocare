"use client";

import { Button } from '@/components/ui/Button';
import { uploadToIPFS } from '@/utils/uploader';
import { getPrivateKey } from '@/utils/web3AuthHandler';
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from '@web3auth/auth-adapter';
import { CHAIN_NAMESPACES, getSolanaChainConfig, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';
import { Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import bs58 from 'bs58';
import { Keypair, PublicKey } from '@solana/web3.js';
import { addMedicalRecord, connection, createDataAccount, getDataAccount, getEncryptionKey, getExistingAccountData, PROGRAM_ID } from '@/utils/transactionHandler';
import { decryptData, encryptData, importKey } from '@/utils/encryption';
import { schema, solocareData } from '@/lib/contractTypes';
import * as borsh from 'borsh';

const { decode } = bs58;

interface recordData {
    fullName: string;
    doctorName: string;
    recordTitle: string;
    date: string;
    imageUrl: string;
}

function page() {
    // const { provider } = GetProfileContext();
    const [record, setRecord] = useState<recordData>({
        fullName: '',
        doctorName: '',
        recordTitle: '',
        date: '',
        imageUrl: ''
    });

    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [provider, setProvider] = useState<IProvider | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [file, setFile] = React.useState<File | null>(null);
    const [fileName, setFileName] = React.useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            setFileName(file.name);
        }
    }

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

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
            const existingDataOnAccount = await getExistingAccountData(new PublicKey(dataAccountPublicKey)) as solocareData;
            console.log("existingDataOnAccount: ", existingDataOnAccount);

            // Decrypting the data
            const encryptionKey = await getEncryptionKey(user.email);
            console.log(encryptionKey);

            console.log("before importing key");
            const key = await importKey(encryptionKey);
            console.log("after importing key");

            if (!file) return console.log("File not selected");
            const formData = new FormData();
            formData.append('file', file);
            console.log("formData: ", formData);

            const uploadFileResponse = await uploadToIPFS(formData);
            const uploadFileResponseJson = JSON.parse(uploadFileResponse);

            console.log("File upload response: ", uploadFileResponseJson);

            if (!uploadFileResponseJson.success) {
                return console.log("Error uploading file: ", uploadFileResponseJson.message);
            }

            const fileUrl = uploadFileResponseJson.fileURL;
            if (!fileUrl || fileUrl === '') return console.log("File URL not found");

            let newData: solocareData;

            if (existingDataOnAccount.iv === '' || existingDataOnAccount.ciphertext === '') {
                const dataToEncrypt = []
                const recordToInsert: recordData = {
                    fullName: record.fullName,
                    doctorName: record.doctorName,
                    recordTitle: record.recordTitle,
                    date: record.date,
                    imageUrl: fileUrl
                }
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
                    fullName: record.fullName,
                    doctorName: record.doctorName,
                    recordTitle: record.recordTitle,
                    date: record.date,
                    imageUrl: fileUrl
                }
                decryptedData.push(recordToInsert);
                console.log("new data to encrypt: ", decryptedData);
                newData = await encryptData(decryptedData, key);
            }

            console.log("new encrypted data: ", newData);
            const dataBuffer = Buffer.concat([Buffer.from([0]), Buffer.from(borsh.serialize(schema, newData))]);

            const signature = await addMedicalRecord(userKeyPair, new PublicKey(dataAccountPublicKey), dataBuffer);
            console.log("Add record transaction signature: ", signature);
        } catch (error) {
            console.log("Error uploading record: ", error);
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
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
            {/* <button onClick={() => getPrivateKey(provider)}>test</button> */}
            <h1 className='text-2xl font-bold'>Upload Record</h1>
            <p className='text-lg'>Upload your record here.</p>
            <form onSubmit={handleSubmit} className='flex flex-col my-4 border-2 border-gray-600 p-4 rounded-lg w-[60%]'>
                <div className='flex flex-col'>
                    <label htmlFor="full-name" className='text-gray-600 mb-2'>Full Name</label>
                    <input className='border-2 border-gray-500 px-2 py-1 rounded-md' type="text" id="full-name" name="fullName" value={record.fullName} onChange={(e) => setRecord({ ...record, fullName: e.target.value })} required />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor="doctors-name" className='text-gray-600 mb-2'>Doctor's Name</label>
                    <input className='border-2 border-gray-500 px-2 py-1 rounded-md' type="text" id="doctors-name" name="doctorName" value={record.doctorName} onChange={(e) => setRecord({ ...record, doctorName: e.target.value })} required />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor="record-title" className='text-gray-600 mb-2'>Medical Record Title</label>
                    <input className='border-2 border-gray-500 px-2 py-1 rounded-md' type="text" id="record-title" name="recordTitle" value={record.recordTitle} onChange={(e) => setRecord({ ...record, recordTitle: e.target.value })} required />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor="record-date" className='text-gray-600 mb-2'>Date</label>
                    <input className='border-2 border-gray-500 px-2 py-1 rounded-md' type="date" id="record-date" name="date" value={record.date} onChange={(e) => setRecord({ ...record, date: e.target.value })} required />
                </div>
                <label htmlFor="record" className='text-gray-600 my-4 py-4 rounded-lg flex flex-col items-center justify-center border-gray-600 border-dashed border-2'>
                    <Upload className='w-8' />
                    Medical Record
                </label>
                <input id='record' type="file" accept=".pdf,application/pdf" onChange={handleFileChange} hidden/>
                <Button variant='outline' type="submit">Upload</Button>
            </form>
        </div>
    )
}

export default page;