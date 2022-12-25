import { Contract, providers, Signer } from "ethers";
import { createContext } from "react";

const web3Context = createContext<{ provider: providers.Web3Provider | null; signer: Signer | null; contract: Contract | null }>({ provider: null, signer: null, contract: null });
export default web3Context;
