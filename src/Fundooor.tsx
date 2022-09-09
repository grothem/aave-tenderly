import { ethers, utils } from "ethers";
import { Dai__factory } from "./types/factories/Dai__factory";

const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

interface FundooorProps {
  forkRPC: string;
}

export const Fundooor = ({ forkRPC }: FundooorProps) => {
  const fundStETH = async () => {
    // const provider = new ethers.providers.JsonRpcProvider(forkRPC);
    // const dai = Dai__factory.connect(DAI_ADDRESS, provider);
    // const tokenAmount = utils.parseEther("1").toString();
    // const resp = await dai.transferFrom(
    //   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    //   "0xaddfe0b2342800ebd67c30d1c2bd479e4d498bd5",
    //   tokenAmount
    // );
    // console.log(resp);
  };

  return <button onClick={() => fundStETH()}>fund me DAI</button>;
};
