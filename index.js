const { Client,
        PrivateKey,
        AccountCreateTransaction,
        Hbar,
        AccountBalanceQuery,
        TransferTransaction } = require ("@hashgraph/sdk");
require ('dotenv').config();

async function environmentSetup() {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    //if we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey){
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }
    const client = Client.forTestnet();//create your Hedera Testnet client
    client.setOperator(myAccountId, myPrivateKey);//set your account as the client's operator

    //Generate private and public keys to associate with the 2 accounts you will create.
    //create new keys
    const firstNewAccountPrivateKey = PrivateKey.generateED25519();
    const firstNewAccountPublicKey = firstNewAccountPrivateKey.publicKey;
    const secondNewAccountPrivateKey = PrivateKey.generateED25519();
    const secondNewAccountPublicKey = secondNewAccountPrivateKey.publicKey;

    //create new accounts with 1,000 tinybar starting balance
    const firstNewAccount = await new AccountCreateTransaction()
                .setKey(firstNewAccountPublicKey)
                .setInitialBalance(Hbar.fromTinybars(1000))
                .execute(client);
    const secondNewAccount = await new AccountCreateTransaction()
                .setKey(secondNewAccountPublicKey)
                .setInitialBalance(Hbar.fromTinybars(1000))
                .execute(client);

    //Log the Account IDs
    const getReceipt_1 = await firstNewAccount.getReceipt(client);
    const newAccountId_1 = getReceipt_1.accountId;
    console.log(`The 1st new account ID is: ${newAccountId_1}`);

    const getReceipt_2 = await secondNewAccount.getReceipt(client);
    const newAccountId_2 = getReceipt_2.accountId;
    console.log(`The 2nd new account ID is: ${newAccountId_2}`);

    //Log the Balance of each account
    const firstAccountBalance = await new AccountBalanceQuery()
                    .setAccountId(newAccountId_1).execute(client);
    console.log("The 1st new account balance is: "+firstAccountBalance.hbars.toTinybars()+" tinybar.");

    const secondAccountBalance = await new AccountBalanceQuery()
                    .setAccountId(newAccountId_2).execute(client);
    console.log("The 2nd new account balance is: "+secondAccountBalance.hbars.toTinybars()+" tinybar.");

    //Send 2 hbar to each new account
    const transferTransaction = await new TransferTransaction()
                .addHbarTransfer(myAccountId, Hbar.fromTinybars(-4000))
                .addHbarTransfer(newAccountId_1, Hbar.fromTinybars(2000))
                .addHbarTransfer(newAccountId_2, Hbar.fromTinybars(2000))
                .execute(client);

    //Check that the transaction is Successful
    const transactionReceipt = await transferTransaction.getReceipt(client);
    console.log("The transfer transaction from my account to the new accounts was: "
                    + transactionReceipt.status.toString());

    //Log the new Balance of each account
    const updatedFirstAccountBalance = await new AccountBalanceQuery()
                            .setAccountId(newAccountId_1).execute(client);
    console.log("The 1st account balance after the transfer is: "+updatedFirstAccountBalance.hbars.toTinybars()+" tinybar.");
    const updatedSecondAccountBalance = await new AccountBalanceQuery()
                            .setAccountId(newAccountId_2).execute(client);
    console.log("The 2nd account balance after the transfer is: "+updatedSecondAccountBalance.hbars.toTinybars()+" tinybar.");



}
environmentSetup()