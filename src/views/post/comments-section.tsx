"use client";

import HeadingBase from "@/components/heading/heading-base";
import { Button } from "@/components/ui/button";
import useAuth from "@/services/auth/use-auth";
import { Comment } from "@/services/infrastructure/wordpress/types/comment";
import { yupResolver } from "@hookform/resolvers/yup";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import InputField from "./form/input-field";
import { toast } from "sonner";
import CommentTextarea from "./form/comment-textarea";
import { formatRelativeTime } from "@/lib/utils";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import { buildApiPath } from "@/services/apis/build-api-path";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import dynamic from "next/dynamic";
import type { ReCAPTCHAProps } from "react-google-recaptcha";
import type ReCAPTCHAType from "react-google-recaptcha";
import useRecaptcha from "@/hooks/use-recaptcha";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
}) as React.ForwardRefExoticComponent<
  ReCAPTCHAProps & React.RefAttributes<ReCAPTCHAType>
>;
export type CommentFormData = {
  commentOn: number;
  author?: string;
  authorEmail?: string;
  authorUrl?: string;
  content: string;
};

type Props = {
  postId: number;
  comments: Comment[];
  type?: "product" | "post";
};

const CommentsSection = ({ postId, type }: Props) => {
  const { user, isAuthenticated } = useAuth();
  const allowAnonymousComment = process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS_COMMENT
    ? process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS_COMMENT === "true"
    : true;
  const [commentNews, setComments] = useState<Comment[]>([]);

  const {
    reCaptchaRef,
    handleReCaptchaChange,
    executeRecaptcha,
    resetReCaptchaRef,
  } = useRecaptcha();

  let schema = yup.object().shape({
    commentOn: yup.number().required(),
    author: yup.string(),
    authorEmail: yup.string().email(),
    authorUrl: yup.string().url(),
    content: yup.string().required("Nội dung bình luận không được để trống!"),
  });

  if (!allowAnonymousComment && !isAuthenticated) {
    schema = yup.object().shape({
      commentOn: yup.number().required(),
      author: yup.string().required("Họ và tên không được để trống!"),
      authorEmail: yup.string().email().required("Email không được để trống!"),
      authorUrl: yup.string().url(),
      content: yup.string().required("Nội dung bình luận không được để trống!"),
    });
  }

  const methods = useForm(
    useMemo(
      () => ({
        resolver: yupResolver(schema),
        defaultValues: {
          commentOn: postId ?? -1,
          author: user?.customer.first_name ?? "",
          authorEmail: user?.customer.email ?? "",
          authorUrl: user?.customer.photo?.path ?? "",
          content: "",
        },
      }),
      [
        postId,
        schema,
        user?.customer.email,
        user?.customer.first_name,
        user?.customer.photo?.path,
      ]
    )
  );

  const { handleSubmit, control, reset } = methods;

  const onSubmit = async (formData: CommentFormData) => {
    const token = await executeRecaptcha();

    if (token) {
      const requestUrl = buildApiPath(FerryTicketApiEndpoints.cms.comment);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Adjust the content type as needed
        },
        body: JSON.stringify(formData), // Convert formData to JSON if it's an object
      });

      if (!response.ok) {
        // Handle the error
        toast.error("Có lỗi xảy ra khi gửi bình luận!");
        return;
      } else {
        toast.success("Bình luận của bạn đã được gửi! Chờ duyệt để hiển thị.");
        await getComments(); // Đảm bảo await để chờ hàm fetch comment
      }
      resetReCaptchaRef();
      reset();
    } else {
      toast.error(
        "Không thể xác minh reCAPTCHA. Vui lòng tắt trình chặn quảng cáo (ad blocker) và thử lại."
      );
    }
  };
  const getComments = useCallback(async () => {
    let fetchUrl;

    // Kiểm tra type để xác định URL phù hợp
    if (type === "product") {
      fetchUrl = buildApiPath(
        FerryTicketApiEndpoints.cms.commentByProductId(postId)
      );
    } else if (type === "post") {
      fetchUrl = buildApiPath(
        FerryTicketApiEndpoints.cms.commentByPostId(postId)
      );
    } else {
      throw new Error(`Invalid type: ${type}`);
    }

    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Adjust the content type as needed
      },
    });
    // Kiểm tra phản hồi đã thành công (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Trích xuất JSON từ phản hồi
    const data = await response.json();
    setComments(data);
  }, [postId, type]);

  useEffect(() => {
    getComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);
  // const pushComments = useCallback(async () => {
  //   for (const item of data) {
  //     await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for 15 seconds
  //     await fetch(buildApiPath(FerryTicketApiEndpoints.cms.comment), {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         commentOn: postId,
  //         content: item.review,
  //         author: item.name,
  //       } as CommentFormData),
  //     });
  //     const requestUrl = buildApiPath(FerryTicketApiEndpoints.cms.rating);

  //     await fetch(requestUrl, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         post_id: postId,
  //         rating: item.rating,
  //       }),
  //     });
  //     toast.success(`Pushed comment from ${item.name}`);
  //   }
  // }, [postId]);

  const renderCommentFormRequiredInfo = () => {
    return (
      <div className="grid grid-cols-12 gap-1.5">
        <InputField
          control={control}
          label="Họ và Tên"
          type="text"
          name="author"
          formItemClassName="col-span-6 w-full items-center gap-1.5"
          inputClassName="!p-3"
          isRequired
        />

        <InputField
          control={control}
          label="Email"
          type="email"
          name="authorEmail"
          formItemClassName="col-span-6 w-full items-center gap-1.5"
          inputClassName="!p-3"
          isRequired
        />

        <CommentTextarea
          control={control}
          label="Nội dung"
          name="content"
          placeholder="Nhập nội dung bình luận..."
          formItemClassName="col-span-12 w-full items-center gap-1.5"
          inputClassName="!p-3"
          isRequired
        />

        <Button
          type="submit"
          className="col-span-12 w-full flex-none content-end items-center px-6 md:col-span-2 md:col-start-11"
        >
          <div className="flex flex-none flex-row justify-center gap-1.5">
            Gửi bình luận
          </div>
        </Button>
      </div>
    );
  };

  const renderCommentFormAnonymous = () => {
    return (
      <div className="mb-2 flex flex-col gap-1.5 md:flex-row">
        {/* <Label htmlFor="content">Nội dung</Label> */}

        <InputField
          control={control}
          placeholder="Nhập nội dung bình luận..."
          type="textarea"
          name="content"
          formItemClassName="w-full flex items-center !p-0 w-full "
          inputClassName="!p-0 w-full px-3"
        />

        <Button
          type="submit"
          className="w-full flex-none px-6 text-base sm:w-fit md:self-end"
          aria-label="Submit comment"
        >
          Gửi bình luận
        </Button>
      </div>
    );
  };

  const renderUserLoggedInCommentForm = () => {
    return (
      <div className="flex flex-row items-start gap-1.5">
        <Avatar className="flex h-9 w-9 flex-none flex-col items-center justify-center overflow-hidden rounded-full">
          <AvatarImage
            src={user?.customer.photo?.path}
            className="h-full w-full bg-white object-cover"
          />
          <AvatarFallback className="bg-primary text-white">
            {`${user?.customer.last_name?.[0] ?? ""}${
              user?.customer.first_name?.[0] ?? ""
            }`}
          </AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col gap-1.5 md:flex-row">
          <InputField
            control={control}
            placeholder="Nhập nội dung bình luận..."
            name="content"
            type="textarea"
            formItemClassName="w-full flex items-center !p-0 w-full justify-end"
            inputClassName="!p-0 w-full px-3"
          />
          <Button
            type="submit"
            className="w-full flex-none px-6 text-base sm:w-fit md:self-end"
          >
            Gửi bình luận
          </Button>
        </div>
      </div>
    );
  };
  const commentPerPage = 5;

  const [currentPage, setCurrentPage] = useState(1); // Start at page 1

  const commentPaging = useCallback(() => {
    setCurrentPage((prevPage) => prevPage + 1);
  }, []);

  const subComments = commentNews.slice(0, currentPage * commentPerPage);

  return (
    <div
      id="comments-section"
      className="flex w-full flex-col gap-4 rounded-md border-1 border-solid border-white bg-white p-3"
    >
      <HeadingBase>Bình luận</HeadingBase>
      {/* <Button onClick={pushComments}>Push bình luận</Button> */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {!isAuthenticated &&
            !allowAnonymousComment &&
            renderCommentFormRequiredInfo()}
          {!isAuthenticated &&
            allowAnonymousComment &&
            renderCommentFormAnonymous()}
          {isAuthenticated && renderUserLoggedInCommentForm()}
          <ReCAPTCHA
            ref={reCaptchaRef}
            sitekey={
              process.env.NEXT_PUBLIC_RECAPTCHA_V2_INVISIBLE_SITE_KEY ?? ""
            }
            onChange={handleReCaptchaChange}
            size="invisible"
          />
        </form>
      </FormProvider>
      <div className="flex w-full flex-col gap-4">
        {/* {commentNews.map((comment, idx) => {
          return <CommentItem comment={comment} key={idx} />;
        })} */}
        {subComments.map((comment, idx) => (
          <CommentItem comment={comment} key={idx} />
        ))}
        {currentPage * commentPerPage < commentNews.length && (
          <Button type="button" className="w-full" onClick={commentPaging}>
            Xem thêm bình luận
          </Button>
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment }: { comment: Comment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="flex w-full flex-row items-start gap-4">
      {/* <Avatar
        src={
          comment.author.node.url
            ? comment.author.node.url !== ""
              ? comment.author.node.url
              : comment.author.node.avatar?.url !== ""
                ? comment.author.node.avatar?.url
                : ""
            : comment.author.node.avatar?.url !== ""
              ? comment.author.node.avatar?.url
              : ""
        }
        alt={comment.author.node.name}
        className="h-10 w-10 flex-none rounded-full"
        size="sm"
      >
        {comment.author.node.name}
      </Avatar> */}
      <Avatar className="flex h-10 w-10 flex-col items-center justify-center overflow-hidden rounded-full">
        <AvatarImage
          src={
            comment.author.node.url
              ? comment.author.node.url !== ""
                ? comment.author.node.url
                : comment.author.node.avatar?.url !== ""
                  ? comment.author.node.avatar?.url
                  : ""
              : comment.author.node.avatar?.url !== ""
                ? comment.author.node.avatar?.url
                : ""
          }
          className="h-full w-full bg-white object-cover"
        />
        <AvatarFallback className="bg-primary text-white">
          {comment.author.node.name?.[0] ?? ""}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-col">
          <p className="text-sm font-bold">
            {comment.author.node.name ?? "Vô danh"}
          </p>
          <p className="text-xs font-normal text-default-600">
            {formatRelativeTime(comment.date)}
          </p>
        </div>
        <div
          onClick={toggle}
          className={`${isOpen ? "" : "line-clamp-2"} cursor-pointer text-sm font-normal`}
          dangerouslySetInnerHTML={{
            __html: sanitizeCmsHtml(comment.content ?? ""),
          }}
        />
      </div>
    </div>
  );
};

export default memo(CommentsSection);
