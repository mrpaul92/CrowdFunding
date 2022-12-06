import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useNotification from "../hooks/useNotification";
import useWeb3Api from "../hooks/useWeb3Api";
import { RootState, useAppDispatch } from "../store";
import styles from "../styles/campaigndetails.module.css";
import ShareIcon from "@mui/icons-material/Share";
import useWeb3 from "../hooks/useWeb3";
import { commonActions } from "../store/slices/common";
import { BigNumber, ethers } from "ethers";
import moment from "moment";
import { CampaignApprovalStatus, CampaignStatus } from "../types";

const CampaignDetails = () => {
  const dispatch = useAppDispatch();
  const { contract } = useWeb3();
  const api = useWeb3Api();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSlug, setIsValidSlug] = useState(false);
  const [data, setData] = useState<any>(null);
  const [contributions, setContributions] = useState<any>(null);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [goalAmount, setGoalAmount] = useState("");
  const [remainingDays, setRemainingDays] = useState("");
  const [isRefreshTrigger, setIsRefreshTrigger] = useState(false);

  const connected = useSelector((state: RootState) => state.connection.connected);

  const getCampaignDetails = async () => {
    if (connected && contract) {
      if (slug) {
        api
          .getCampaignBySlug(slug)
          .then(async (data) => {
            setData(data);
            setIsValidSlug(true);
            setIsLoading(false);

            const contributionsData = await api.getCampaignContributions(data.id);
            setContributions(contributionsData);

            setGoalAmount(ethers.utils.formatEther(BigNumber.from(data.goalAmount.toString())));
            const deadline = data.deadline;
            const today = Number(moment().format("X"));
            const timeDiff = Number(deadline) - today;
            const remainingTime = timeDiff > 0 ? timeDiff / (60 * 60 * 24) : 0;
            const remainingDays = remainingTime.toFixed(0);
            setRemainingDays(remainingDays);
          })
          .catch((err) => {
            useNotification("Page not found!", "error");
          });
      }
    }
  };
  useEffect(() => {
    getCampaignDetails();
  }, [connected, contract, isRefreshTrigger]);

  const handleContribute = async (id: number) => {
    setIsContributeDialogOpen(true);
  };
  const handleClose = () => {
    setIsContributeDialogOpen(false);
  };

  const handleAmountChange = (e: any) => {
    setContributionAmount(e.target.value);
  };
  const handlePayment = async () => {
    if (contributionAmount < 0.01) return useNotification("Minimum amount is required!", "error");
    if (contributionAmount > Number(goalAmount)) return useNotification("Maximum target exceeds", "error");

    setButtonDisabled(true);
    await api.contribute(data.id, contributionAmount);
    handleClose();
    dispatch(commonActions.triggerRefresh({}));
    setIsRefreshTrigger(!isRefreshTrigger);
    setButtonDisabled(false);
  };

  return (
    <Container>
      <Dialog open={isContributeDialogOpen} onClose={handleClose}>
        <DialogTitle>
          Contribute for {data?.name}
          <br />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            1 {import.meta.env.VITE_ALLOWED_CHAIN} = 1 USD (approx)
            <br />
            Minimum amount must be 0.01 {import.meta.env.VITE_ALLOWED_CHAIN}
            <br />
            <br />
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            label="Amount"
            type="number"
            InputProps={{ inputProps: { min: 0.01, max: 100000 } }}
            fullWidth
            variant="outlined"
            required
            onChange={handleAmountChange}
          />
        </DialogContent>
        <DialogActions className={styles.dialogAction}>
          <Button className={styles.btn} variant="outlined" size="small" color="inherit" disabled={buttonDisabled} onClick={handleClose}>
            Cancel
          </Button>
          <Button className={styles.btn} variant="outlined" size="small" color="inherit" disabled={buttonDisabled} onClick={handlePayment}>
            PAY
          </Button>
        </DialogActions>
      </Dialog>

      {!connected && <div style={{ margin: "100px auto", textAlign: "center" }}> Please connect your metamask wallet</div>}
      {connected && !isValidSlug && <div style={{ margin: "100px auto", textAlign: "center" }}>No data available!</div>}
      {connected && isValidSlug && (
        <Grid container>
          <Grid item xs={12} style={{ textAlign: "center", marginBottom: "15px" }}>
            <Typography variant="h4" style={{ fontFamily: "monospace" }}>
              {data?.name}
            </Typography>
            {remainingDays != "" && <div>{remainingDays} days remaining</div>}
          </Grid>
          <Grid item xs={6}>
            <div className={styles.imageContainer}>
              <img src={import.meta.env.VITE_IPFS_URL + "" + data?.imageHash} />
            </div>
            <p>{data?.description}</p>
            <a className={styles.share} href="#">
              <ShareIcon style={{ verticalAlign: "middle", fontSize: "1rem" }} /> Share this fundraiser
            </a>
          </Grid>
          <Grid item xs={6}>
            <div className={styles.rightContainer}>
              {data?.campaignStatus == CampaignStatus.Fundraising && data?.campaignApprovalStatus == CampaignApprovalStatus.Approved && (
                <Button
                  className={styles.btn}
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => {
                    handleContribute(data.id);
                  }}
                >
                  Contribute
                </Button>
              )}
              <div className={styles.price}>
                {ethers.utils.formatEther(BigNumber.from(data?.currentBalance.toString()))} / {ethers.utils.formatEther(BigNumber.from(data?.goalAmount.toString()))}
                <br />
                <span>{import.meta.env.VITE_ALLOWED_CHAIN} Raised</span>
              </div>
              <div className={styles.contributionsContainer}>
                <div>{contributions ? contributions.length : 0} Supporters</div>
                <List dense={true}>
                  {contributions &&
                    contributions.map((item: { contributor: string; amount: BigNumber }, index: number) => (
                      <ListItem key={index}>
                        <ListItemText primary={item.contributor + " - " + ethers.utils.formatEther(BigNumber.from(item?.amount.toString()))} />
                      </ListItem>
                    ))}
                </List>
              </div>
            </div>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CampaignDetails;
