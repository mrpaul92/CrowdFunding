import { Button, Card, CardMedia, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import moment from "moment";
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useNotification from "../../hooks/useNotification";
import useWeb3Api from "../../hooks/useWeb3Api";
import { RootState, useAppDispatch } from "../../store";
import { commonActions } from "../../store/slices/common";
import styles from "../../styles/campaign.module.css";
import { CampaignApprovalStatus, CampaignStatus, UserRole } from "../../types";
import web3Context from "../../contexts/web3Context";

const Campaign = ({ ...props }) => {
  const dispatch = useAppDispatch();
  const { contract } = useContext(web3Context);
  const api = useWeb3Api(contract);
  const navigate = useNavigate();
  const mappedCategories = useSelector((state: RootState) => state.category.mappedCategories);
  const userType = useSelector((state: RootState) => state.user.type);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(0);

  const deadline = props.deadline;
  const today = Number(moment().format("X"));
  const timeDiff = Number(deadline) - today;
  const remainingTime = timeDiff > 0 ? timeDiff / (60 * 60 * 24) : 0;
  const remainingDays = remainingTime.toFixed(0);

  const goalAmount = ethers.utils.formatEther(BigNumber.from(props.goalAmount.toString()));
  const isOwner = props.isOwner == "true" ? true : false;
  let calculatedStataus = "";
  if (props.campaignStatus == CampaignStatus.Fundraising && props.campaignApprovalStatus == CampaignApprovalStatus.Created) calculatedStataus = "Pending";
  if (props.campaignStatus == CampaignStatus.Fundraising && props.campaignApprovalStatus == CampaignApprovalStatus.Approved) calculatedStataus = "Fundraising";
  if (props.campaignStatus == CampaignStatus.Fundraising && props.campaignApprovalStatus == CampaignApprovalStatus.Rejected) calculatedStataus = "Rejected";
  if (props.campaignStatus == CampaignStatus.Completed && props.campaignApprovalStatus == CampaignApprovalStatus.Approved) calculatedStataus = "Completed";
  if (props.campaignStatus == CampaignStatus.Fundraising && props.campaignApprovalStatus == CampaignApprovalStatus.Approved && props.accountBalance == 0 && props.deadline < moment().format("X"))
    calculatedStataus = "Expired";

  const campaignActionType =
    props.campaignStatus == CampaignStatus.Fundraising && props.campaignApprovalStatus == CampaignApprovalStatus.Approved && props.deadline < Number(moment().format("X")) && props.currentBalance > 0
      ? "Completed"
      : "Pending";

  const handleContribute = async (id: number) => {
    setIsContributeDialogOpen(true);
  };
  const handleAcceptCampaign = async (id: number) => {
    await api.approveCampaign(id);
    useNotification("Campaign Approved", "success");
    dispatch(commonActions.triggerRefresh({}));
  };
  const handleRejectCampaign = async (id: number) => {
    await api.rejectCampaign(id);
    useNotification("Campaign Rejected", "success");
    dispatch(commonActions.triggerRefresh({}));
  };

  const handleComplete = async (id: number) => {
    await api.completeCampaign(id);
    useNotification("Campaign completed & Fund transferred", "success");
    dispatch(commonActions.triggerRefresh({}));
  };
  const handleClose = () => {
    setIsContributeDialogOpen(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContributionAmount(parseInt(e.target.value));
  };
  const handlePayment = async () => {
    if (contributionAmount < 0.01) return useNotification("Minimum amount is required!", "error");
    if (contributionAmount > Number(goalAmount)) return useNotification("Maximum target exceeds", "error");

    setButtonDisabled(true);
    await api.contribute(props.id, contributionAmount);
    handleClose();
    dispatch(commonActions.triggerRefresh({}));
    setButtonDisabled(false);
  };

  const handleOpenCampaignDetails = (slug: string) => {
    navigate("/" + slug, {
      replace: true,
    });
  };

  return (
    <>
      <Dialog open={isContributeDialogOpen} onClose={handleClose}>
        <DialogTitle>
          Contribute for {props.name}
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

      <Card className={styles.campaign} variant="outlined">
        <div className={styles.countDown}>
          {!isOwner && (
            <div>
              <div>{remainingDays} days</div>
              <span>Remaining</span>
            </div>
          )}
          {isOwner && (
            <div>
              <div>&nbsp;</div>
              <span>&nbsp;</span>
            </div>
          )}
        </div>
        <div className={styles.header}>{mappedCategories[props.categoryId]?.name}</div>
        <CardMedia
          className={styles.imageContainer}
          component="img"
          height="180"
          image={import.meta.env.VITE_IPFS_URL + "" + props?.imageHash}
          alt={props.name}
          onClick={() => handleOpenCampaignDetails(props.slug)}
        />
        <div className={styles.footer}>
          <div className={styles.price}>
            <Grid container style={{ textAlign: "center", margin: "auto" }}>
              <Grid item xs={12}>
                {ethers.utils.formatEther(BigNumber.from(props.currentBalance.toString()))} / {ethers.utils.formatEther(BigNumber.from(props.goalAmount.toString()))}
                <br />
                <span>{import.meta.env.VITE_ALLOWED_CHAIN} Raised</span>
              </Grid>
            </Grid>
          </div>
          {isOwner && <div style={{ margin: "10px auto", textAlign: "center", fontFamily: "monospace", fontWeight: "700" }}>{calculatedStataus}</div>}
          {!isOwner && (
            <div className={styles.btnContainer}>
              {userType != UserRole.Admin && (
                <Button
                  className={styles.btn}
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => {
                    handleContribute(props.id);
                  }}
                >
                  Contribute
                </Button>
              )}
              {userType == UserRole.Admin && (
                <div>
                  {campaignActionType == "Completed" && (
                    <Button
                      className={styles.btn}
                      variant="outlined"
                      size="small"
                      color="inherit"
                      onClick={() => {
                        handleComplete(props.id);
                      }}
                    >
                      Complete Transfer
                    </Button>
                  )}
                  {campaignActionType == "Pending" && (
                    <Grid container>
                      <Grid item xs={6}>
                        <Button
                          className={styles.btn}
                          variant="outlined"
                          size="small"
                          color="inherit"
                          onClick={() => {
                            handleRejectCampaign(props.id);
                          }}
                        >
                          Reject
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          className={styles.btn}
                          variant="outlined"
                          size="small"
                          color="inherit"
                          onClick={() => {
                            handleAcceptCampaign(props.id);
                          }}
                        >
                          Accept
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default Campaign;
