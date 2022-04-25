require('dotenv').config();
const { WalletAdapterNetwork } = require('@solana/wallet-adapter-base');
const {
  PublicKey,
  clusterApiUrl,
  Connection,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const express = require('express');
const { shopAddress } = require('../lib/addresses');
const router = express.Router();

router.use((req, res, next) => {
  console.info('Time: ', Date.now());
  next();
});

router.get('/pay', async (req, res) => {
  try {
    console.log({ query: req.query });

    // We pass the selected items in the query, calculate the expected cost
    const amount = calculatePrice(req.query);
    if (amount.toNumber() === 0) {
      res.status(400).json({ error: "Can't checkout with charge of $0" });
      return;
    }

    // We pass the reference to use in the query
    const { reference } = req.query;
    if (!reference) {
      res.status(400).json({ error: 'No reference provided' });
    }

    // We pass the buyer's public key in JSON body
    const { account } = req.body;
    if (!account) {
      res.status(400).json({ error: 'No account provided' });
    }
    const buyerPublicKey = new PublicKey(account);
    const shopPublicKey = shopAddress;

    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    // Get a recent blockhash to include in the transaction
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey,
    });

    // Create the instruction to send SOL from the buyer to the shop
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: shopPublicKey,
    });

    // Add the reference to the instruction as a key
    // This will mean this transaction is returned when we query for the reference
    transferInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    });

    // Add the instruction to the transaction
    transaction.add(transferInstruction);

    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
      // We will need the buyer to sign this transaction after it's returned to them
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString('base64');

    // Insert into database: reference, amount

    // Return the serialized transaction
    res.status(200).json({
      transaction: base64,
      message: 'Thanks for your order!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating transaction' });
  }
});

module.exports = router;
