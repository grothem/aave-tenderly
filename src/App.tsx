import React, { useEffect } from "react";
import "./App.css";
import axios from "axios";
import { ethers } from "ethers";
import { SendDai } from "./SendDai";
import { SendStETH } from "./SendStETH";
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import ConnectWallet from "./ConnectWallet";
import AddNetwork from "./AddNetwork";

const TENDERLY_KEY = process.env.REACT_APP_TENDERLY_KEY;
const TENDERLY_ACCOUNT = process.env.REACT_APP_TENDERLY_ACCOUNT;
const TENDERLY_PROJECT = process.env.REACT_APP_TENDERLY_PROJECT;
const FORK_CHAIN_ID = 3030;

const injected = injectedModule()
const web3OnboardWallets = [
  injected
]
const web3OnboardChains = [
  {
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: `https://rpc.ankr.com/etho`,
  },
  {
    id: '0x5',
    token: 'ETH',
    label: 'Goerli',
    rpcUrl: `https://mainnet.infura.io/v3/demo`,
  },
  {
    id: '0x13881',
    token: 'MATIC',
    label: 'Polygon',
    rpcUrl: `https://polygon-rpc.com`,
  },
  {
    id: '0xA',
    token: 'OETH',
    label: 'Optimism',
    rpcUrl: 'https://optimism-mainnet.public.blastapi.io',
  },
  {
    id: '0xA4B1',
    token: 'ARB-ETH',
    label: 'Arbitrum',
    rpcUrl: `https://rpc.ankr.com/arbitrum`,
  }
]

const appMetadata = {
  name: 'Aave Tenderly',
  icon: '<svg>ghost</svg>',
  description: 'Ibjected wallet connection',
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
  ]
};

const web3Onboard = init({
  wallets: web3OnboardWallets,
  chains: web3OnboardChains,
  appMetadata
})

const tenderly = axios.create({
  baseURL: "https://api.tenderly.co/api/v1/",
  headers: {
    "X-Access-Key": TENDERLY_KEY || "",
  },
});

const defaultChainId = FORK_CHAIN_ID;
let didInit = false;

interface Fork {
  forkId: string;
  chainId: number;
  forkChainId: number;
}

export interface Network {
  chainId: number;
  name: string;
  baseAsset: string;
}

const networks: Network[] = [
  { chainId: 1, name: "Mainnet", baseAsset: 'ETH' },
  { chainId: 137, name: "Polygon", baseAsset: "MATIC" },
  { chainId: 43114, name: "Avalanche", baseAsset: "AVAX" },
  { chainId: 42161, name: "Arbitrum", baseAsset: "ETH" },
  { chainId: 10, name: "Optimism", baseAsset: "ETH" },
  { chainId: 250, name: "Fantom", baseAsset: "FTM" },
  { chainId: 1666600000, name: "Harmony", baseAsset: "ONE" },
  { chainId: 5, name: "Goerli", baseAsset: "ETH", }
];

const rpcUrl = (forkId: string) => {
  return `https://rpc.tenderly.co/fork/${forkId}`;
};

const getSnippet = (
  forkId: string,
  forkBaseChainId: number,
  networkId: number
) => {
  return `
    localStorage.setItem('forkEnabled', 'true');
    localStorage.setItem('forkBaseChainId', '${networkId}');
    localStorage.setItem('forkNetworkId', '${forkBaseChainId}');
    localStorage.setItem('forkRPCUrl', '${rpcUrl(forkId)}');
  `;
};

function App() {
  const [fundAddress, setFundAddress] = React.useState("");
  const [forks, setForks] = React.useState<Fork[]>([]);
  const [snippet, setSnippet] = React.useState<string>("");
  const [network, setNetwork] = React.useState<number>(networks[0].chainId);
  const [useForkChainId, setUseForkChainId] = React.useState(false);

  useEffect(() => {
    if (didInit) return;

    const f = localStorage.getItem("forks");
    if (!f) return;

    setForks(JSON.parse(f));
  }, []);

  const chainId = useForkChainId ? network : defaultChainId;

  async function createFork() {
    const response = await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork`,
      {
        network_id: network,
        chain_config: { chain_id: chainId },
      }
    );

    console.log(response);
    const { id } = response.data.simulation_fork;
    const f = [
      ...forks,
      { forkId: id, chainId: network, forkChainId: chainId },
    ];
    setForks(f);
    localStorage.setItem("forks", JSON.stringify(f));
  }

  async function deleteFork(forkId: string) {
    try {
      await tenderly.delete(
        `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${forkId}`
      );

      const f = forks.filter((f) => f.forkId !== forkId);
      setForks(f);
      localStorage.setItem("forks", JSON.stringify(f));
    } catch (error) {
      console.error(error);
    }
  }

  async function fundAccount(forkId: string) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl(forkId));
    // fund it with 1,000 ether
    const params = [fundAddress, "0x21e19e0c9bab2400000"];
    await provider.send("tenderly_addBalance", params);
  }

  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <div className="App">
        <header className="App-header">
          <div style={{ display: "flex", gap: "5px", margin: "5px" }}>
            <button onClick={createFork}>Create Fork</button>
            <select onChange={(e) => setNetwork(Number(e.target.value))}>
              {networks.map((n) => (
                <option key={n.chainId} value={n.chainId}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <label
            style={{ fontSize: 12, display: "flex", alignItems: "center" }}
          >
            use forked chain id as base chain id:
            <input
              type="checkbox"
              id="baseChainId"
              onChange={(e) => setUseForkChainId(e.target.checked)}
            />
          </label>
          <span
            style={{
              visibility: useForkChainId ? "visible" : "hidden",
              fontSize: "14px",
              color: "red",
              marginBottom: "4px",
            }}
          >
            Be careful of replay attacks!
          </span>
          <input
            placeholder="Fund Address"
            value={fundAddress}
            onChange={(e) => setFundAddress(e.target.value)}
          />
          <div>
            {forks.map((fork) => (
              <div
                style={{
                  border: "1px solid gray",
                  padding: "10px",
                  margin: "10px",
                }}
                key={fork.forkId}
              >
                <div>{fork.forkId}</div>
                <div>
                  {networks.find((n) => n.chainId === fork.forkChainId)?.name}
                </div>
                <button onClick={() => deleteFork(fork.forkId)}>
                  Delete Fork
                </button>
                <AddNetwork forkRpcUrl={rpcUrl(fork.forkId)} forkChainId={fork.chainId} network={networks.find((n) => n.chainId === fork.forkChainId)} />
                <button
                  disabled={!fundAddress}
                  onClick={() => fundAccount(fork.forkId)}
                >
                  Send ETH
                </button>
                <SendDai forkRPC={rpcUrl(fork.forkId)} address={fundAddress} />
                <SendStETH forkRPC={rpcUrl(fork.forkId)} address={fundAddress} />
                <button
                  onClick={() =>
                    setSnippet(
                      getSnippet(fork.forkId, fork.forkChainId, fork.chainId)
                    )
                  }
                >
                  &lt;/&gt;
                </button>
              </div>
            ))}
          </div>
          <ConnectWallet />
          <textarea
            style={{ height: "90px", width: "900px", margin: "20px" }}
            value={snippet}
          ></textarea>
        </header>
      </div>
    </Web3OnboardProvider>
  );
}

export default App;
