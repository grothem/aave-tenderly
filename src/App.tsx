import "@rainbow-me/rainbowkit/styles.css";
import {
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
  wallet,
} from "@rainbow-me/rainbowkit";
import {
  Chain,
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import MyApp from "./MyApp";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.goerli, chain.polygonMumbai],
  [publicProvider()]
);

// const connectors = connectorsForWallets([
//   {
//     groupName: "Recommended",
//     wallets: [wallet.metaMask({ chains })],
//   },
// ]);
const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = () => {
  function onConnect() {
    console.log("connecting");
    const avalancheChain: Chain = {
      id: 43_114,
      name: "Avalanche",
      network: "avalanche",
      nativeCurrency: {
        decimals: 18,
        name: "Avalanche",
        symbol: "AVAX",
      },
      rpcUrls: {
        default: "https://api.avax.network/ext/bc/C/rpc",
      },
      blockExplorers: {
        default: { name: "SnowTrace", url: "https://snowtrace.io" },
      },
      testnet: false,
    };

    const { provider, chains } = configureChains(
      [avalancheChain],
      [jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) })]
    );
  }

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <MyApp connectToFork={onConnect} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;
