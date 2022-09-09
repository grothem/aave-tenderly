import { ethers, utils } from "ethers";
import { useState } from "react";
import { Dai__factory } from "./types/factories/Dai__factory";

const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface SendDaiProps {
  forkRPC: string;
  address: string;
}

// TODO: make these 'fund' components generic, lot of re-use between them
export const SendDai = ({ forkRPC, address }: SendDaiProps) => {
  const [loading, setLoading] = useState(false);

  const fundDai = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(forkRPC);
      const signer = provider.getSigner();
      const dai = Dai__factory.connect(DAI_ADDRESS, signer);

      const amount = utils.parseEther("1000");
      const unsignedTx = await dai.populateTransaction.approve(
        await signer.getAddress(),
        amount
      );

      const transactionParameters = [
        {
          to: dai.address,
          from: ZERO_ADDRESS,
          data: unsignedTx.data,
          gas: ethers.utils.hexValue(3000000),
          gasPrice: ethers.utils.hexValue(1),
          value: ethers.utils.hexValue(0),
        },
      ];

      const txHash = await provider.send(
        "eth_sendTransaction",
        transactionParameters
      );
      console.log(txHash);

      const respTxTransfer = await dai.transferFrom(
        ZERO_ADDRESS,
        address,
        amount.toString()
      );
      console.log(respTxTransfer);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <button disabled={loading || !address} onClick={() => fundDai()}>
      Send DAI
    </button>
  );
};
