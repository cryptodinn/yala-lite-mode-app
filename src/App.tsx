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

  const [withdrawable1, setWithdrawable1] = useState<number | null>(null);
  const [withdrawable2, setWithdrawable2] = useState<number | null>(null);
  const [withdrawable3, setWithdrawable3] = useState<number | null>(null);

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

  const redeem = async (vault: SavingsVault) => {
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
        const s1 = await vaultV1.maxWithdraw(account);
        console.log("s1:", s1.toString());
        const s2 = await vaultV2.maxWithdraw(account);
        const s3 = await vaultV3.maxWithdraw(account);
        const shares1 = Number(formatUnits(s1, 18))
        const shares2 = Number(formatUnits(s2, 18))
        const shares3 = Number(formatUnits(s3, 18))
        // const name = await vaultV1.name();
        // console.log("vault name1:", name);
        // const name2 = await vaultV2.name();
        // console.log("vault name2:", name2);
        // const name3 = await vaultV3.name();
        // console.log("vault name3:", name3);
        setWithdrawable1(shares1);
        setWithdrawable2(shares2);
        setWithdrawable3(shares3);
    }
  };

  const Item = ({ title, amount, vault, redeem }: {title: string, amount: any, vault: any, redeem: any }) => {
    const canWithdraw = vault && amount && amount > 0;
    const waitingConnect = amount == null;
    return (
      <div
        style={{
          padding: "16px",
          border: "1px solid #eee",
          borderRadius: "10px",
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fafafa",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold" }}>{title}</div>
          <div style={{ marginTop: "4px", color: "#555" }}>
            Withdrawable: {amount == null? "-": `${amount} YU`} 
          </div>
        </div>

        {waitingConnect ? (<div></div>): canWithdraw? (
          <button
            onClick={() => redeem(vault)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "#4f46e5",
              color: "white",
              cursor: "pointer",
            }}
          >
            Withdraw
          </button>
        ):(<div>Nothing to withdraw</div>)}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "Arial",
        border: "1px solid #eee",
        borderRadius: "12px",
        background: "white",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        Redeem Yala Lite Mode Shares
      </h2>

      {!account ? (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#16a34a",
            color: "white",
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <p style={{ marginBottom: "20px", color: "#555" }}>
          Wallet connected: {account}
        </p>
      )}

      <Item
        title="Yala Lite Mode 08/07/2025"
        amount={withdrawable1}
        vault={vaultV1}
        redeem={redeem}
      />
      <Item
        title="Yala Lite Mode 08/21/2025"
        amount={withdrawable2}
        vault={vaultV2}
        redeem={redeem}
      />
      <Item
        title="Yala Lite Mode 09/18/2025"
        amount={withdrawable3}
        vault={vaultV3}
        redeem={redeem}
      />
    </div>
  );

  // return (
  //   <div style={{ padding: "20px", fontFamily: "Arial" }}>
  //     <h2>Redeem Yala Lite Mode Shares</h2>
  //     {!account ? (
  //       <button onClick={connectWallet}>connect wallet</button>
  //     ) : (
  //       <div>
  //         <p>wallet connected: {account}</p>
  //       </div>
  //     )}
  //     <p>Withdrawable YU for Yala Lite Mode 08/07/2025: {redeem1 && redeem1 > 0 ? redeem1 : "0"} {vaultV1 && redeem1 && redeem1 > 0 ? (
  //           <button onClick={() => redeem(vaultV1)}>Withdraw</button>
  //         ) : (
  //           <div></div>
  //         )}</p>
  //         <p>Withdrawable YU for Yala Lite Mode 08/21/2025:: {redeem2 && redeem2 > 0 ? redeem2 : "0"} {vaultV2 && redeem2 && redeem2 > 0 ? (
  //           <button onClick={() => redeem(vaultV2)}>Withdraw</button>
  //         ) : (
  //           <div></div>
  //         )}</p>
  //         <p>Withdrawable YU for Yala Lite Mode 09/18/2025:: {redeem3 && redeem3 > 0 ? redeem3 : "0"} {vaultV3 && redeem3 && redeem3 > 0 ? (
  //           <button onClick={() => redeem(vaultV3)}>Withdraw</button>
  //         ) : (
  //           <div></div>
  //         )}</p>
  //   </div>
  // );
};

export default App;
