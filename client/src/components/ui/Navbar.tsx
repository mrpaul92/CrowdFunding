import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abiJSON from "../../abi/abi.json";
import { RootState, useAppDispatch } from "../../store";
import { ethersActions } from "../../store/slices/ethers";
import { useSelector } from "react-redux";
import styles from "../../styles/navbar.module.css";
import useNotification from "../../hooks/useNotification";

const allowedChainID = Number(import.meta.env.VITE_ALLOWED_CHAINID);
const getethereumobject = () => (window as any).ethereum;

function Navbar() {
  const dispatch = useAppDispatch();
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const chainAllowed = useSelector((state: RootState) => state.ethers.chainAllowed);

  useEffect(() => {
    const ethereum = getethereumobject();
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, abiJSON.abi, signer);

      // Detect Network change & validate allowed chain
      provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          window.location.reload();
        }
        // chain validation
        if (newNetwork.chainId !== allowedChainID) {
          dispatch(ethersActions.updateChainStatus({ chainAllowed: false }));
          useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "warning");
        }
      });

      provider
        .send("eth_accounts", [])
        .then((accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setConnected(true);
            dispatch(ethersActions.updateEthers({ provider, signer, contract }));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const handleWalletConnect = () => {
    if (!chainAllowed) return useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "error");
    const ethereum = getethereumobject();
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, abiJSON.abi, signer);
    provider
      .send("eth_requestAccounts", [])
      .then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          dispatch(ethersActions.updateEthers({ provider, signer, contract }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DCrowdFunding
          </Typography>
          {!connected && (
            <Button className={styles.connect} variant="outlined" size="small" color="inherit" onClick={handleWalletConnect}>
              Connect Wallet
            </Button>
          )}
          {connected && !chainAllowed && <span className={styles.networkInvalid}>Wrong Network!</span>}
          {connected && chainAllowed && <span>{account}</span>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
