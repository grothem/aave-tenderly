import { ethers, utils } from "ethers";
import { getMainnetSdk } from "@dethcrypto/eth-sdk-client";

interface FundooorProps {
  forkRPC: string;
}

export const Fundooor = ({ forkRPC }: FundooorProps) => {
  const provider = new ethers.providers.JsonRpcProvider(forkRPC);
  const signer = provider.getSigner();

  const fundStETH = async () => {
    const { dai } = getMainnetSdk(signer);
    // we can use ether encoding because dai contract has 18 decimals
    const tokenAmount = utils.parseEther("1").toString();
    const resp = await dai.transferFrom(
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0xaddfe0b2342800ebd67c30d1c2bd479e4d498bd5",
      tokenAmount
    );
    console.log(resp);
  };

  return <button onClick={() => fundStETH()}>fund me DAI</button>;
};
