"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import { RiShieldLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/services/i18n/client";

interface IssueTicketLoaderProps {
  className?: string;
  isSuccess?: boolean;

  isCountdownFinished?: boolean;
  countdown: number | null;
}

function IssueTicketLoader({
  className,
  isSuccess = false,
  isCountdownFinished = false,
  countdown,
}: IssueTicketLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <LoadingState key="loading" />
        ) : (
          <SuccessState
            key="success"
            isCountdownFinished={isCountdownFinished}
            countdown={countdown}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingState() {
  const { t } = useTranslation("booking");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-4 h-24 w-24"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-primary-500 opacity-25"
        ></motion.div>
        <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800"></div>
        <RiShieldLine className="absolute inset-0 h-full w-full text-primary-500 dark:text-primary-400" />
        <FiLock className="absolute inset-0 m-auto h-10 w-10 text-primary-700 dark:text-primary-300" />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"
      >
        {t("payment.loader.title")}
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400"
      >
        {t("payment.loader.description")}
      </motion.p>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex space-x-2"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className="h-3 w-3 rounded-full bg-primary-500"
          ></motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

interface IssueTicketSuccessProps {
  isCountdownFinished?: boolean;
  countdown: number | null;
}

function SuccessState({
  isCountdownFinished,
  countdown,
}: IssueTicketSuccessProps) {
  const { t } = useTranslation("booking");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-4 h-24 w-24"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-green-500 opacity-25"
        ></motion.div>
        <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800"></div>
        <FiCheckCircle className="absolute inset-0 h-full w-full text-green-500 dark:text-green-400" />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"
      >
        {t("export-ticket-modal.success")}
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400"
      >
        {isCountdownFinished ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex space-x-2"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="h-3 w-3 rounded-full bg-primary-500"
              ></motion.div>
            ))}
          </motion.div>
        ) : (
          <>
            {t("payment.redirect-success", {
              second: countdown && countdown > 0 ? countdown : "",
            })}
          </>
        )}
      </motion.p>
    </motion.div>
  );
}

export default memo(IssueTicketLoader);
