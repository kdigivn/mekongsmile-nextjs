"use client";

import { memo } from "react";
import FacebookAuth from "./facebook/facebook-auth";
import { isFacebookAuthEnabled } from "./facebook/facebook-config";
import GoogleAuth from "./google/google-auth";
import { isGoogleAuthEnabled } from "./google/google-config";

function SocialAuth() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {isGoogleAuthEnabled && (
        <div className="flex w-full gap-4">
          <GoogleAuth />
        </div>
      )}
      {isFacebookAuthEnabled && (
        <div className="flex gap-4">
          <FacebookAuth />
        </div>
      )}
    </div>
  );
}

export default memo(SocialAuth);
