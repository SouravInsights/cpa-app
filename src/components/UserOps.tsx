import "dotenv/config";
import { writeFileSync } from "fs";
import {
  ENTRYPOINT_ADDRESS_V07,
  createSmartAccountClient,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import {
  Hex,
  createPublicClient,
  encodeFunctionData,
  http,
  parseAbiItem,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { usePrivyAuth } from "@/hooks/usePrivyAuth";

const erc20PaymasterAddress = "0x000000000041F3aFe8892B48D88b6862efe0ec8d";
const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const UserOps: React.FC = () => {
  const { isConnected, smartAccountClient, embeddedWallet } = usePrivyAuth();

  if (isConnected && smartAccountClient && embeddedWallet) {
    return (
      <div className="flex flex-col gap-4 items-center">
        Smart contract wallet address:{" "}
        <p className="justify-center border-b border-gray-300 backdrop-blur-2xl dark:border-neutral-800 w-auto rounded-xl border bg-gray-200 p-4 dark:bg-zinc-800/30">
          <code>{smartAccountClient.account?.address}</code>
        </p>
      </div>
    );
  }
};
