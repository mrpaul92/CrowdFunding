import { Button, Card, CardMedia, Grid } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import moment from "moment";
import { useSelector } from "react-redux";
import useNotification from "../../hooks/useNotification";
import useWeb3Api from "../../hooks/useWeb3Api";
import { RootState, useAppDispatch } from "../../store";
import { commonActions } from "../../store/slices/common";
import styles from "../../styles/campaign.module.css";
import { CampaignApprovalStatus, CampaignStatus, UserRole } from "../../types";

const Campaign = ({ ...props }) => {
  const dispatch = useAppDispatch();
  const api = useWeb3Api();
  const mappedCategories = useSelector((state: RootState) => state.category.mappedCategories);
  const userType = useSelector((state: RootState) => state.user.type);

  const deadline = props.deadline;
  const today = Number(moment().format("X"));
  const timeDiff = Number(deadline) - today;
  const remainingTime = timeDiff > 0 ? timeDiff / (60 * 60 * 24) : 0;
  const remainingDays = remainingTime.toFixed(0);

  const campaignActionType =
    props.campaignStatus == CampaignStatus.Fundraising && props.campaignApprovalStatus == CampaignApprovalStatus.Approved && props.deadline < Number(moment().format("X")) && props.currentBalance > 0
      ? "Completed"
      : "Pending";

  const handleContribute = () => {};
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

  return (
    <>
      <Card className={styles.campaign} variant="outlined">
        <div className={styles.countDown}>
          <div>{remainingDays} days</div>
          <span>Remaining</span>
        </div>
        <div className={styles.header}>{mappedCategories[props.categoryId]?.name}</div>
        <CardMedia className={styles.imageContainer} component="img" height="180" image={import.meta.env.VITE_IPFS_URL + "" + props?.imageHash} alt="name" />
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
          <div className={styles.btnContainer}>
            {userType != UserRole.Admin && (
              <Button className={styles.btn} variant="outlined" size="small" color="inherit" onClick={handleContribute}>
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
        </div>
      </Card>
    </>
  );
};

export default Campaign;
