import { BigNumber, ethers } from "ethers";
import { AddCampaignPayload } from "../types";
import useWeb3 from "./useWeb3";

const useWeb3Api = () => {
  const { contract } = useWeb3();
  const getCurrentUser = async () => {
    if (contract) {
      const data = await contract.getCurrentUser();
      return data;
    }
  };
  const getUserContributions = async () => {
    if (contract) {
      const data = await contract.getUserContributions();
      return data;
    }
  };
  const getCampaignContributions = async (id: number) => {
    if (contract) {
      const data = await contract.getCampaignContributions(id);
      return data;
    }
  };
  const getVerificationAmount = async () => {
    if (contract) {
      const data = await contract.getVerificationAmount();
      return data;
    }
  };
  const getContactEmail = async () => {
    if (contract) {
      const data = await contract.getContactEmail();
      return data;
    }
  };
  const getCategories = async () => {
    if (contract) {
      const data = await contract.getCategories();
      return data;
    }
  };
  const getCampaigns = async () => {
    if (contract) {
      const data = await contract.getAllCampaigns();
      return data;
    }
  };
  const createCategory = async (name: string) => {
    if (contract) {
      const txn = await contract.createCategory(name);
      await txn.wait();
      return txn;
    }
  };
  const deleteCategory = async (id: number) => {
    if (contract) {
      const txn = await contract.deleteCategory(id);
      await txn.wait();
      return txn;
    }
  };
  const createUser = async (name: string, email: string) => {
    if (contract) {
      const txn = await contract.createUser(name, email);
      await txn.wait();
      return txn;
    }
  };
  const addCampaign = async (data: AddCampaignPayload, minAmount: number) => {
    if (contract) {
      const payableAmount = ethers.utils.formatEther(BigNumber.from(minAmount.toString()));
      const txn = await contract.addCampaign(data, { value: ethers.utils.parseEther(payableAmount) });
      await txn.wait();
      return txn;
    }
  };
  const approveCampaign = async (id: number) => {
    if (contract) {
      const txn = await contract.approveCampaign(id);
      await txn.wait();
      return txn;
    }
  };
  const rejectCampaign = async (id: number) => {
    if (contract) {
      const txn = await contract.rejectCampaign(id);
      await txn.wait();
      return txn;
    }
  };
  const completeCampaign = async (id: number) => {
    if (contract) {
      const txn = await contract.completeCampaign(id);
      await txn.wait();
      return txn;
    }
  };
  return {
    getCurrentUser,
    getUserContributions,
    getCampaignContributions,
    getVerificationAmount,
    getContactEmail,
    getCategories,
    getCampaigns,
    createCategory,
    deleteCategory,
    createUser,
    addCampaign,
    approveCampaign,
    rejectCampaign,
    completeCampaign,
  };
};
export default useWeb3Api;