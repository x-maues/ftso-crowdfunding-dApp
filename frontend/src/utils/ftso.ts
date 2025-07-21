import { Web3 } from "web3";
import { interfaceToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";

// Constants
const FTSOV2_ADDRESS = "0x3d893C53D9e8056135C26C8c638B76C8b60Df726";
const RPC_URL = "https://coston2-api.flare.network/ext/C/rpc";
const FLR_USD_FEED_ID = "0x01464c522f55534400000000000000000000000000";

// Initialize Web3 and contract
const web3 = new Web3(RPC_URL);
const ftsov2Abi = interfaceToAbi("FtsoV2Interface", "coston2");
const ftsov2Contract = new web3.eth.Contract(ftsov2Abi, FTSOV2_ADDRESS);

export interface FtsoPriceData {
  price: number;
  decimals: number;
  timestamp: number;
}

type FtsoResponse = [string[], number[], number[]];


 //Fetches the current FLR/USD price from FTSO
 
 
export async function getFlrUsdPrice(): Promise<FtsoPriceData> {
  try {
    const result = await ftsov2Contract.methods.getFeedsById([FLR_USD_FEED_ID]).call() as FtsoResponse;
    console.log("Raw FTSO response:", result);
    
    return {
      price: Number(result[0][0]),
      decimals: Number(result[1][0]),
      timestamp: Number(result[2][0])
    };
  } catch (error) {
    console.error("Error fetching FLR/USD price from FTSO:", error);
    throw new Error(`Failed to fetch FLR/USD price from FTSO: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export function formatFlrUsdPrice(price: number, decimals: number): string {
  try {
    const scaledPrice = price / Math.pow(10, decimals);
    return scaledPrice.toString();
  } catch (error) {
    console.error("Error formatting FLR/USD price:", error);
    return "0";
  }
}


export async function getFormattedFlrUsdPrice(): Promise<string> {
  try {
    const { price, decimals } = await getFlrUsdPrice();
    return formatFlrUsdPrice(price, decimals);
  } catch (error) {
    console.error("Error in getFormattedFlrUsdPrice:", error);
    return "0";
  }
} 