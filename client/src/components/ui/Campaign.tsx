import { Button, Card, CardActionArea, CardContent, CardMedia, Grid } from "@mui/material";
import React from "react";
import { Campaign as CampaignType } from "../../types";
import styles from "../../styles/campaign.module.css";

const Campaign = ({ ...props }) => {
  const handleContribute = () => {};
  return (
    <>
      <Card className={styles.campaign} variant="outlined">
        <div className={styles.countDown}>
          12 days
          <br />
          <span>Remaining</span>
        </div>
        <div className={styles.header}>{props?.categoryName}</div>
        <CardMedia className={styles.imageContainer} component="img" height="180" image={import.meta.env.VITE_IPFS_URL + "" + props?.imageHash} alt="name" />
        <div className={styles.footer}>
          <div className={styles.price}>
            <Grid container style={{ textAlign: "center", margin: "auto" }}>
              <Grid item xs={12}>
                500 / 1200
                <br />
                <span>{import.meta.env.VITE_ALLOWED_CHAIN} Raised</span>
              </Grid>
            </Grid>
          </div>
          <div className={styles.btnContainer}>
            <Button className={styles.btn} variant="outlined" size="small" color="inherit" onClick={handleContribute}>
              Contribute
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Campaign;
