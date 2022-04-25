const { PublicKey } = require('@solana/web3.js');
require('dotenv').config();

module.exports.shopAddress = new PublicKey(process.env.SHOP_PUBLIC_KEY);
