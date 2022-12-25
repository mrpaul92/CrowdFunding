import { Contract, ethers, providers, Signer } from "ethers";
import { useEffect, useState } from "react";
import abiJSON from "../abi/abi.json";
import { useAppDispatch } from "../store";
import { connectionActions } from "../store/slices/connection";
import useNotification from "./useNotification";

const allowedChainID = Number(import.meta.env.VITE_ALLOWED_CHAINID);
const getethereumobject = () => (window as any).ethereum;

const useWeb3 = () => {
  const dispatch = useAppDispatch();
  const [returnData, setReturnData] = useState<{ provider: providers.Web3Provider | null; signer: Signer | null; contract: Contract | null }>({ provider: null, signer: null, contract: null });

  useEffect(() => {
    const ethereum = getethereumobject();
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, abiJSON.abi, signer);

      setReturnData({ provider, signer, contract });

      // Detect Network change & validate allowed chain
      provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          window.location.reload();
        }
        if (newNetwork.chainId !== allowedChainID) {
          dispatch(connectionActions.updateConnection({ connected: false, account: "", chainAllowed: false, chainId: 0 }));
          // useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "warning");
        }
      });
      // on account change
      ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      provider
        .send("eth_accounts", [])
        .then(async (accounts) => {
          if (accounts.length > 0) {
            const networkDetails = await provider.getNetwork();
            if (networkDetails.chainId == allowedChainID) {
              dispatch(connectionActions.updateConnection({ connected: true, account: accounts[0], chainAllowed: true, chainId: networkDetails.chainId }));
            }
          } else {
            // check chain only
            const networkDetails = await provider.getNetwork();
            if (networkDetails.chainId == allowedChainID) {
              dispatch(connectionActions.updateConnection({ connected: false, account: "", chainAllowed: true, chainId: networkDetails.chainId }));
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      useNotification("Please install MetaMask & connect to " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "error");
    }
  }, []);

  return { provider: returnData.provider, signer: returnData.signer, contract: returnData.contract };
};
export default useWeb3;
