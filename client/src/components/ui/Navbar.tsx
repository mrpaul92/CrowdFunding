import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import { RootState, useAppDispatch } from "../../store";
import { useSelector } from "react-redux";
import styles from "../../styles/navbar.module.css";
import useNotification from "../../hooks/useNotification";
import { connectionActions } from "../../store/slices/connection";
import { useContext, useEffect, useState } from "react";
import { utils } from "ethers";
import useWeb3Api from "../../hooks/useWeb3Api";
import { userActions } from "../../store/slices/user";
import web3Context from "../../contexts/web3Context";

const allowedChainID = Number(import.meta.env.VITE_ALLOWED_CHAINID);

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { provider, contract } = useContext(web3Context);
  const api = useWeb3Api(contract);
  const [balance, setBalance] = useState("");
  const [name, setName] = useState("");
  const connected = useSelector((state: RootState) => state.connection.connected);
  const account = useSelector((state: RootState) => state.connection.account);
  const chainAllowed = useSelector((state: RootState) => state.connection.chainAllowed);
  const chainId = useSelector((state: RootState) => state.connection.chainId);

  const handleLogoClick = () => {
    window.location = "/" as any;
  };

  const getUserData = async () => {
    if (account) {
      const data = await api.getCurrentUser();
      if (data.status) {
        setName(data.name);
        dispatch(userActions.updateUser({ type: data.role, name: data.name, email: data.email }));
      }
    }
  };

  const getBalance = async () => {
    if (provider) {
      const bal = await provider.getBalance(account);
      const balance = utils.formatEther(bal.toString());
      setBalance(balance);
    }
  };

  useEffect(() => {
    getUserData();
    getBalance();
  }, [account]);

  const handleWalletConnect = () => {
    if (!chainAllowed) return useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "error");
    if (provider) {
      provider
        .send("eth_requestAccounts", [])
        .then(async (accounts: any) => {
          if (accounts.length > 0) {
            const networkDetails = await provider.getNetwork();
            if (networkDetails.chainId == allowedChainID) {
              dispatch(connectionActions.updateConnection({ connected: true, account: accounts[0], chainAllowed: true, chainId: networkDetails.chainId }));
            }
          }
        })
        .catch(() => {
          useNotification("Please try again!", "error");
        });
    }
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <Typography className={styles.logo} variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={handleLogoClick}>
            FundRaiser
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
};

export default Navbar;
