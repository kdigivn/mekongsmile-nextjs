/* eslint-disable no-restricted-syntax */
/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";
import CountDown from "@/components/count-down/count-down";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, getRouteBackgroundColor } from "@/lib/utils";
import {
  PostCancelTicketRequest,
  useCancelTicketPostMutation,
} from "@/services/apis/cancel-ticket-request/cancel-ticket-request.service";
import { Order } from "@/services/apis/orders/types/order";
import { Ticket } from "@/services/apis/tickets/types/ticket";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
  useFormState,
} from "react-hook-form";
import { FiUser } from "react-icons/fi";
import * as yup from "yup";
import { toast } from "sonner";
import { TicketStatusEnum } from "@/services/apis/tickets/types/ticket-status-enum";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { OrganizationCancelTicketRefundDecreaseTypeEnum } from "@/services/apis/organizations/types/organization-setting";
import RedirectCancelTicketRequestPageDialog from "./redirect-cancel-ticket-request-page-dialog";
import { useBoolean } from "@/hooks/use-boolean";
import { useTranslation } from "@/services/i18n/client";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { ValidationErrors } from "@/services/apis/common/types/validation-errors";
import { IoWarning } from "react-icons/io5";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";

interface CancelTicketSelectSeatDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const CreateCancelTicketRequestDialog = ({
  open,
  onClose,
  order,
}: CancelTicketSelectSeatDialogProps) => {
  const openRedirectCancelTicketRequestPageDialog = useBoolean(false);
  const onCloseRedirectCancelTicketRequestPageDialog = useCallback(() => {
    openRedirectCancelTicketRequestPageDialog.onFalse();
  }, [openRedirectCancelTicketRequestPageDialog]);

  const { postCancelTicketAsync, postCancelTicketPending } =
    useCancelTicketPostMutation();
  const { settings } = useOrganizationContext();

  const { t } = useTranslation("user/cancel-ticket-request");

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (open) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, open, showNav]);

  const totalDiscount = useMemo(
    () =>
      (order?.total_ticket_price || 0) +
      (order?.total_harbor_fee || 0) -
      (order?.total_price || 0),
    [order?.total_harbor_fee, order?.total_price, order?.total_ticket_price]
  );

  /**
   * CREATE CANCEL TICKET FORM PROCESSING
   */
  const schema = yup.object().shape({
    cancel_reason: yup
      .string()
      .required(
        t(
          "dialog.create-cancel-ticket-request-dialog.form.errors.cancel_reason"
        )
      ),
    cancel_ticket_by_positions: yup
      .array()
      .min(
        1,
        t(
          "dialog.create-cancel-ticket-request-dialog.form.errors.cancel_ticket_by_positions"
        )
      ),
  });
  type FormTypes = yup.InferType<typeof schema>;

  const defaultValues: FormTypes = {
    cancel_reason: "",
    cancel_ticket_by_positions: [],
  };

  const methods = useForm<FormTypes>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, control, setValue } = methods;
  const { errors } = useFormState(methods);

  const onSubmit: SubmitHandler<FormTypes> = useCallback(
    async (data: FormTypes) => {
      const payload: PostCancelTicketRequest = {
        order_id: order?.id ?? "",
        cancel_ticket_by_positions: data.cancel_ticket_by_positions ?? [],
        cancel_reason: data.cancel_reason,
      };

      try {
        const response = await postCancelTicketAsync(payload);

        if (response.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
          throw { ...response };
        }

        toast.success(
          t("dialog.create-cancel-ticket-request-dialog.messages.success")
        );
        onClose();
        openRedirectCancelTicketRequestPageDialog.onTrue();
      } catch (error) {
        const error_res = error as ValidationErrors & Error;
        toast.error(t(`errors.${error_res.data.errors?.errorCode}`));
      }
    },
    [
      order?.id,
      postCancelTicketAsync,
      onClose,
      openRedirectCancelTicketRequestPageDialog,
      t,
    ]
  );

  /**
   * PROCESSING TABLE DATA
   */
  const tickets_data = useMemo(
    () =>
      [...(order?.tickets || [])].filter(
        (ticket) => ticket.ticket_status !== TicketStatusEnum.Cancelled
      ),
    [order?.tickets]
  );

  useEffect(() => {
    if (totalDiscount > 0) {
      const all_ids = tickets_data.map((ticket) => {
        if (ticket.ticket_status === TicketStatusEnum.Cancelled) {
          return null;
        }

        return ticket.position_id;
      });
      setValue("cancel_ticket_by_positions", all_ids);
    }
  }, [setValue, tickets_data, totalDiscount]);

  const columns: ColumnDef<unknown>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Controller
            name="cancel_ticket_by_positions"
            control={control}
            render={({ field }) => (
              <Checkbox
                disabled={totalDiscount > 0}
                checked={table.getIsAllPageRowsSelected() || totalDiscount > 0}
                onCheckedChange={(value) => {
                  table.toggleAllPageRowsSelected(!!value);
                  const all_selected = !!value;
                  const all_ids = tickets_data.map((ticket) => {
                    if (ticket.ticket_status === TicketStatusEnum.Cancelled) {
                      return null;
                    }

                    return ticket.position_id;
                  });

                  const filter_all_ids = all_ids.filter(
                    (data) => data !== null
                  );
                  field.onChange(all_selected ? filter_all_ids : []);
                }}
                aria-label="Select all"
              />
            )}
          />
        ),
        cell: ({ row }) => (
          <Controller
            name="cancel_ticket_by_positions"
            control={control}
            render={({ field }) => {
              const ticket = row.original as Ticket;
              const isDisabled =
                ticket.ticket_status === TicketStatusEnum.Cancelled ||
                (totalDiscount as number) > 0;
              return (
                <Checkbox
                  checked={(field.value ?? []).includes(ticket.position_id)}
                  onCheckedChange={(value) => {
                    const selected = value;
                    field.onChange(
                      selected
                        ? [...(field.value ?? []), ticket.position_id]
                        : (field.value ?? []).filter(
                            (id: Ticket["position_id"]) =>
                              id !== ticket.position_id
                          )
                    );
                  }}
                  aria-label="Select row"
                  disabled={isDisabled}
                />
              );
            }}
          />
        ),
      },
      // {
      //   accessorKey: "position_id",
      //   header: "Vị trí",
      // },
      {
        accessorKey: "seat_name",
        header: "Tên ghế",
        cell: ({ row }) => {
          const ticket = row.original as Ticket;
          return (
            <span>
              {ticket.seat_name} - {ticket.seat_type_code}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Giá",
        cell: ({ row }) => {
          const ticket = row.original as Ticket;
          return (
            <span>
              {formatCurrency((ticket.price ?? 0) + (ticket.harbor_fee ?? 0))}
            </span>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Khách hàng",
        cell: ({ row }) => {
          const ticket = row.original as Ticket;
          return (
            <div className="flex flex-col">
              <div className="text-sm font-semibold">{ticket.name}</div>
              <div className="text-sm">{ticket.email}</div>
              <div className="text-sm">{ticket.phone_number}</div>
              <div className="text-sm">CCCD: {ticket.social_id}</div>
            </div>
          );
        },
      },
    ],
    [control, tickets_data, totalDiscount]
  );

  const table = useReactTable({
    data: tickets_data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /**
   * HANDLE LOGIC
   */

  const renderCancelTicketRuleBaseOnOrganization = useMemo(() => {
    if (!settings?.cancel_tickets) {
      return (
        <div className="text-sm font-semibold">
          {t(
            "dialog.create-cancel-ticket-request-dialog.no_cancel_ticket_rule"
          )}
        </div>
      );
    }

    const current_operator_code = order?.voyage?.operator?.operator_code;
    const current_operator_rules =
      settings?.cancel_tickets &&
      settings?.cancel_tickets?.rules &&
      settings?.cancel_tickets?.rules
        .map((rule) => {
          if (rule.operator_code === current_operator_code) {
            return rule;
          }
          return null;
        })
        .filter((rule) => rule !== null);

    if (current_operator_rules && current_operator_rules.length === 0) {
      return (
        <div className="text-sm font-semibold">
          {t(
            "dialog.create-cancel-ticket-request-dialog.no_cancel_ticket_rule"
          )}
        </div>
      );
    }

    return (
      <div className="text-sm">
        <h4 className="mb-2 font-semibold">
          {t("dialog.create-cancel-ticket-request-dialog.cancel_ticket_rule")}
          {order?.voyage?.operator?.operator_name}
        </h4>

        <div className="flex flex-col gap-2">
          {current_operator_rules &&
            current_operator_rules.map((rule, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 rounded-md bg-gray-100 p-2"
              >
                <div className="text-sm">
                  <span className="font-semibold">
                    {t(
                      "dialog.create-cancel-ticket-request-dialog.cancel_ticket_rule_number_of_tickets"
                    )}
                    :
                  </span>{" "}
                  <span>
                    {rule.min_tickets} - {rule.max_tickets}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">
                    {t(
                      "dialog.create-cancel-ticket-request-dialog.cancel_ticket_rule_service_fee"
                    )}
                    :
                  </span>{" "}
                  <span>{formatCurrency(rule.cancel_service_fee)}</span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">
                    {t(
                      "dialog.create-cancel-ticket-request-dialog.cancel_ticket_rule_time_frame"
                    )}
                    :
                  </div>
                  {rule.time_frames &&
                    rule.time_frames.map((timeFrame, idx) => (
                      <div key={idx} className="ml-4 flex gap-2">
                        <div className="text-sm">
                          <span className="font-semibold">
                            {t(
                              "dialog.create-cancel-ticket-request-dialog.cancel_ticket_rule_time_frame_before_departure"
                            )}
                          </span>{" "}
                          <span>{timeFrame.to_hours}h</span>
                        </div>
                        <span> - </span>
                        <div className="text-sm">
                          <span className="font-semibold">
                            {t(
                              "dialog.create-cancel-ticket-request-dialog.cancel_ticket_rule_refund_amount"
                            )}
                          </span>{" "}
                          <span>
                            {timeFrame.refund_decrease_amount}{" "}
                            {timeFrame.refund_decrease_type ===
                            OrganizationCancelTicketRefundDecreaseTypeEnum.FLAT
                              ? "VND"
                              : "%"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }, [
    order?.voyage?.operator?.operator_code,
    order?.voyage?.operator?.operator_name,
    settings?.cancel_tickets,
    t,
  ]);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} modal>
        <DialogContent className="max-w-lg">
          {!order ? (
            <div>
              {t(
                "dialog.create-cancel-ticket-request-dialog.messages.no_order"
              )}
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <DialogTitle>
                  <h5>
                    {t("dialog.create-cancel-ticket-request-dialog.title", {
                      id: order.id,
                    })}
                  </h5>
                </DialogTitle>

                <div className="flex flex-col gap-2 rounded-md bg-gray-100 p-2">
                  <div className="text-sm">
                    <span className="font-semibold">
                      {t("dialog.create-cancel-ticket-request-dialog.route")}
                      :{" "}
                    </span>
                    <span
                      className={`${getRouteBackgroundColor(order.voyage?.route_id ?? "")} rounded-md px-2 py-1 text-white`}
                    >{`${order.voyage?.route?.departure_name} - ${order.voyage?.route?.destination_name}`}</span>
                  </div>

                  <div className="flex gap-1 text-sm">
                    <span className="font-semibold">
                      {t("dialog.create-cancel-ticket-request-dialog.operator")}
                      :{" "}
                    </span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={order.voyage?.operator?.operator_logo?.path}
                      />
                      <AvatarFallback>
                        <FiUser className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{order.voyage?.operator?.operator_name}</span>
                  </div>

                  <div className="text-sm">
                    <span className="font-semibold">
                      {t("dialog.create-cancel-ticket-request-dialog.boat")}
                      :{" "}
                    </span>
                    <span>{order.voyage?.boat_name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">
                      {t(
                        "dialog.create-cancel-ticket-request-dialog.departure_date"
                      )}
                      :{" "}
                    </span>
                    <span>
                      {format(
                        `${order.voyage?.departure_date}T${order.voyage?.depart_time}`,
                        "dd/MM/yyyy hh:mm"
                      )}
                    </span>
                    <span className="ml-2">
                      <span>{"("}</span>
                      <CountDown
                        targetTime={
                          new Date(
                            `${order.voyage?.departure_date}T${order.voyage?.depart_time}`
                          )
                        }
                      />
                      <span>{")"}</span>
                    </span>
                  </div>
                  <div className="flex w-full">
                    <div className="flex w-full gap-1 text-sm">
                      <span className="font-semibold">
                        {t(
                          "dialog.create-cancel-ticket-request-dialog.total-ticket"
                        )}
                        :
                      </span>

                      <span>{formatCurrency(order.total_ticket_price)}</span>
                    </div>
                    <div className="flex w-full gap-1 text-sm">
                      <span className="font-semibold">
                        {t(
                          "dialog.create-cancel-ticket-request-dialog.total-harbor-fee"
                        )}
                        :
                      </span>

                      <span>{formatCurrency(order.total_harbor_fee)}</span>
                    </div>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex w-full gap-1 text-sm text-success-500">
                      <span className="font-semibold">
                        {t(
                          "dialog.create-cancel-ticket-request-dialog.total-discount"
                        )}
                        :
                      </span>

                      <span>-{formatCurrency(totalDiscount)}</span>
                    </div>
                  )}

                  <div className="gap-1 text-sm font-semibold text-primary-500">
                    <span>
                      {t(
                        "dialog.create-cancel-ticket-request-dialog.total_amount"
                      )}
                      :
                    </span>
                    <span>{formatCurrency(order.total_price)}</span>
                  </div>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex w-full items-center justify-center gap-1 border-solid border-warning-500 bg-warning-100 p-1 align-middle">
                    <IoWarning className="h-5 w-5 text-warning-500" />
                    <span className="flex w-full justify-start">
                      {t(
                        "dialog.create-cancel-ticket-request-dialog.cancel-discount-order"
                      )}
                    </span>
                  </div>
                )}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            onClick={() => {
                              const ticket = row.original as Ticket;
                              const is_disabled =
                                ticket.ticket_status ===
                                TicketStatusEnum.Cancelled;

                              if (is_disabled) {
                                toast.error(
                                  t(
                                    "dialog.create-cancel-ticket-request-dialog.messages.already_cancelled"
                                  )
                                );
                              }
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            {t(
                              "dialog.create-cancel-ticket-request-dialog.no_results"
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {errors.cancel_ticket_by_positions && (
                  <span className="text-sm text-red-500">
                    {errors.cancel_ticket_by_positions.message}
                  </span>
                )}

                <Controller
                  name="cancel_reason"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Textarea
                        {...field}
                        placeholder={t(
                          "dialog.create-cancel-ticket-request-dialog.form.cancel_reason_placeholder"
                        )}
                        className="text-base md:text-sm"
                      />
                      {errors.cancel_reason && (
                        <span className="text-sm text-red-500">
                          {errors.cancel_reason.message}
                        </span>
                      )}
                    </>
                  )}
                />

                {renderCancelTicketRuleBaseOnOrganization}

                <DialogFooter className="flex gap-3">
                  <Button variant={"outline"} onClick={onClose}>
                    {t(
                      "dialog.create-cancel-ticket-request-dialog.buttons.cancel"
                    )}
                  </Button>
                  <Button
                    variant={"default"}
                    type="submit"
                    disabled={postCancelTicketPending}
                  >
                    {postCancelTicketPending
                      ? t(
                          "dialog.create-cancel-ticket-request-dialog.buttons.submitting"
                        )
                      : t(
                          "dialog.create-cancel-ticket-request-dialog.buttons.submit"
                        )}
                  </Button>
                </DialogFooter>
              </form>
            </FormProvider>
          )}
        </DialogContent>
      </Dialog>

      <RedirectCancelTicketRequestPageDialog
        open={openRedirectCancelTicketRequestPageDialog.value}
        onClose={onCloseRedirectCancelTicketRequestPageDialog}
      />
    </>
  );
};

export default memo(CreateCancelTicketRequestDialog);
