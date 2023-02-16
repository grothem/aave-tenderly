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
];

export type NetworkName = "Mainnet" | "Polygon" | "Avalanche";
