import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const useNotification = (message: string, type?: "warning" | "success" | "info" | "error") => {
  const options: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  };
  switch (type) {
    case "error":
      toast.error(message, options);
      break;
    case "success":
      toast.success(message, options);
      break;
    case "warning":
      toast.warn(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    default:
      toast(message, options);
      break;
  }
};

export default useNotification;
