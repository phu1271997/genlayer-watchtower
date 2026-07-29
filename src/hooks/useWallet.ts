import { useEffect, useState } from "react";
import { generatePrivateKey, getGenLayerClient } from "../genlayerClient";

export function useWallet() {
  const [privateKey, setPrivateKey] = useState<string>("");
  const [activeAddress, setActiveAddress] = useState<string>("");

  useEffect(() => {
    let key = localStorage.getItem("watchtower_private_key");
    if (!key) {
      key = generatePrivateKey();
      localStorage.setItem("watchtower_private_key", key);
    }
    setPrivateKey(key);
  }, []);

  useEffect(() => {
    if (!privateKey) return;
    try {
      const client = getGenLayerClient(privateKey);
      if (client.account) {
        setActiveAddress(client.account.address);
      }
    } catch (error) {
      console.error("Failed to extract address from key", error);
    }
  }, [privateKey]);

  const replacePrivateKey = (value: string) => {
    setPrivateKey(value);
    localStorage.setItem("watchtower_private_key", value);
  };

  return { privateKey, activeAddress, setPrivateKey: replacePrivateKey };
}
