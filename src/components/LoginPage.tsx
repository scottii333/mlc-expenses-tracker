"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import api from "@/lib/axios";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AuthMode = "login" | "signup";
type AuthFields = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type ApiResponse = {
  message?: string;
  error?: string;
  [key: string]: unknown;
};

const labels: Record<keyof AuthFields, string> = {
  email: "Email",
  password: "Password",
  firstName: "First Name",
  lastName: "Last Name",
};

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFields>();

  const onSubmit: SubmitHandler<AuthFields> = async (data) => {
    try {
      const endpoint = mode === "signup" ? "/signup" : "/login";
      const resp = await api.post<ApiResponse>(endpoint, data);

      toast.success(
        mode === "signup" ? "Signup successful" : "Login successful",
        {
          description:
            typeof resp.data?.message === "string"
              ? resp.data.message
              : undefined,
        },
      );

      reset();
      router.push("/dashboard");
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      const msg =
        error.response?.data?.error || error.message || "Something went wrong";

      toast.error(mode === "signup" ? "Signup failed" : "Login failed", {
        description: msg,
      });
    }
  };

  return (
    <section className="relative w-full h-screen flex justify-center items-center md:justify-end">
      <Image
        alt="bg"
        src="/login-bg.png"
        fill
        style={{ objectFit: "cover" }}
        priority
      />

      <div
        className="
          absolute w-full md:w-1/2 h-full
          bg-white/30
          backdrop-blur-lg
          backdrop-saturate-150
          backdrop-contrast-125
          shadow-lg
          border border-white/30
          flex flex-col justify-center items-center
        "
      >
        <form
          className="w-full max-w-md mx-auto px-6 flex flex-col items-center space-y-6 z-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="pt-2 text-3xl font-bold text-white text-center drop-shadow mb-0">
            Hey there!
          </h2>

          <div className="mb-2 text-center text-white text-lg font-light drop-shadow">
            Is this your first time here?
          </div>

          <div className="flex w-full bg-white/10 border border-white/30 rounded-lg overflow-hidden mb-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 px-4 text-white font-medium transition border border-white/30
                ${mode === "login" ? "bg-white/15 backdrop-blur-sm" : "bg-transparent"}
              `}
              style={{
                borderRight: "1px solid rgba(255,255,255,0.2)",
                borderRadius: mode === "login" ? "0.5rem 0 0 0.5rem" : "0",
              }}
            >
              No, log me in.
            </button>

            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 px-4 text-white font-medium transition border border-white/30
                ${mode === "signup" ? "bg-white/15 backdrop-blur-sm" : "bg-transparent"}
              `}
              style={{
                borderRadius: mode === "signup" ? "0 0.5rem 0.5rem 0" : "0",
              }}
            >
              Yes, sign me up.
            </button>
          </div>

          <div className="w-full flex flex-col space-y-4">
            {mode === "signup" && (
              <div className="flex space-x-3">
                <div className="w-1/2">
                  <label className="block text-white text-sm mb-1 px-1">
                    {labels.firstName}
                  </label>
                  <input
                    {...register("firstName", { required: mode === "signup" })}
                    maxLength={30}
                    className="w-full rounded-md px-3 py-2 bg-white/30 placeholder:text-white/60 text-white font-medium outline-none border border-white/25 focus:border-white/50 transition"
                    placeholder={labels.firstName}
                  />
                  {errors.firstName && (
                    <span className="text-xs text-red-200">
                      First name is required
                    </span>
                  )}
                </div>

                <div className="w-1/2">
                  <label className="block text-white text-sm mb-1 px-1">
                    {labels.lastName}
                  </label>
                  <input
                    {...register("lastName", { required: mode === "signup" })}
                    maxLength={30}
                    className="w-full rounded-md px-3 py-2 bg-white/30 placeholder:text-white/60 text-white font-medium outline-none border border-white/25 focus:border-white/50 transition"
                    placeholder={labels.lastName}
                  />
                  {errors.lastName && (
                    <span className="text-xs text-red-200">
                      Last name is required
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="w-full">
              <label className="block text-white text-sm mb-1 px-1">
                {labels.email}
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                  validate: (value) =>
                    value.trim().toLowerCase().endsWith("@gmail.com") ||
                    "Only Gmail addresses (@gmail.com) are allowed",
                })}
                maxLength={50}
                className="w-full rounded-md px-3 py-2 bg-white/30 placeholder:text-white/60 text-white font-medium outline-none border border-white/25 focus:border-white/50 transition"
                placeholder="Email"
                type="email"
                autoComplete="email"
              />
              {errors.email && (
                <span className="text-xs text-red-200">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="w-full">
              <label className="block text-white text-sm mb-1 px-1">
                {labels.password}
              </label>

              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                maxLength={30}
                className="w-full rounded-md px-3 py-2 bg-white/30 placeholder:text-white/60 text-white font-medium outline-none border border-white/25 focus:border-white/50 transition"
                placeholder="Password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />

              {errors.password && (
                <span className="text-xs text-red-200">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="
              w-full mt-2 py-2 rounded-md
              bg-[#495947]
              text-white font-semibold text-lg
              shadow-inner
              transition
              hover:bg-[#3f4d3d]
            "
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "signup"
                ? "Creating..."
                : "Logging in..."
              : mode === "signup"
                ? "Create Account"
                : "Log In"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
