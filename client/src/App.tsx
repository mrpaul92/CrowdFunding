import { Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import Home from "./components/Home";
import Navbar from "./components/ui/Navbar";

function App() {
  return (
    <>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      <Navbar />
      <Box sx={{ m: 2 }} />
      <Home />
    </>
  );
}

export default App;
