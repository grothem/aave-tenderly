import { NetworkName } from "./common";
import { useFreezeReserve } from "./hooks/useFreezeReserve";

export interface FreezeReserveProps {
  forkRPC: string;
  networkName: NetworkName;
}

const AssetsToFreeze = {
  Polygon: {
    address: "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c",
    symbol: "jEUR",
  },
  Mainnet: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
  },
  Avalanche: { address: "", symbol: "" }, // TODO
};

export const FreezeReserve = ({ forkRPC, networkName }: FreezeReserveProps) => {
  const { freeze, unfreeze } = useFreezeReserve(forkRPC, networkName);

  if (networkName === "Avalanche") return null; // TODO

  return (
    <>
      <button
        onClick={async () => {
          const txHash = await freeze(AssetsToFreeze[networkName].address);
          console.log(txHash);
        }}
      >
        Freeze {AssetsToFreeze[networkName].symbol}
      </button>
      <button
        onClick={async () => {
          const txHash = await unfreeze(AssetsToFreeze[networkName].address);
          console.log(txHash);
        }}
      >
        Unfreeze {AssetsToFreeze[networkName].symbol}
      </button>
    </>
  );
};
