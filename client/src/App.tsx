import { Box } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import CampaignDetails from "./components/CampaignDetails";
import Home from "./components/Home";
import Navbar from "./components/ui/Navbar";

function App() {
  return (
    <>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      <Navbar />
      <Box sx={{ m: 2 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/:slug" element={<CampaignDetails />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
