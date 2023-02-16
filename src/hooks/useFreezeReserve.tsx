import { AaveV2Ethereum, AaveV3Polygon } from "@bgd-labs/aave-address-book";
import { ethers } from "ethers";
import { NetworkName } from "../common";

type TxParams = {
  to: string;
  from: string;
  data: string | undefined;
  gas: string;
  gasPrice: string;
  value: string;
};

export const useFreezeReserve = (forkRPC: string, networkName: NetworkName) => {
  const provider = new ethers.providers.JsonRpcProvider(forkRPC);
  const signer = provider.getSigner();

  const freezeOrUnfreezeAssetOnPolygonV3 = async (
    assetAddress: string,
    freeze: boolean
  ): Promise<TxParams> => {
    const poolConfigurator = new ethers.Contract(
      AaveV3Polygon.POOL_CONFIGURATOR,
      ["function setReserveFreeze(address asset, bool freeze)"],
      signer
    );

    const unsignedTx =
      await poolConfigurator.populateTransaction.setReserveFreeze(
        assetAddress,
        freeze
      );

    return {
      to: AaveV3Polygon.POOL_CONFIGURATOR,
      from: AaveV3Polygon.ACL_ADMIN,
      data: unsignedTx.data,
      gas: ethers.utils.hexValue(8000000),
      gasPrice: ethers.utils.hexValue(0),
      value: ethers.utils.hexValue(0),
    };
  };

  const freezeAssetOnMainnetV2 = async (
    assetAddress: string
  ): Promise<TxParams> => {
    const poolConfigurator = new ethers.Contract(
      AaveV2Ethereum.POOL_CONFIGURATOR,
      ["function freezeReserve(address asset)"],
      signer
    );

    const unsignedTx = await poolConfigurator.populateTransaction.freezeReserve(
      assetAddress
    );

    return {
      to: AaveV2Ethereum.POOL_CONFIGURATOR,
      from: AaveV2Ethereum.POOL_ADMIN,
      data: unsignedTx.data,
      gas: ethers.utils.hexValue(8000000),
      gasPrice: ethers.utils.hexValue(0),
      value: ethers.utils.hexValue(0),
    };
  };

  const unFreezeAssetOnMainnetV2 = async (
    assetAddress: string
  ): Promise<TxParams> => {
    const poolConfigurator = new ethers.Contract(
      AaveV2Ethereum.POOL_CONFIGURATOR,
      ["function unfreezeReserve(address asset)"],
      signer
    );

    const unsignedTx =
      await poolConfigurator.populateTransaction.unfreezeReserve(assetAddress);

    return {
      to: AaveV2Ethereum.POOL_CONFIGURATOR,
      from: AaveV2Ethereum.POOL_ADMIN,
      data: unsignedTx.data,
      gas: ethers.utils.hexValue(8000000),
      gasPrice: ethers.utils.hexValue(0),
      value: ethers.utils.hexValue(0),
    };
  };

  return {
    freeze: async (assetAddress: string): Promise<string> => {
      let txParams: TxParams;
      switch (networkName) {
        case "Mainnet":
          txParams = await freezeAssetOnMainnetV2(assetAddress);
          break;
        case "Polygon":
          txParams = await freezeOrUnfreezeAssetOnPolygonV3(assetAddress, true);
          break;
        default:
          throw new Error("Network not supported");
      }

      return await provider.send("eth_sendTransaction", [txParams]);
    },
    unfreeze: async (assetAddress: string): Promise<string> => {
      let txParams: TxParams;
      switch (networkName) {
        case "Mainnet":
          txParams = await unFreezeAssetOnMainnetV2(assetAddress);
          break;
        case "Polygon":
          txParams = await freezeOrUnfreezeAssetOnPolygonV3(
            assetAddress,
            false
          );
          break;
        default:
          throw new Error("Network not supported");
      }
      return await provider.send("eth_sendTransaction", [txParams]);
    },
  };
};
