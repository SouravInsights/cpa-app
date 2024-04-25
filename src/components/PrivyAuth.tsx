import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import React, { useState } from "react";
import { parseEther } from "viem";
import { Toaster, toast } from "sonner";

export const PrivyAuth: React.FC = () => {
  const {
    isConnected,
    showLoader,
    smartAccountClient,
    signIn,
    signOut,
    embeddedWallet,
    sendUserOpFunc,
  } = usePrivyAuth();

  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // const handleSend = () => {
  //   // Call the sendUserOp function with the inputValue
  //   if (isConnected && sendUserOpFunc) {
  //     sendUserOpFunc();
  //   }
  //   setInputValue(""); // Clear input after sending
  // };

  if (isConnected && smartAccountClient && embeddedWallet) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-4 items-center">
          Smart contract wallet address:{" "}
          <p className="justify-center border-b border-gray-300 backdrop-blur-2xl dark:border-neutral-800 w-auto rounded-xl border bg-gray-200 p-4 dark:bg-zinc-800/30">
            <code>{smartAccountClient.account?.address}</code>
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="flex justify-center items-center w-64 cursor-pointer border-2 border-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign out
        </button>

        <div className="flex items-center justify-center mt-8">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="border text-black border-gray-400 px-4 py-2 rounded-md mr-2 focus:outline-none focus:border-blue-500"
            placeholder="Enter data"
          />
          {/* <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-md focus:outline-none hover:bg-blue-600"
          >
            Send
          </button> */}

          <Toaster />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={signIn}
      className="flex justify-center items-center w-64 cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {!showLoader && <p className="mr-4">Sign in with Privy</p>}
      {showLoader && <div>Loading...</div>}
    </button>
  );
};
