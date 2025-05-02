import * as borsh from 'borsh';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { expect, test } from 'bun:test';
import pkg from 'bs58';
import { SOLOCARE_SIZE, schema, type solocareData } from './types';
import { decryptData, encryptData, importKey } from './encryption';

const { decode, encode } = pkg;


let adminAccount = Keypair.fromSecretKey(decode('4Y7RySccS2YVxtd2nbokb4p8Bz3YuqggmaykAgQ1mezVM8oH8gwpJVbfvX5dkxNx8fAVgav1SrLY5K7g5Hc5HhsX'));
let dataAccount = Keypair.fromSecretKey(decode('5QA3zBpdJCRJNxHX9NmDLfdsTmxMk8pBAUkzBrnmpUaAicT8HVGY9EbEyMUqRUygrXkaZ2EiL7DrgBhpauc6Y3pK'));
// let dataAccount = Keypair.generate();

const PROGRAM_ID = new PublicKey("6FpbJq8knv5dhUtYiBnoGiajXwjHxFuTNNCjRfhnsXKH");
const connection = new Connection('https://api.devnet.solana.com');
const existingKey = "2yw4QWgJZvmUd6IOcpv+SNncXNXzUDLdiO4pQWHQtxg=";

test('Account is initialized', async () => { 
    // const lamports = await connection.getMinimumBalanceForRentExemption(SOLOCARE_SIZE);
    // const ix = SystemProgram.createAccount({
    //     fromPubkey: adminAccount.publicKey,
    //     lamports,
    //     space: SOLOCARE_SIZE,
    //     programId: PROGRAM_ID,
    //     newAccountPubkey: dataAccount.publicKey
    // });
    // const createAccountTx = new Transaction();
    // createAccountTx.add(ix);
    // const signature = await connection.sendTransaction(createAccountTx, [adminAccount, dataAccount]);

    // await connection.confirmTransaction(signature);
    // console.log("dataAccount publicKey: ", dataAccount.publicKey.toBase58());

    // const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
    const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
    console.log("dataAccount privateKey: ", encode(dataAccount.secretKey));
    console.log("dataAccount publicKey: ", dataAccount.publicKey.toBase58());
    console.log("dataAccountInfo: ", dataAccountInfo?.data)
    if (!dataAccountInfo) return console.log("recieved null dataAccountInfo");
    const data = borsh.deserialize(schema, dataAccountInfo.data) as solocareData;
    console.log(data);
    if (!data) return console.log("recieved null data");
    
    expect(data.iv).toBe('hTxUqHQOrTvsArMc');
    expect(data.ciphertext).toBe('u3P14PYp3JojwQPphg89u/vG7cx/q15szwOd2Cq0EAVqDvduS307wjGPMyw/sXRO9wI4HDH+/oWWINiFahowKhad25ofGbkBoJvH3ymxiy2fHbKV3hrN8hCA0ZeVxd7RxTpNQJ9f/pI1wjvJED2/veFT8uga/BaYIHjTbVSy2zqahwXdKkHcLUgl2R/Qu8da9jLGH1k5h3oKolB7S37aScF/zWTrvMqUJR9yR0/uWWelunDiJwBa9QO4sssHZfjOqnYB+lrZ6QrDMfrB3lUoxGtRCSz+GxW+EUDfI2HDPuRKPXUL2YQ4TzoPkLUS9U/DmVDMFICBYevNR1gaUTmniA5FaHe4QMCIbl4kkvZ31Z6yGzGmXcQ9v+RO+YL2ygwyhyUISUHiXq2IFVn/ePfdtWURFPxgC+iXSVgw+NjCdTx73vE=');
});

test('Add new data', async () => {
    const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
    console.log("dataAccountInfo: ", dataAccountInfo?.data)
    if (!dataAccountInfo) return console.log("recieved null dataAccountInfo");

    const data = borsh.deserialize(schema, dataAccountInfo.data) as solocareData;
    if (!data) return console.log("recieved null data");
    console.log("data initially: ", data);

    let newData: solocareData;

    const newPatientData = {
      name: "Rahcel Jonson",
      age: 42,
      file: "https://ipfs.io/ipfs/QmXYZdada",
      "doctor's name": "Dr. Ratan",
    };

    const key = await importKey(existingKey);

    if (data.iv === '' || data.ciphertext === '') {
        const dataToEncrypt = []
        dataToEncrypt.push(newPatientData);
        newData = await encryptData(dataToEncrypt, key);
    } else {
        const decryptedData = await decryptData(
            data.ciphertext,
            data.iv,
            key
        );
        console.log("decryptedData initially: ", decryptedData);
        decryptedData.push(newPatientData);
        console.log("new data to encrypt: ", decryptedData);
        newData = await encryptData(decryptedData, key);
    }

    console.log("new encrypted data: ", newData);
    const dataBuffer = Buffer.concat([Buffer.from([0]), Buffer.from(borsh.serialize(schema, newData))]);
    // console.log("dataBuffer: ", dataBuffer);
    // const dataBufferLength = dataBuffer.length;
    // console.log("dataBufferLength in bytes: ", dataBufferLength); // 177 bytes

    const tx = new Transaction();
    const ix = {
        keys: [
            { pubkey: dataAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: adminAccount.publicKey, isSigner: true, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data: dataBuffer
    };
    tx.add(ix);

    tx.feePayer = adminAccount.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signature = await sendAndConfirmTransaction(connection, tx, [adminAccount, dataAccount]);
    // console.log("signature: ", signature);

    const dataAccountInfoAfterUpdate = await connection.getAccountInfo(dataAccount.publicKey);
    console.log("dataAccountInfoAfterUpdate: ", dataAccountInfoAfterUpdate?.data)
    if (!dataAccountInfoAfterUpdate) return console.log("recieved null dataAccountInfoAfterUpdate");

    const dataAfterUpdate = borsh.deserialize(schema, dataAccountInfoAfterUpdate.data) as solocareData;
    if (!dataAfterUpdate) return console.log("recieved null dataAfterUpdate");

    console.log("dataAfterUpdate: ", dataAfterUpdate);

    // expect(dataAfterUpdate.iv).toBe(newData.iv);
    // expect(dataAfterUpdate.ciphertext).toBe(newData.ciphertext);
});