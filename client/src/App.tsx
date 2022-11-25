import { ToastContainer } from "react-toastify";
import Navbar from "./components/ui/Navbar";

function App() {
  return (
    <>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      <Navbar />
    </>
  );
}

export default App;
