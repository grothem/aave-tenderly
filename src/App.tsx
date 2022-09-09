import React, { useEffect } from "react";
import "./App.css";
import axios from "axios";
import { ethers } from "ethers";
import { SendDai } from "./SendDai";
import { SendStETH } from "./SendStETH";

const TENDERLY_KEY = process.env.REACT_APP_TENDERLY_KEY;
const TENDERLY_ACCOUNT = process.env.REACT_APP_TENDERLY_ACCOUNT;
const TENDERLY_PROJECT = process.env.REACT_APP_TENDERLY_PROJECT;

const tenderly = axios.create({
  baseURL: "https://api.tenderly.co/api/v1/",
  headers: {
    "X-Access-Key": TENDERLY_KEY || "",
  },
});

const chainId = 3030;
let didInit = false;

interface Fork {
  forkId: string;
  chainId: number;
  forkChainId: number;
}

interface Network {
  chainId: number;
  name: string;
}

const networks: Network[] = [
  { chainId: 1, name: "Mainnet" },
  { chainId: 137, name: "Polygon" },
  { chainId: 43114, name: "Avalanche" },
];

const rpcUrl = (forkId: string) => {
  return `https://rpc.tenderly.co/fork/${forkId}`;
};

const getSnippet = (forkId: string, forkBaseChainId: number) => {
  return `
    localStorage.setItem('forkEnabled', 'true');
    localStorage.setItem('forkBaseChainId', '${forkBaseChainId}');
    localStorage.setItem('forkNetworkId', '3030');
    localStorage.setItem('forkRPCUrl', '${rpcUrl(forkId)}');
  `;
};

function App() {
  const [fundAddress, setFundAddress] = React.useState("");
  const [forks, setForks] = React.useState<Fork[]>([]);
  const [snippet, setSnippet] = React.useState<string>("");
  const [network, setNetwork] = React.useState<number>(networks[0].chainId);

  useEffect(() => {
    if (didInit) return;

    const f = localStorage.getItem("forks");
    if (!f) return;

    setForks(JSON.parse(f));
  }, []);

  async function foo() {}
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
    const f = [...forks, { forkId: id, chainId, forkChainId: network }];
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
    await provider.send("tenderly_setBalance", params);
  }

  return (
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
                  setSnippet(getSnippet(fork.forkId, fork.forkChainId))
                }
              >
                &lt;/&gt;
              </button>
            </div>
          ))}
        </div>
        <textarea
          style={{ height: "90px", width: "900px", margin: "20px" }}
          value={snippet}
        ></textarea>
      </header>
    </div>
  );
}

export default App;
