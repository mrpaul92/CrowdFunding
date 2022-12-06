import { createContext } from "react";

const web3Context = createContext<any>({ provider: null, signer: null, contract: null });
export default web3Context;
