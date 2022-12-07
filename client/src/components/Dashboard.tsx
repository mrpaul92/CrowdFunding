import { Box, Button, Container, Grid } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import styles from "../styles/dashboard.module.css";
import { Campaign as CampaignType } from "../types";
import Campaign from "./ui/Campaign";
import web3Context from "../contexts/web3Context";
import useWeb3Api from "../hooks/useWeb3Api";
import { BigNumber, ethers } from "ethers";
import useNotification from "../hooks/useNotification";

const Dashboard = () => {
  const { contract } = useContext(web3Context);
  const api = useWeb3Api(contract);
  const [balance, setBalance] = useState(0);
  const pendingCampaigns = useSelector((state: RootState) => state.campaign.pending);
  const completedCampaigns = useSelector((state: RootState) => state.campaign.completed);

  const getWithdrawableBalance = async () => {
    const bal = await api.getWithdrawableBalance();
    const balance = ethers.utils.formatEther(BigNumber.from(bal.toString()));
    setBalance(Number(balance));
  };

  const handleWithdraw = async () => {
    await api.withdraw();
    useNotification("Withdrawal successful!", "success");
    setBalance(0);
  };

  useEffect(() => {
    getWithdrawableBalance();
  }, []);

  return (
    <Container>
      {balance > 0 && (
        <div className={styles.withdrawContainer}>
          <Button className={styles.btn} variant="outlined" size="small" color="inherit" onClick={handleWithdraw}>
            Withdraw {balance}
          </Button>
        </div>
      )}

      <div className={styles.heading}>Pending Approval</div>
      <Grid container spacing={2}>
        {pendingCampaigns.map((campaign: CampaignType) => (
          <Grid key={campaign.id} item xs={3}>
            <Campaign key={campaign.id} {...campaign} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ m: 2 }} />
      <div className={styles.heading}>Complete Transfer</div>
      <Grid container spacing={2}>
        {completedCampaigns.map((campaign: CampaignType) => (
          <Grid key={campaign.id} item xs={3}>
            <Campaign key={campaign.id} {...campaign} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
