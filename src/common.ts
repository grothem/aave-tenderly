export interface Fork {
  networkName: NetworkName;
  forkId: string;
  chainId: number;
  forkChainId: number;
}

export interface Network {
  chainId: number;
  name: string;
}

export const networks: Network[] = [
  { chainId: 1, name: "Mainnet" },
  { chainId: 137, name: "Polygon" },
  { chainId: 43114, name: "Avalanche" },
  { chainId: 42161, name: "Arbitrum" },
  { chainId: 10, name: "Optimism" },
];

export type NetworkName =
  | "Mainnet"
  | "Polygon"
  | "Avalanche"
  | "Arbitrum"
  | "Optimism";
