# SOLANA PAY LEARNING

Solana Pay is a new payments protocol over Web 3. It's decentralized, open, and truly peer-to-peer payment protocol. The vision is to pave the way for a future where digital currencies are prevalent and digital money moves through the internet like data - uncensored and without intermediaries taxing every transaction.

The core premise behind Solana Pay is that the payment and underlying technology goes from being a necessary service utility to true peer-to-peer communication channel between the merchant and consumer.

The protocol provides a specification that allows the consumer to send digital dollar currencies, such as USDC, from their wallet directly into the merchant’s account, settling immediately with costs measured in fractions of a penny. This embeds loyalty, offers and rewards in the same messaging scheme and become true building blocks for the future of commerce.

## Specification

```js
solana:<recipient>?amount=<amount>&label=<label>&message=<message>&memo=<memo>&reference=<reference>
```
### Recipient
A single **recipient** field is required as the pathname. The value must be the **base58-encoded public key** of a native SOL account. Associated token accounts must not be used.

Instead, to request an SPL token transfer, the **spl-token** field must be used to specify an SPL Token mint, from which the associated token address of the recipient address must be derived.

### Amount
A single **amount** field is allowed as an optional query parameter. The value must be a non-negative integer or decimal number of "user" units. For SOL, that's SOL and not lamports. For tokens, uiAmountString and not amount (reference: [Token Balances Structure](https://docs.solana.com/developing/clients/jsonrpc-api#token-balances-structure)).

**0** is a valid value. If the value is a decimal number less than 1, it must have a leading 0 before the .. Scientific notation is prohibited.

If a value is not provided, the wallet must prompt the user for the amount. If the number of decimal places exceed what's supported for SOL (9) or the SPL token (mint specific), the wallet must reject the URL as malformed.

### SPL Token
A single **spl-token** field is allowed as an optional query parameter. The value must be the **base58-encoded public key** of an SPL Token mint account.

If the field is not provided, the URL describes a native SOL transfer. If the field is provided, the [Associated Token Account](https://spl.solana.com/associated-token-account) convention must be used.

Wallets must derive the ATA address from the recipient and spl-token fields. Transfers to auxiliary token accounts are not supported.

### Reference
Multiple reference fields are allowed as optional query parameters. The values must be base58-encoded public keys.

If the values are provided, wallets must attach them in the order provided as read-only, non-signer keys to the SystemProgram.transfer or TokenProgram.transfer/TokenProgram.transferChecked instruction in the payment transaction. The values may or may not be unique to the payment request, and may or may not correspond to an account on Solana.

Because Solana validators index transactions by these public keys, reference values can be used as client IDs (IDs usable before knowing the eventual payment transaction). The [getSignaturesForAddress](https://docs.solana.com/developing/clients/jsonrpc-api#getsignaturesforaddress) RPC method can be used locate transactions this way.

### Label
A single **label** field is allowed as an optional query parameter. The value must be a URL-encoded string that describes the source of the payment request.

For example, this might be the name of a merchant, a store, an application, or a user making the request. Wallets should display the label to the user.

### Message
A single message field is allowed as an optional query parameter. The value must be a URL-encoded string that describes the nature of the payment request.

For example, this might be the name of an item being purchased. Wallets should display the message to the user.

### Memo
A single memo field is allowed as an optional query parameter. The value must be a URL-encoded string that will be included in an [SPL Memo](https://spl.solana.com/memo) instruction in the payment transaction.

Wallets should display the memo to the user. The SPL Memo instruction must be included immediately before the SOL or SPL Token transfer instruction to avoid ambiguity with other instructions in the transaction.

### Example
* Transfer of 1 SOL:
	```js
	solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId1234
	```

* Transfer of 0.01 USDC
	```js
	solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678
	```