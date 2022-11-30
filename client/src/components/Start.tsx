import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import useNotification from "../hooks/useNotification";
import { RootState, useAppDispatch } from "../store";
import styles from "../styles/signup.module.css";
import useWeb3Api from "../hooks/useWeb3Api";
import { userActions } from "../store/slices/user";
import { UserRole } from "../types";
import moment from "moment";
import { ethers } from "ethers";
import { commonActions } from "../store/slices/common";
import { create } from "ipfs-http-client";
const ipfs = create({
  host: import.meta.env.VITE_IPFS_HOST,
  port: import.meta.env.VITE_IPFS_PORT,
  protocol: import.meta.env.VITE_IPFS_PROTOCOL,
});

const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 100000;

const Start = (props: { minAmount: number }) => {
  const dispatch = useAppDispatch();
  const api = useWeb3Api();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const cNameRef = useRef<HTMLInputElement>(null);
  const cDescriptionRef = useRef<HTMLInputElement>(null);
  const cGoalRef = useRef<HTMLInputElement>(null);
  const cDeadlineRef = useRef<HTMLInputElement>(null);

  const chainAllowed = useSelector((state: RootState) => state.connection.chainAllowed);
  const isRegistered = useSelector((state: RootState) => state.user.isRegistered);

  const categories = useSelector((state: RootState) => state.category.categories);

  const [open, setOpen] = useState(false);
  const [signUpFormError, setSignUpFormError] = useState(false);
  const [createCampaignFormError, setCreateCampaignFormError] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const deadlineMinValue = dayjs(moment().add(2, "days").toISOString());
  const [categorySelected, setCategorySelected] = useState("");
  const [file, setFile] = useState(null);

  const handleClickOpen = () => {
    if (!chainAllowed) return useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "error");
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleSignUp = async () => {
    if (!chainAllowed) return useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "error");
    if (nameRef.current?.value && emailRef.current?.value) {
      setButtonDisabled(true);
      setSignUpFormError(false);
      await api.createUser(nameRef.current.value, emailRef.current.value);
      nameRef.current.value = "";
      emailRef.current.value = "";
      setButtonDisabled(false);
      useNotification("Successfully Signed Up!", "success");
      dispatch(userActions.updateUser({ isRegistered: true, type: UserRole.Fundraiser, name: nameRef.current.value, email: emailRef.current.value }));
    } else {
      setSignUpFormError(true);
      setButtonDisabled(false);
    }
  };

  const handleChangeCategory = (e: SelectChangeEvent) => {
    setCategorySelected(e.target.value);
  };
  const handleDeadlineChange = () => {};

  const handleCreateCampaign = async () => {
    if (!chainAllowed) return useNotification("Please connect to the " + import.meta.env.VITE_ALLOWED_CHAIN + " Network", "error");
    if (
      cNameRef.current?.value &&
      cDescriptionRef.current?.value &&
      Number(cGoalRef.current?.value) >= MIN_AMOUNT &&
      Number(cGoalRef.current?.value) <= MAX_AMOUNT &&
      cDeadlineRef.current?.value &&
      categorySelected &&
      file
    ) {
      setButtonDisabled(true);
      setCreateCampaignFormError(false);

      // upload the file
      const { path } = await ipfs.add(file);
      const ipfsHash = path;

      const formatDate = cDeadlineRef.current.value.split("/");
      const formattedDate = formatDate[2] + "/" + formatDate[1] + "/" + formatDate[0];

      await api.addCampaign(
        {
          _name: cNameRef.current.value,
          _description: cDescriptionRef.current.value,
          _goalAmount: ethers.utils.parseUnits("" + cGoalRef.current?.value + "", "ether"),
          _deadline: Number(moment(formattedDate).format("X")),
          _categoryId: Number(categorySelected),
          _imageHash: ipfsHash,
          _files: [],
        },
        props.minAmount
      );

      setFile(null);
      cNameRef.current.value = "";
      cDescriptionRef.current.value = "";
      cDeadlineRef.current.value = "";
      setCategorySelected("");
      setButtonDisabled(false);
      handleClose();
      useNotification("Campaign created & sent for validation!", "success");
      dispatch(commonActions.triggerRefresh({}));
    } else {
      setCreateCampaignFormError(true);
      setButtonDisabled(false);
    }
  };

  const captureFile = async (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };

  return (
    <>
      <div className={styles.fundraiserSignup}>
        <Button className={styles.btn} variant="outlined" size="small" color="inherit" onClick={handleClickOpen}>
          Start a Fundraiser Campaign
        </Button>
      </div>

      {!isRegistered && (
        <>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
              Please Signup to get Started
              <br />
            </DialogTitle>
            <DialogContent>
              <DialogContentText>Enter your full name & email address to get started</DialogContentText>
              <TextField inputRef={nameRef} error={signUpFormError} autoFocus margin="dense" id="name" label="Your Name" type="text" fullWidth variant="outlined" required />
              <TextField inputRef={emailRef} error={signUpFormError} autoFocus margin="dense" id="email" label="Email Address" type="email" fullWidth variant="outlined" required />
            </DialogContent>
            <DialogActions>
              <Button disabled={buttonDisabled} onClick={handleClose}>
                Cancel
              </Button>
              <Button disabled={buttonDisabled} onClick={handleSignUp}>
                Signup
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {isRegistered && (
        <>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Start a Fundraiser Campaign</DialogTitle>
            <DialogContent>
              <DialogContentText>
                - Verification fee is (0.01 {import.meta.env.VITE_ALLOWED_CHAIN}).
                <br />- Verification time approx 24 hours.
                <br />
                <br />
              </DialogContentText>
              <FormControl error={createCampaignFormError} fullWidth variant="outlined">
                <InputLabel id="campaign-category">Campaign Category</InputLabel>
                <Select value={categorySelected} labelId="campaign-category" id="campaign-category" label="Campaign Category" onChange={handleChangeCategory} required>
                  {categories.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField inputRef={cNameRef} error={createCampaignFormError} autoFocus margin="dense" id="campaignName" label="Campaign Name" type="text" fullWidth variant="outlined" required />
              <TextField
                inputRef={cDescriptionRef}
                error={createCampaignFormError}
                multiline
                rows={3}
                autoFocus
                margin="dense"
                id="campaignDescription"
                label="Campaign Description"
                type="text"
                fullWidth
                variant="outlined"
                required
              />
              <TextField
                inputRef={cGoalRef}
                error={createCampaignFormError}
                InputProps={{ inputProps: { min: 0.01, max: 100000 } }}
                autoFocus
                margin="dense"
                id="campaignGoalAmount"
                label={"Goal Amount (" + import.meta.env.VITE_ALLOWED_CHAIN + ")"}
                type="number"
                fullWidth
                variant="outlined"
                required
              />
              <br />
              <br />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={4}>
                  <DesktopDatePicker
                    inputRef={cDeadlineRef}
                    label="Campaign Deadline"
                    inputFormat="DD/MM/YYYY"
                    minDate={deadlineMinValue}
                    value={deadlineMinValue}
                    onChange={handleDeadlineChange}
                    renderInput={(params) => <TextField {...params} required />}
                  />
                </Stack>
              </LocalizationProvider>
              <br />
              <input type="file" accept="image/*" onChange={captureFile} />
            </DialogContent>
            <DialogActions>
              <Button disabled={buttonDisabled} onClick={handleClose}>
                Cancel
              </Button>
              <Button disabled={buttonDisabled} onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default Start;
