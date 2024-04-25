import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { http } from "viem";
import { sepolia } from "viem/chains";

export const pimlicoBundlerClient = createPimlicoBundlerClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_RPC_HOST),
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});
