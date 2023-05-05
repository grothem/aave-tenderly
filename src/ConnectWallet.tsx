import React, { useState, useEffect } from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { Balances } from '@web3-onboard/core/dist/types';


interface Account {
    address: string;
    balances: Balances | null;
}

export default function ConnectWallet() {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
    const [, setProvider] = useState<ethers.providers.Web3Provider | null>()
    const [, setAccount] = useState<Account | null>(null)

    useEffect(() => {
        if (wallet?.provider) {
            setAccount({
                address: wallet.accounts[0].address,
                balances: wallet.accounts[0].balance,
            })
        }
    }, [wallet])

    useEffect(() => {
        // If the wallet has a provider than the wallet is connected
        if (wallet?.provider) {
            setProvider(new ethers.providers.Web3Provider(wallet.provider, 'any'))
        }
    }, [wallet])

    if (wallet?.provider) {
        return (
            <div>
                <div>Connected to {wallet.label}</div>
                <button onClick={() => { disconnect({ label: wallet.label }) }}>Disconnect</button>
            </div>
        )
    }

    return (
        <div>
            <button
                disabled={connecting}
                onClick={() => connect()}>
                Connect Wallet To Add Network
            </button>
        </div>
    )
}
