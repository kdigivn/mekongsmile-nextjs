/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiUpload, FiX } from "react-icons/fi";
import { useFileUploadService } from "@/services/apis/files/files.service";
import { FileEntity } from "@/services/apis/files/types/file-entity";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type AvatarInputProps = {
  error?: string;
  onChange: (value: FileEntity | null) => void;
  onBlur: () => void;
  value?: FileEntity;
  disabled?: boolean;
};

function AvatarInput(props: AvatarInputProps) {
  const { onChange, value, disabled, error } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const fetchFileUpload = useFileUploadService();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      const { status, data } = await fetchFileUpload(acceptedFiles[0]);
      if (status === HTTP_CODES_ENUM.CREATED) {
        onChange(data.file);
      }
      setIsLoading(false);
    },
    [fetchFileUpload, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 2, // 2MB
    disabled: isLoading || disabled,
  });

  const removeAvatarHandle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onChange(null);
  };

  return (
    <div
      {...getRootProps()}
      className="mt-4 flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-gray-400"
    >
      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-xl font-bold text-white">
            {t("common:formInputs.avatarInput.dropzoneText")}
          </p>
        </div>
      )}
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={value?.path} />
          <AvatarFallback>
            <FiUpload className="h-12 w-12 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        {value && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute -right-2 -top-2"
            onClick={removeAvatarHandle}
          >
            <FiX className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-4">
        <Button disabled={isLoading}>
          {isLoading
            ? t("common:loading")
            : t("common:formInputs.avatarInput.selectFile")}
          <input {...getInputProps()} />
        </Button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {t("common:formInputs.avatarInput.dragAndDrop")}
      </p>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function FormAvatarInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <AvatarInput
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
        />
      )}
    />
  );
}

export default FormAvatarInput;
