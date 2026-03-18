import { useCallback, useMemo } from "react";
import { FileEntity } from "./types/file-entity";
import useFetch from "../common/use-fetch";
import { RequestConfigType } from "../common/types/request-config";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import HTTP_CODES_ENUM from "../common/types/http-codes";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import { useMutation } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useQueryFetcher from "../common/use-query-fetcher";

export type FileUploadRequest = File;

export type FileUploadResponse = {
  file: FileEntity;
  uploadSignedUrl: string;
};

export function useFileUploadService() {
  const fetchClient = useFetch();

  return useCallback(
    async (data: FileUploadRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.files.upload);

      if (process.env.NEXT_PUBLIC_FILE_DRIVER === "s3-presigned") {
        const result = await fetchClient(requestUrl, {
          method: "POST",
          body: JSON.stringify({
            fileName: data.name,
            fileSize: data.size,
          }),
          ...requestConfig,
        }).then(wrapperFetchJsonResponse<FileUploadResponse>);

        if (result.status === HTTP_CODES_ENUM.CREATED) {
          await fetch(result.data.uploadSignedUrl, {
            method: "PUT",
            body: data,
            headers: {
              "Content-Type": data.type,
            },
          });
        }

        return result;
      } else {
        const formData = new FormData();
        formData.append("file", data);

        return fetchClient(requestUrl, {
          method: "POST",
          body: formData,
          ...requestConfig,
        }).then(wrapperFetchJsonResponse<FileUploadResponse>);
      }
    },
    [fetchClient]
  );
}

const fileQueryKeys = createQueryKeys(["files"], {
  // Adding a key for POST operation
  create: () => ({
    key: ["create"],
    // Optionally, if you need to differentiate between different POST operations, you can add parameters and dynamic values here.
  }),
});

export type FileUploadMutationRequest = File;

export type FileUploadMutationResponse = {
  file: FileEntity;
};

export function useFilePostMutation() {
  const fetch = useQueryFetcher();
  const url = buildApiPath(FerryTicketApiEndpoints.v1.files.upload);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: fileQueryKeys.create().key,
      mutationFn: async (request: FileUploadMutationRequest) => {
        const formData = new FormData();
        formData.append("file", request);
        return fetch<FileUploadMutationResponse>(url, "POST", formData);
      },
    });

  const memoizedValue = useMemo(
    () => ({
      postFile: mutate,
      postFileAsync: mutateAsync,
      postFileError: error,
      postFileSuccess: isSuccess,
      postFilePending: isPending,
      postFileReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );

  return memoizedValue;
}
