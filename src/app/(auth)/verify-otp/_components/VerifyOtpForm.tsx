"use client";

import { LoaderIcon } from "@/icons";
import { errorModification } from "@/lib/errors/errorModification";
import { useVerifyOtpMutation } from "@/redux/api/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function VerifyOTpForm() {
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const router = useRouter();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newInputs = [...codeInputs];
    newInputs[index] = value;

    setCodeInputs(newInputs);
    setError("");

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `code-${index + 1}`,
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      const prevInput = document.getElementById(
        `code-${index - 1}`,
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = codeInputs.join("");

    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    const signUpToken = sessionStorage.getItem("signUpToken");

    // router.push("/reset-password");
    try {
      const res = await verifyOtp({
        otp: fullCode,
      }).unwrap();
      if (signUpToken) {
        sessionStorage.removeItem("signUpToken");
        router.replace("/login");
        setCodeInputs(["", "", "", "", "", ""]);
        setError("");
        return;
      }

      if (res?.data?.token) {
        sessionStorage.removeItem("forgotPasswordToken");
        sessionStorage.setItem("resetPasswordToken", res?.data?.token);
        router.replace("/reset-password");
        setCodeInputs(["", "", "", "", "", ""]);
        setError("");
      }
    } catch (error) {
      const err = errorModification(error);
      toast.error(err);
      setError(err);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newInputs = [...codeInputs];
    for (let i = 0; i < 6; i++) {
      newInputs[i] = pasted[i] || "";
    }
    setCodeInputs(newInputs);
    setError("");

    // focus the next empty box, or the last box if all filled
    const nextIndex = pasted.length < 6 ? pasted.length : 5;
    const nextInput = document.getElementById(
      `code-${nextIndex}`,
    ) as HTMLInputElement;
    nextInput?.focus();
  };

  return (
    <div className="w-full xl:max-w-4xl md:max-w-xl mx-auto rounded-2xl bg-white p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="text-center">
        <h1 className="mb-3 lg:text-3xl md:text-2xl text-xl font-bold text-primary-black">
         Enter Verification Code
        </h1>
        <p className="mb-4 text-primary-black max-w-xl mx-auto">
          We've sent a verification code to your email. Enter the code below to continue resetting your password.
        </p>

        <div className="mb-8">
          <div className="flex justify-center gap-2">
            {codeInputs.map((value, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="size-14 rounded-full border border-primary-black text-center text-xl font-semibold transition-colors focus:border-primary-black focus:outline-none hover:border-gray-400"
              />
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-gray-900 py-2.5 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderIcon className="-ml-1 mr-3" />
              Verifying...
            </span>
          ) : (
            "Verify Code"
          )}
        </button>
      </form>
    </div>
  );
}
