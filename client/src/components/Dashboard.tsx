import { Box, Container, Grid } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import styles from "../styles/dashboard.module.css";
import { Campaign as CampaignType } from "../types";
import Campaign from "./ui/Campaign";

const Dashboard = () => {
  const pendingCampaigns = useSelector((state: RootState) => state.campaign.pending);
  const completedCampaigns = useSelector((state: RootState) => state.campaign.completed);
  return (
    <Container>
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
