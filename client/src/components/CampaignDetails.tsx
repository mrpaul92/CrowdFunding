import { Container } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useNotification from "../hooks/useNotification";
import useWeb3Api from "../hooks/useWeb3Api";
import { RootState, useAppDispatch } from "../store";

const CampaignDetails = () => {
  const dispatch = useAppDispatch();
  const api = useWeb3Api();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSlug, setIsValidSlug] = useState(false);
  const [data, setData] = useState(null);

  const connected = useSelector((state: RootState) => state.connection.connected);

  const getCampaignDetails = async () => {
    if (connected) {
      if (slug) {
        try {
          const data = await api.getCampaignBySlug(slug);
          setData(data);
          setIsValidSlug(true);
          setIsLoading(false);
        } catch (err) {
          useNotification("Page not found!", "error");
        }
      }
    }
  };
  useEffect(() => {
    getCampaignDetails();
  }, [connected]);

  return (
    <Container>
      {!isValidSlug && <div style={{ margin: "100px auto", textAlign: "center" }}>No data available!</div>}
      {isValidSlug && <div style={{ margin: "100px auto", textAlign: "center" }}>Yes data available!</div>}
    </Container>
  );
};

export default CampaignDetails;
