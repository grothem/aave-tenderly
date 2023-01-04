import React, { Fragment, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { ethers } from "ethers";
import { SendDai } from "./SendDai";
import { SendStETH } from "./SendStETH";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

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
  // const [network, setNetwork] = React.useState<number>(networks[0].chainId);

  useEffect(() => {
    if (didInit) return;

    const f = localStorage.getItem("forks");
    if (!f) return;

    setForks(JSON.parse(f));
  }, []);

  async function createFork(network: number) {
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

  async function addToBalance(forkId: string) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl(forkId));
    // fund it with 1,000 ether
    const params = [fundAddress, "0x21e19e0c9bab2400000"];
    await provider.send("tenderly_addBalance", params);
  }

  return (
    <div className="container mx-auto">
      <div style={{ display: "flex", gap: "5px", margin: "5px" }}>
        <CreateFork onCreateFork={createFork} />
      </div>
      <input
        placeholder="Fund Address"
        value={fundAddress}
        onChange={(e) => setFundAddress(e.target.value)}
      />
      <div className="w-100">
        {forks.map((fork) => (
          <Fork
            forkId={fork.forkId}
            networkName={
              networks.find((n) => n.chainId === fork.forkChainId)?.name || ""
            }
          />
          // <div
          //   style={{
          //     border: "1px solid gray",
          //     padding: "10px",
          //     margin: "10px",
          //   }}
          //   key={fork.forkId}
          // >
          //   <div>{fork.forkId}</div>
          //   <div>
          //     {networks.find((n) => n.chainId === fork.forkChainId)?.name}
          //   </div>
          //   <button onClick={() => deleteFork(fork.forkId)}>Delete Fork</button>
          //   <button
          //     disabled={!fundAddress}
          //     onClick={() => fundAccount(fork.forkId)}
          //   >
          //     Send ETH
          //   </button>
          //   <SendDai forkRPC={rpcUrl(fork.forkId)} address={fundAddress} />
          //   <SendStETH forkRPC={rpcUrl(fork.forkId)} address={fundAddress} />
          //   <button
          //     onClick={() =>
          //       setSnippet(getSnippet(fork.forkId, fork.forkChainId))
          //     }
          //   >
          //     &lt;/&gt;
          //   </button>
          // </div>
        ))}
      </div>
      <textarea
        style={{ height: "90px", width: "900px", margin: "20px" }}
        value={snippet}
      ></textarea>
    </div>
  );
}

interface CreateForkProps {
  onCreateFork: (network: number) => void;
}

const CreateFork = ({ onCreateFork }: CreateForkProps) => {
  const [network, setNetwork] = React.useState<number>(networks[0].chainId);

  const handleCreateFork = () => {
    onCreateFork(network);
  };

  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded-full"
        onClick={handleCreateFork}
      >
        Create Fork
      </button>
      <div className="w-72">
        <Listbox value={network} onChange={setNetwork}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
              <span className="block truncate">
                {networks.find((n) => n.chainId === network)?.name}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {networks.map((n, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                      }`
                    }
                    value={n.chainId}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {n.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
    </>
  );
};

interface ForkProps {
  forkId: string;
  networkName: string;
}
const Fork = ({ forkId, networkName }: ForkProps) => {
  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md dark:border-gray-700 p-2">
      <div className="rounded-full bg-blue-500">{networkName}</div>
      <div>{forkId}</div>
    </div>
  );
};

export default App;
