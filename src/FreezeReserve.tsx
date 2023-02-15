import { AaveV3Polygon } from "@bgd-labs/aave-address-book";
import { ethers } from "ethers";

export interface FreezeReserveProps {
  forkRPC: string;
}

export const FreezeReserve = ({ forkRPC }: FreezeReserveProps) => {
  const freeze = async (freeze: boolean) => {
    const provider = new ethers.providers.JsonRpcProvider(forkRPC);
    const signer = provider.getSigner();
    const poolConfigurator = new ethers.Contract(
      AaveV3Polygon.POOL_CONFIGURATOR,
      ["function setReserveFreeze(address asset, bool freeze)"],
      signer
    );

    const unsignedTx =
      await poolConfigurator.populateTransaction.setReserveFreeze(
        "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c", // jEUR
        freeze
      );

    const transactionParameters = [
      {
        to: AaveV3Polygon.POOL_CONFIGURATOR,
        from: AaveV3Polygon.ACL_ADMIN,
        data: unsignedTx.data,
        gas: ethers.utils.hexValue(8000000),
        gasPrice: ethers.utils.hexValue(0),
        value: ethers.utils.hexValue(0),
      },
    ];

    const txHash = await provider.send(
      "eth_sendTransaction",
      transactionParameters
    );

    console.log(txHash);
  };
  return (
    <>
      <button onClick={() => freeze(true)}>Freeze jEUR</button>
      <button onClick={() => freeze(false)}>Unfreeze jEUR</button>
    </>
  );
};
