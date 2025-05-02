import * as borsh from 'borsh';

export class SolocareAccount {
    iv: string;
    ciphertext: string;

    constructor({ iv, ciphertext }: { iv: string; ciphertext: string }) {
        this.iv = iv;
        this.ciphertext = ciphertext;
    }
}

export const schema: borsh.Schema = {
    struct: { 
        iv: 'string',
        ciphertext: 'string', 
    }
};

export const SOLOCARE_SIZE = borsh.serialize(schema, new SolocareAccount({ iv: '', ciphertext: '' })).length + 100000;

export type solocareData = {
    iv: string;
    ciphertext: string;
}