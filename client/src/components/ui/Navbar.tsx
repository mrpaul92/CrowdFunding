import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import { RootState, useAppDispatch } from "../../store";
import { useSelector } from "react-redux";
import styles from "../../styles/navbar.module.css";
import useNotification from "../../hooks/useNotification";
import useWeb3 from "../../hooks/useWeb3";
import { connectionActions } from "../../store/slices/connection";
import { useEffect, useState } from "react";
import { utils } from "ethers";
import useWeb3Api from "../../hooks/useWeb3Api";
import { userActions } from "../../store/slices/user";

const allowedChainID = Number(import.meta.env.VITE_ALLOWED_CHAINID);

function Navbar() {
  const dispatch = useAppDispatch();
  const { provider } = useWeb3();
  const api = useWeb3Api();
  const [balance, setBalance] = useState("");
  const [name, setName] = useState("");
  const connected = useSelector((state: RootState) => state.connection.connected);
  const account = useSelector((state: RootState) => state.connection.account);
  const chainAllowed = useSelector((state: RootState) => state.connection.chainAllowed);
  const chainId = useSelector((state: RootState) => state.connection.chainId);

  const getUserData = async () => {
    const data = await api.getCurrentUser();
    if (data.status) {
      setName(data.name);
      dispatch(userActions.updateUser({ type: data.role, name: data.name, email: data.email }));
    }
  };

  useEffect(() => {
    if (account) {
      getUserData();
      provider?.getBalance(account).then((balance) => {
        const bal = utils.formatEther(balance.toString());
        setBalance(bal);
      });
    }
  }, [account]);

  const handleWalletConnect = () => {
    if (!chainAllowed) return useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "error");
    if (provider) {
      provider
        .send("eth_requestAccounts", [])
        .then(async (accounts) => {
          if (accounts.length > 0) {
            const networkDetails = await provider.getNetwork();
            if (networkDetails.chainId == allowedChainID) {
              dispatch(connectionActions.updateConnection({ connected: true, account: accounts[0], chainAllowed: true, chainId: networkDetails.chainId }));
            }
          }
        })
        .catch((err) => {
          useNotification("Please try again!", "error");
        });
    }
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <Typography className={styles.logo} variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Logo.
          </Typography>
          {!connected && (
            <Button className={styles.connect} variant="outlined" size="small" color="inherit" onClick={handleWalletConnect}>
              Connect Wallet
            </Button>
          )}
          {connected && !chainAllowed && <span className={styles.networkInvalid}>Wrong Network!</span>}
          {connected && chainAllowed && (
            <Box sx={{ flexGrow: 0 }}>
              <div style={{ fontSize: "0.8rem", textAlign: "right", fontWeight: "bold" }}>{name}</div>
              <div style={{ fontSize: "0.8rem", textAlign: "right" }}>{account}</div>
              <div style={{ fontSize: "0.6rem", textAlign: "right", fontWeight: "bold" }}>
                {import.meta.env.VITE_ALLOWED_CHAIN} {Number(balance).toFixed(4)}
              </div>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
