import { Box, CircularProgress } from "@mui/material";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import CampaignDetails from "./components/CampaignDetails";
import Home from "./components/Home";
import Navbar from "./components/ui/Navbar";
import useWeb3 from "./hooks/useWeb3";
import web3Context from "./contexts/web3context";
import { Container } from "@mui/system";

function App() {
  const { provider, signer, contract } = useWeb3();
  const [web3available, setWeb3available] = useState(false);
  const [web3ContextValue, setWeb3ContextValue] = useState<any>({ provider: null, signer: null, contract: null });

  const checkWeb3Availability = () => {
    if (!web3available && contract) {
      setWeb3available(true);
      setWeb3ContextValue({ provider, signer, contract });
    }
  };
  checkWeb3Availability();

  return web3available ? (
    <web3Context.Provider value={web3ContextValue}>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      <Navbar />
      <Box sx={{ m: 2 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/:slug" element={<CampaignDetails />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </web3Context.Provider>
  ) : (
    <Container style={{ display: "flex", justifyContent: "center", marginTop: "150px" }}>
      <CircularProgress color="warning" />
    </Container>
  );
}

export default App;
