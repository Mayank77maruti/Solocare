import { IProvider } from "@web3auth/base";
import RPC from "@/utils/solanaRPC";
import { Web3Auth } from "@web3auth/modal";

export const getPrivateKey = async (provider: IProvider | null) => {
    console.log(provider);
    if (!provider) {
        console.log("provider not initialized yet");
        return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    console.log("privateKey: ", privateKey);
    return privateKey;
};

export const getBalance = async (provider: IProvider | null) => {
    if (!provider) {
        console.log("provider not initialized yet");
        return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    return balance;
};

export const authenticateUser = async (web3auth: Web3Auth | null) => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    console.log(idToken);
};

export const getUserInfo = async (web3auth: Web3Auth | null) => {
    if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
};

export const getAccounts = async (provider: IProvider | null) => {
    if (!provider) {
        console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    console.log(address);
};