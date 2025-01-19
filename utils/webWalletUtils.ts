import { PublicKey } from "@solana/web3.js";

export const connectPhantomWallet = async (
  setWalletAddress: (address: string) => void
) => {
  const getProvider = () => {
    if ("phantom" in window) {
      const provider = (window as any).phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    window.open("https://phantom.app/", "_blank");
  };

  const provider = getProvider();
  if (provider) {
    try {
      const resp = await provider.connect();
      setWalletAddress(resp.publicKey.toString());
      console.log(`Connected to wallet: ${resp.publicKey.toString()}`);
    } catch (err) {
      console.error("Failed to connect Phantom Wallet on web:", err);
    }
  }
};
