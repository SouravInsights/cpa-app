import { pimlicoBundlerClient } from "@/config";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useCallback, useEffect, useState } from "react";

import {
  ENTRYPOINT_ADDRESS_V07,
  type SmartAccountClient,
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import { http, type Hash, encodeFunctionData, parseAbiItem } from "viem";
import { sepolia } from "viem/chains";
import {
  useAccount,
  useDisconnect,
  usePublicClient,
  useWalletClient,
} from "wagmi";

import { toast } from "sonner";

export const usePrivyAuth = () => {
  const { login } = usePrivy();
  const { isConnected } = useAccount();
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [smartAccountAddy, setSmartAccountAddy] = useState<string>("");

  const [sendUserOpFunc, setSendUserOpFunc] = useState();

  const [smartAccountClient, setSmartAccountClient] = useState<
    SmartAccountClient<typeof ENTRYPOINT_ADDRESS_V07> | undefined
  >();

  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  const { wallets } = useWallets();

  const { data: walletClient } = useWalletClient();
  const { setActiveWallet } = useSetActiveWallet();

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  const signIn = useCallback(async () => {
    setShowLoader(true);
    login();
  }, [login]);

  const signOut = useCallback(async () => {
    setShowLoader(false);
    disconnect();
  }, [disconnect]);

  const erc20PaymasterAddress = "0x000000000041F3aFe8892B48D88b6862efe0ec8d";
  const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

  useEffect(() => {
    (async () => {
      if (isConnected && walletClient && publicClient && embeddedWallet) {
        setActiveWallet(embeddedWallet);
        const signer = walletClientToSmartAccountSigner(walletClient);
        const safeAccount = await signerToSafeSmartAccount(publicClient, {
          signer: signer,
          safeVersion: "1.4.1",
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          setupTransactions: [
            {
              to: usdcAddress,
              value: 0n,
              data: encodeFunctionData({
                abi: [
                  parseAbiItem(
                    "function approve(address spender, uint256 amount)"
                  ),
                ],
                args: [
                  erc20PaymasterAddress,
                  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
                ],
              }),
            },
          ],
        });

        console.log(
          `Smart account address: https://sepolia.etherscan.io/address/${safeAccount.address}`
        );

        setSmartAccountAddy(safeAccount.address);

        const senderUsdcBalance = await publicClient.readContract({
          abi: [
            parseAbiItem(
              "function balanceOf(address account) returns (uint256)"
            ),
          ],
          address: usdcAddress,
          functionName: "balanceOf",
          args: [safeAccount.address],
        });

        if (senderUsdcBalance < 1_000_000n) {
          throw new Error(
            `insufficient USDC balance for counterfactual wallet address ${
              safeAccount.address
            }: ${
              Number(senderUsdcBalance) / 1000000
            } USDC, required at least 1 USDC. Load up balance at https://faucet.circle.com/`
          );
        }

        console.log(
          `Smart account USDC balance: ${
            Number(senderUsdcBalance) / 1000000
          } USDC`
        );

        const smartAccountClient = createSmartAccountClient({
          account: safeAccount,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          chain: sepolia,
          bundlerTransport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC_HOST),
          middleware: {
            gasPrice: async () => {
              return (await pimlicoBundlerClient.getUserOperationGasPrice())
                .fast;
            },
            sponsorUserOperation: async (args) => {
              const gasEstimates =
                await pimlicoBundlerClient.estimateUserOperationGas({
                  userOperation: {
                    ...args.userOperation,
                    paymaster: erc20PaymasterAddress,
                  },
                });

              return {
                ...gasEstimates,
                paymaster: erc20PaymasterAddress,
              };
            },
          },
        });

        setSmartAccountClient(smartAccountClient);

        const sendUserOp = async () => {
          // console.log("data:", data);
          try {
            const gasPrices =
              await pimlicoBundlerClient.getUserOperationGasPrice();
            // const data = {
            //   to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
            //   value: 0n,
            //   data: "0x1234",
            // };
            // const formatedData = JSON.parse(data);
            // console.log("formatedData:", formatedData);
            console.log("gasPrice:", gasPrices.fast.maxFeePerGas);
            const tx = await smartAccountClient.sendTransaction({
              to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
              value: 0n,
              data: "0x1234",
            });
            console.log("Transaction sent successfully:", tx);

            toast(`Transaction sent successfully`, {
              action: {
                label: "View on Sepolia Explorer",
                onClick: () =>
                  (window.location.href = `https://sepolia.etherscan.io/tx/${txHash}`),
              },
            });
          } catch (error) {
            toast.error("Error sending Tx");
            console.error("Error:", error);
          }
        };

        await sendUserOp();

        // setSendUserOpFunc(() => await sendUserOp);
      }
    })();
  }, [isConnected, smartAccountClient]);

  const onSendTransaction = (txHash: Hash) => {
    setTxHash(txHash);
  };

  return {
    isConnected,
    showLoader,
    smartAccountClient,
    txHash,
    signIn,
    signOut,
    onSendTransaction,
    embeddedWallet,
    sendUserOpFunc,
    smartAccountAddy,
  };
};
