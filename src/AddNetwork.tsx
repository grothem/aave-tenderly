



import React from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import { Network } from './App'
import { ethers } from 'ethers'


interface AddNetworkProps {
    network?: Network,
    forkChainId: number,
    forkRpcUrl: string
}

export default function AddNetwork({ network, forkChainId, forkRpcUrl }: AddNetworkProps) {
    const [{ wallet }] = useConnectWallet()

    if (wallet && wallet.provider) {
        return <button onClick={() => wallet.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: ethers.utils.hexValue(forkChainId),
                chainName: network?.name + "Fork" + new Date().getTime(),
                nativeCurrency: {
                    name: network?.baseAsset,
                    symbol: network?.baseAsset,
                    decimals: 18
                },
                rpcUrls: [forkRpcUrl],
            }]
        })}>Add to Wallet</button>
    } else {
        return <></>
    }


}
