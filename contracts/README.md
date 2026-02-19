# ArbiSecure - Self-Enforcing Escrow Protocol

A Stylus-powered escrow contract with programmable milestone releases, staked arbiter network, and evidence-based dispute resolution.

Built with Arbitrum Stylus (Rust) for 80%+ gas savings over Solidity.

## Features

- **Multi-milestone deals** with programmable release conditions
- **Staked arbiter network** with reputation tracking
- **Evidence-based dispute resolution** (IPFS-backed)
- **ERC20 token support** (USDC/USDT)
- **Gasless first-deal tracking** for Paymaster integration

## Development

This project uses [Rust](https://www.rust-lang.org/) and the [Arbitrum Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs).

### Prerequisites

1. Install Rust:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
2. Add the WASM target:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```
3. Install the Stylus CLI:
   ```bash
   cargo install --force cargo-stylus cargo-stylus-check
   ```

### Building

To build the contract for deployment:

```bash
cargo build --release --target wasm32-unknown-unknown
```

Or using the Stylus CLI to check validity:

```bash
cargo stylus check
```

### Testing

Run the included unit tests:

```bash
cargo test
```

### Exporting ABI

To generate the Solidity ABI for the contract:

```bash
cargo stylus export-abi
```

## Deployment

Deploy using the Stylus CLI:

```bash
cargo stylus deploy --private-key-path <YOUR_key_path>
```

Refer to the [Arbitrum Stylus documentation](https://docs.arbitrum.io/stylus/gentle-introduction) for more details.

## License

This project is licensed under the MIT License.
