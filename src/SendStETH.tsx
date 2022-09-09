import { ethers, utils } from "ethers";
import { useState } from "react";
import { Steth__factory } from "./types/factories/Steth__factory";

const STETH_ADDRESS = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
const SOME_WHALE = "0x1982b2f5814301d4e9a8b0201555376e62f82428";

export interface SendStETHProps {
  forkRPC: string;
  address: string;
}

export const SendStETH = ({ forkRPC, address }: SendStETHProps) => {
  const [loading, setLoading] = useState(false);

  const fundStETH = async () => {
    setLoading(true);

    try {
      const provider = new ethers.providers.JsonRpcProvider(forkRPC);
      const signer = provider.getSigner();
      const stETH = Steth__factory.connect(STETH_ADDRESS, signer);

      const amount = utils.parseEther("1");
      const unsignedTx = await stETH.populateTransaction.transfer(
        address,
        amount.toString()
      );

      const transactionParameters = [
        {
          to: STETH_ADDRESS, // The contract targeted for this transaction
          from: SOME_WHALE, // Sent on behalf of
          data: unsignedTx.data, // The tx data
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
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <button disabled={loading || !address} onClick={() => fundStETH()}>
      Send stETH
    </button>
  );
};
