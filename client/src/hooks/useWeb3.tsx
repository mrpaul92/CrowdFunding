import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import abiJSON from "../abi/abi.json";
import { RootState, useAppDispatch } from "../store";
import { connectionActions } from "../store/slices/connection";
import useNotification from "./useNotification";

const allowedChainID = Number(import.meta.env.VITE_ALLOWED_CHAINID);
const getethereumobject = () => (window as any).ethereum;

const useWeb3 = () => {
  const dispatch = useAppDispatch();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [contract, setContract] = useState<ethers.Contract>();

  const connected = useSelector((state: RootState) => state.connection.connected);
  const account = useSelector((state: RootState) => state.connection.account);
  const chainAllowed = useSelector((state: RootState) => state.connection.chainAllowed);
  const chainId = useSelector((state: RootState) => state.connection.chainId);

  useEffect(() => {
    const ethereum = getethereumobject();
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, abiJSON.abi, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);

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

  return { provider, signer, contract };
};
export default useWeb3;
