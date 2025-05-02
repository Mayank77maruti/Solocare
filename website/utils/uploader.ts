"use server";

import { PINAATA_GATEWAY, PINAATA_JWT } from "@/lib/environment";
import { PinataSDK } from "pinata-web3";

// initializing pinata object using PinataSDK class
const pinata = new PinataSDK({
    pinataJwt: PINAATA_JWT,
    pinataGateway: PINAATA_GATEWAY,
});

// Function to upload image and metadata.json to IPFS and generate corresponding link
export const uploadToIPFS = async(formData: FormData) => {
    try {
        const file = formData.get('file') as File;
        // Uploading file to IPFS
        const fileUpload = await pinata.upload.file(file);
        const fileURL = `https://gateway.pinata.cloud/ipfs/${fileUpload.IpfsHash}`;
        console.log("IPFS link of the image: ", fileURL);

        return JSON.stringify({
            fileURL: fileURL,
            success: true
        });
    } catch (error) {
        console.log("Can not upload file to IPFS: ", error);
        return JSON.stringify({
            success: false,
            message: "Can not upload file to IPFS"
        });
    }
}