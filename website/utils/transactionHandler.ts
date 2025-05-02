import * as borsh from 'borsh';
import { schema, SOLOCARE_SIZE, solocareData } from "@/lib/contractTypes";
import { PROGRAM_ADDRESS } from "@/lib/environment";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import axios from 'axios';
import { exportKey, generateKey } from './encryption';

console.log("PROGRAM_ADDRESS: ", PROGRAM_ADDRESS);

export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS);
export const connection = new Connection('https://api.devnet.solana.com');

export const getDataAccount = async (email: string | undefined) => {
    try {
        if (!email) {
            console.log("user email is undefined");
            return null;
        }
        const response = await axios.post('/api/user/get-data-account', {
            email
        });

        console.log("getDataAccount response: ", response.data);
        if (!response.data.success) {
            console.log("Error fetching user dataAccount: ", response.data.message);
            return null;
        }

        const dataAccount = response.data.dataAccount;

        return dataAccount;
    } catch (error) {
        console.log("Error fetching user account:", error);
        return null;
    }
};

export const addMedicalRecord = async (adminAccount: Keypair, dataAccountPublicKey: PublicKey, dataBuffer: Buffer<ArrayBuffer>) => {
    const tx = new Transaction();
    const ix = {
        keys: [
            { pubkey: dataAccountPublicKey, isSigner: false, isWritable: true },
            { pubkey: adminAccount.publicKey, isSigner: true, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data: dataBuffer
    };
    tx.add(ix);

    tx.feePayer = adminAccount.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signature = await sendAndConfirmTransaction(connection, tx, [adminAccount]);

    return signature;
}

export const getExistingAccountData = async (dataAccountPublicKey: PublicKey) => {
    const dataAccountInfo = await connection.getAccountInfo(dataAccountPublicKey);
    if (!dataAccountInfo) return console.log("recieved null dataAccountInfo");

    const data = borsh.deserialize(schema, dataAccountInfo.data) as solocareData;
    if (!data) return console.log("recieved null data");

    return data;
}

export const createDataAccount = async (adminAccount: Keypair, email: string | undefined) => {
    if (!email) {
        console.log("user email is undefined");
        return null;
    }
    const dataAccount = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(SOLOCARE_SIZE);
    const balance = await connection.getBalance(adminAccount.publicKey);

    console.log("lamports: ", lamports);
    console.log(`balance for ${adminAccount.publicKey} is ${balance}`);

    if (lamports > balance) {
        console.log("Insufficient funds in admin account. Please fund the account.");
        return null;
    }

    const ix = SystemProgram.createAccount({
        fromPubkey: adminAccount.publicKey,
        lamports,
        space: SOLOCARE_SIZE,
        programId: PROGRAM_ID,
        newAccountPubkey: dataAccount.publicKey
    });
    const createAccountTx = new Transaction();
    createAccountTx.add(ix);
    const signature = await connection.sendTransaction(createAccountTx, [adminAccount, dataAccount]);

    await connection.confirmTransaction(signature);
    console.log("dataAccount publicKey: ", dataAccount.publicKey.toBase58());

    const response = await axios.put('/api/user/save-data-account', {
        email: email,
        dataAccount: dataAccount.publicKey.toBase58()
    });
    console.log("create DataAccount response: ", response.data);

    return dataAccount.publicKey.toBase58();
}

export const getEncryptionKey = async (email: string | undefined) => {
    try {
        if (!email) {
            console.log("user email is undefined");
            return null;
        }

        const getKeyResponse = await axios.post('/api/user/get-encryption-key', {
            email: email
        });

        console.log("getEncryptionKey response: ", getKeyResponse.data);

        if (!getKeyResponse.data.success) {
            console.log("Error fetching encryption key: ", getKeyResponse.data.message);
            return null;
        }

        const encryptionKey = getKeyResponse.data.encryptionKey;
        console.log("Retrived encryption key: ", encryptionKey);

        if (!encryptionKey) {
            const newEncryptionKey = await generateKey();
            const exportedKey = await exportKey(newEncryptionKey);

            const saveKeyResponse = await axios.put('/api/user/save-encryption-key', {
                email: email,
                encryptionKey: exportedKey
            });

            console.log("saveEncryptionKey response: ", getKeyResponse.data);

            if (!saveKeyResponse.data.success) {
                console.log("Error saving encryption key: ", saveKeyResponse.data.message);
                return null;
            }

            return exportedKey;
        }

        return encryptionKey;
    } catch (error) {
        console.log("Error fetching encryption key:", error);
        return null;
        
    }
}