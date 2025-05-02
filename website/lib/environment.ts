import * as dotenv from 'dotenv';

dotenv.config();

export const PINAATA_JWT = process.env.PINAATA_JWT || '';
export const PINAATA_GATEWAY = process.env.PINAATA_GATEWAY || '';
export const PROGRAM_ADDRESS = process.env.NEXT_PUBLIC_PROGRAM_ADDRESS || '';