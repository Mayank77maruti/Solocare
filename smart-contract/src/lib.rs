use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info}, 
    pubkey::Pubkey, 
    entrypoint::ProgramResult, 
    entrypoint, 
    msg
};

// Defining the function that are possible to execute
#[derive(BorshDeserialize, BorshSerialize)]
enum InstructionType {
    UpdateData(Data),
}

// Defining the shape of the data
#[derive(BorshDeserialize, BorshSerialize)]
struct Data {
    iv: String,
    ciphertext: String,
}

// Defining the entrypoint function
entrypoint!(solocare_contract);

pub fn solocare_contract (
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // Extracting the first account from the accountInfo array
    let acc = next_account_info(&mut accounts.iter())?;

    // Verify account ownership
    if acc.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(solana_program::program_error::ProgramError::IncorrectProgramId);
    }

    // Verify account is writable
    if !acc.is_writable {
        msg!("Account is not writable");
        return Err(solana_program::program_error::ProgramError::InvalidArgument);
    }
    
    // Deserializing the array from the instruction data
    let instruction_type = InstructionType::try_from_slice(instruction_data)?;

    // Checking the instruction that needs to performed
    match instruction_type {
        // If UpdateData = Replce the date in the struct with the new data
        InstructionType::UpdateData(value) => {
            msg!("Executing UpdateData");
            let data = Data {
                iv: value.iv,
                ciphertext: value.ciphertext,
            };
            data.serialize(&mut *acc.data.borrow_mut())?;
        }
    }

    msg!("Contract Succeded");
    Ok(())
}