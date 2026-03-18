"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnpayLoaderProps {
  className?: string;
  loadingText?: string;
}

function OnepayLoader({ className, loadingText }: OnpayLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800",
        className
      )}
    >
      <div className="relative">
        <motion.div
          className="h-32 w-32 rounded-full border-4 border-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
          <span className="font-bold text-blue-500">OnePay</span>
        </div>
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute h-3 w-3 rounded-full bg-blue-500"
            style={{
              top: `${50 - 50 * Math.cos((index * Math.PI) / 4)}%`,
              left: `${50 + 50 * Math.sin((index * Math.PI) / 4)}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.25,
            }}
          />
        ))}
      </div>
      <motion.p
        className="ml-2 mt-4 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loadingText}
      </motion.p>
    </div>
  );
}

export default memo(OnepayLoader);
