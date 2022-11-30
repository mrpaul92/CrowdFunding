import { Button, Container, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useWeb3Api from "../hooks/useWeb3Api";
import { RootState, useAppDispatch } from "../store";
import Campaign from "./ui/Campaign";
import styles from "../styles/home.module.css";
import { Campaign as CampaignType, CampaignApprovalStatus, CampaignStatus, Category } from "../types";
import Signup from "./Signup";
import { categoryActions } from "../store/slices/category";
import { campaignActions } from "../store/slices/campaign";

function Home() {
  const dispatch = useAppDispatch();
  const api = useWeb3Api();
  const connected = useSelector((state: RootState) => state.connection.connected);
  const categories = useSelector((state: RootState) => state.category.categories);
  const mappedCategories = useSelector((state: RootState) => state.category.mappedCategories);
  const campaigns = useSelector((state: RootState) => state.campaign.campaigns);
  const isRefreshRequired = useSelector((state: RootState) => state.common.isRefreshRequired);

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
            status: item.status,
            timestamp: Number(item.timestamp),
          };
        });
        const filteredData = mappedData.filter(
          (item: CampaignType) => item.status == true && item.campaignApprovalStatus == CampaignApprovalStatus.Approved && item.campaignStatus == CampaignStatus.Fundraising
        );
        dispatch(campaignActions.updateCampaigns({ campaigns: filteredData, mappedCategories }));
      });
    }
  };

  useEffect(() => {
    console.log("called", isRefreshRequired);

    getVerificationAmount();
    getAllCategories();
    getAllCampaigns();
  }, [connected, isRefreshRequired]);

  return (
    <>
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
            <Signup minAmount={verificationAmount} />
            <div className={styles.heading}>All Campaigns</div>
            <Grid container spacing={2}>
              {categories.map((category: Category) => (
                <Grid key={category.id} item xs={3}>
                  <Campaign key={category.id} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </>
  );
}

export default Home;
