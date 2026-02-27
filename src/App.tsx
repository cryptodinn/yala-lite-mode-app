import React, { useEffect, useState } from "react";
import { BrowserProvider, formatUnits } from "ethers";
import { SavingsVault__factory as VaultV1, SavingsVault} from "./vault/index"
const vaultV1Address = "0xB977A8F701A97Ae215a59b39a28BBaA1b09e2d33"; // replace with actual address
const vaultV2Address = "0x5b50F8A7c4cFeFA9bB76BBd7d1124753196FC5D2";
const vaultV3Address = "0xBEe956df0AC3543b05136616e7B5597C9266CaED";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const App: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [vaultV1, setVaultV1] = useState<SavingsVault | null>(null);
  
  const [vaultV2, setVaultV2] = useState<SavingsVault | null>(null);
  const [vaultV3, setVaultV3] = useState<SavingsVault | null>(null);

  const [shares1, setShares1] = useState<number | null>(null);
  const [shares2, setShares2] = useState<number | null>(null);
  const [shares3, setShares3] = useState<number | null>(null);

  useEffect(() => {
    if (!vaultV1 || !vaultV2 || !vaultV3 || !account) return;
    getState();
  }, [vaultV1, vaultV2, vaultV3]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const [selectedAccount]: string[] = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        setAccount(selectedAccount);
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        console.log("switching to mainnet...", chainId);
        if (chainId !== 1n) {
          alert("please switch to Ethereum mainnet");
          // await window.ethereum.request({method: "wallet_switchEthereumChain", params: [{ chainId: "0x1" }]});
        }
        const signer = await provider.getSigner();
        const vaultV1 = VaultV1.connect(vaultV1Address, signer);
        const vaultV2 = VaultV1.connect(vaultV2Address, signer);
        const vaultV3 = VaultV1.connect(vaultV3Address, signer);
        setVaultV1(vaultV1);
        setVaultV2(vaultV2);
        setVaultV3(vaultV3);
      } catch (err) {
        console.error("connect wallet failed:", err);
      }
    } else {
      alert("please install MetaMask first！");
    }
  };

  const redeemShares = async (vault: SavingsVault) => {
    if (vault && account) {
      try {
        const s1 = await vault.balanceOf(account);
        const tx = await vault.redeem(s1, account, account);
        await tx.wait();
      } catch (err) {
        console.error("redeem shares failed:", err);
      }
    }
  }

  const getState = async () => {
    console.log('getting state...',!!vaultV1);
    if (!!account && !!vaultV1 && !!vaultV2 && !!vaultV3) {
        const s1 = await vaultV1.balanceOf(account);
        console.log("s1:", s1.toString());
        const s2 = await vaultV2.balanceOf(account);
        const s3 = await vaultV3.balanceOf(account);
        const decimals1 = await vaultV1.decimals();
        const decimals2 = await vaultV2.decimals();
        const decimals3 = await vaultV3.decimals();
        const shares1 = Number(formatUnits(s1, decimals1))
        const shares2 = Number(formatUnits(s2, decimals2))
        const shares3 = Number(formatUnits(s3, decimals3))
        // const shares1 = 1
        // const shares2 = 2
        // const shares3 = 3
        setShares1(shares1);
        setShares2(shares2);
        setShares3(shares3);
        
        console.log("vault v1 shares:", shares1.toString());
        console.log("vault v2 shares:", shares2.toString());
        console.log("vault v3 shares:", shares3.toString());
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Redeem Yala Lite Mode Shares</h2>
      {!account ? (
        <button onClick={connectWallet}>connect wallet</button>
      ) : (
        <div>
          <p>wallet connected: {account}</p>
          <p>YLPS1 shares: {shares1} {vaultV1 && shares1 && shares1 > 0 ? (
            <button onClick={() => redeemShares(vaultV1)}>Redeem YLPS1</button>
          ) : (
            <div></div>
          )}</p>
          <p>YLPS2 shares: {shares2} {vaultV2 && shares2 && shares2 > 0 ? (
            <button onClick={() => redeemShares(vaultV2)}>Redeem YLPS2</button>
          ) : (
            <div></div>
          )}</p>
          <p>YLPS3 shares: {shares3} {vaultV3 && shares3 && shares3 > 0 ? (
            <button onClick={() => redeemShares(vaultV3)}>Redeem YLPS3</button>
          ) : (
            <div></div>
          )}</p>
        </div>
      )}
    </div>
  );
};

export default App;
