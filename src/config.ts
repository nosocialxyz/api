import fs from "fs";
import path from "path";

const fileLensHub = fs.readFileSync(
  path.join(__dirname, "abis/lens-hub-contract-abi.json"),
  "utf8"
);
const fileLensPeriphery = fs.readFileSync(
  path.join(__dirname, "abis/lens-periphery-data-provider.json"),
  "utf8"
);
const fileFollowNFT = fs.readFileSync(
  path.join(__dirname, "abis/lens-follow-nft-contract-abi.json"),
  "utf8"
);

const getParamOrExit = (name: string) => {
  const param = process.env[name];
  if (!param) {
    console.error(`Required config param '${name}' missing`);
    process.exit(1);
  }
  return param;
};

const getParam = (name: string) => {
  const param = process.env[name];
  if (!param) {
    return "";
  }
  return param;
};

export const explicitStart = (filename: string) => {
  const scriptName = path.basename(process.argv[1]);
  return path.basename(filename).includes(scriptName);
};

export const PK = getParamOrExit("PK");

export const MUMBAI_RPC_URL = getParamOrExit("MUMBAI_RPC_URL");

export const LENS_API = getParamOrExit("LENS_API");

export const LENS_HUB_CONTRACT = getParamOrExit("LENS_HUB_CONTRACT");

export const LENS_PERIPHERY_CONTRACT = getParamOrExit(
  "LENS_PERIPHERY_CONTRACT"
);

export const LENS_PERIPHERY_NAME = "LensPeriphery";

export const PROFILE_ID = getParam("PROFILE_ID");

export const LENS_FOLLOW_NFT_ABI = JSON.parse(fileFollowNFT);

export const LENS_HUB_ABI = JSON.parse(fileLensHub);

export const LENS_PERIPHERY_ABI = JSON.parse(fileLensPeriphery);

export const INFURA_PROJECT_ID = getParam("INFURA_PROJECT_ID");

export const INFURA_SECRET = getParam("INFURA_SECRET");

export const PORT = getParam("PORT");

export const MONGO_SERVER = getParam("MONGO_SERVER");

export const LENS_DATA_LIMIT = 50;

export const DB_NAME = getParamOrExit('DB_NAME');
export const PROFILE_COLL = 'profile';
export const PUBLICATION_COLL = 'publication';
export const CURSOR_COLL = 'cursor';
export const WHITELIST_COLL = 'whitelist';
export const ACHIEVEMENT_COLL = 'achievement';
export const AI_COLL = 'ai';
export const TASK_COLL = 'task';
export const APP_COLL = 'app';
export const ACHV_TMPL_COLL = 'achv_tmpl'
export const BENEFIT_TMPL_COLL = 'benefit_tmpl'
export const TASK_TMPL_COLL = 'task_tmpl'
export const WAITING_COLL = "waiting";
export const NFT_COLL = "nfts";
