import { Button, Container, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useWeb3Api from "../hooks/useWeb3Api";
import { RootState, useAppDispatch } from "../store";
import Campaign from "./ui/Campaign";
import styles from "../styles/home.module.css";
import { Campaign as CampaignType, CampaignApprovalStatus, CampaignStatus, Category, UserRole } from "../types";
import Start from "./Start";
import { categoryActions } from "../store/slices/category";
import { campaignActions } from "../store/slices/campaign";
import moment from "moment";
import Dashboard from "./Dashboard";

function Home() {
  const dispatch = useAppDispatch();
  const api = useWeb3Api();
  const connected = useSelector((state: RootState) => state.connection.connected);
  const mappedCategories = useSelector((state: RootState) => state.category.mappedCategories);

  const campaigns = useSelector((state: RootState) => state.campaign.campaigns);
  const isRefreshRequired = useSelector((state: RootState) => state.common.isRefreshRequired);
  const userData = useSelector((state: RootState) => state.user);

  const [verificationAmount, setVerificationAmount] = useState(0);

  const getVerificationAmount = async () => {
    if (connected) {
      api.getVerificationAmount().then((data) => {
        setVerificationAmount(Number(data));
      });
    }
  };
  const getAllCategories = async () => {
    if (connected) {
      api.getCategories().then((data) => {
        const mappedData = data.map((item: Category) => {
          return {
            id: Number(item.id),
            name: item.name,
            status: item.status,
            timestamp: Number(item.timestamp),
          };
        });
        const filteredData = mappedData.filter((item: Category) => item.status == true);
        dispatch(categoryActions.updateCategories({ categories: filteredData }));
      });
    }
  };
  const getAllCampaigns = async () => {
    if (connected) {
      api.getCampaigns().then((data) => {
        const mappedData = data.map((item: CampaignType) => {
          return {
            id: Number(item.id),
            name: item.name,
            description: item.description,
            imageHash: item.imageHash,
            goalAmount: Number(item.goalAmount),
            currentBalance: Number(item.currentBalance),
            deadline: Number(item.deadline),
            categoryId: Number(item.categoryId),
            campaignStatus: item.campaignStatus,
            campaignApprovalStatus: item.campaignApprovalStatus,
            status: item.status,
            timestamp: Number(item.timestamp),
          };
        });

        const filteredData = mappedData.filter(
          (item: CampaignType) =>
            item.status == true && item.campaignApprovalStatus == CampaignApprovalStatus.Approved && item.campaignStatus == CampaignStatus.Fundraising && item.deadline > Number(moment().format("X"))
        );
        const filteredPendingData = mappedData.filter(
          (item: CampaignType) => item.status == true && item.campaignApprovalStatus == CampaignApprovalStatus.Created && item.campaignStatus == CampaignStatus.Fundraising
        );
        const filteredCompletedData = mappedData.filter(
          (item: CampaignType) =>
            item.status == true &&
            item.campaignApprovalStatus == CampaignApprovalStatus.Approved &&
            item.campaignStatus == CampaignStatus.Fundraising &&
            item.deadline < Number(moment().format("X")) &&
            item.currentBalance > 0
        );
        const filteredExpiredData = mappedData.filter(
          (item: CampaignType) =>
            item.status == true &&
            item.campaignApprovalStatus == CampaignApprovalStatus.Approved &&
            item.campaignStatus == CampaignStatus.Fundraising &&
            item.deadline < Number(moment().format("X")) &&
            item.currentBalance == 0
        );
        const filteredSuccessfulData = mappedData.filter(
          (item: CampaignType) =>
            item.status == true && item.campaignApprovalStatus == CampaignApprovalStatus.Approved && item.campaignStatus == CampaignStatus.Completed && item.deadline < Number(moment().format("X"))
        );
        dispatch(
          campaignActions.updateCampaigns({ campaigns: filteredData, pending: filteredPendingData, completed: filteredCompletedData, expired: filteredExpiredData, successful: filteredSuccessfulData })
        );
      });
    }
  };

  useEffect(() => {
    getVerificationAmount();
    getAllCategories();
    getAllCampaigns();
  }, [connected, isRefreshRequired]);

  return (
    <>
      {userData.type == UserRole.Admin ? (
        <Dashboard />
      ) : (
        <Container>
          {!connected && (
            <>
              <div style={{ margin: "100px auto", textAlign: "center" }}>
                No data available!
                <br />
                Please connect your metamask wallet
              </div>
            </>
          )}
          {connected && (
            <>
              <Start minAmount={verificationAmount} />
              <div className={styles.heading}>All Campaigns</div>
              <Grid container spacing={2}>
                {campaigns.map((campaign: CampaignType) => (
                  <Grid key={campaign.id} item xs={3}>
                    <Campaign key={campaign.id} {...campaign} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>
      )}
    </>
  );
}

export default Home;
