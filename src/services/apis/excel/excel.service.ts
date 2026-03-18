/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Booking } from "../bookings/types/booking";
import { Order } from "../orders/types/order";
import { FormPassengerTicket } from "@/services/form/types/form-types";
import { PassengerConfig } from "../passengers/types/passenger";

let workbook: XLSX.WorkBook | null = null;

export const refreshWorkbook = async () => {
  if (workbook) return;
  const url = "/passengers.xls";
  workbook = XLSX.read(await (await fetch(url)).arrayBuffer(), {
    sheetRows: 20,
  });
};

export const handleExportPassengerOrder = (
  booking?: Booking,
  isReturn: boolean = false
) => {
  if (!booking) return;
  const {
    depart_order: departOrder,
    return_order: returnOrder,
    id: bookingId,
  } = booking;

  let order: Order | undefined = departOrder;
  if (isReturn) {
    order = returnOrder;
  }

  if (!workbook) {
    refreshWorkbook();
    return;
  }

  const sheetToCopy = workbook.Sheets[workbook.SheetNames[0]];
  const w = XLSX.utils.sheet_to_json(sheetToCopy, { header: 1 }) as [];
  // Clone the sheet
  const ws = XLSX.utils.aoa_to_sheet(w);

  const wsName = workbook.SheetNames[0];
  // Add data to the worksheet
  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [
        `DS. HÀNH KHÁCH CHUYẾN ${isReturn ? "VỀ" : "ĐI"} - ĐƠN HÀNG #${bookingId}`,
      ],
    ],
    {
      origin: "A1",
    }
  );

  // Merge cells from A1 to F1
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

  XLSX.utils.sheet_add_aoa(
    ws,
    [1, 2, 3].map(() => [
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
    ]),
    {
      origin: "A3",
    }
  );

  XLSX.utils.sheet_add_aoa(
    ws,
    order?.tickets?.map((ticket) => [
      [ticket.name, "none"],
      [format(new Date(ticket.date_of_birth), "dd/MM/yyy"), "none"],
      [ticket.social_id, "none"],
      [ticket.home_town, "none"],
      [ticket.national, "none"],
      [ticket.gender, "none"],
      [ticket.plate_number, "none"],
    ]) as any,
    {
      origin: "A3",
    }
  );
  // Set column B and D as text
  const range = XLSX.utils.decode_range(ws["!ref"] ?? ""); // Get the range of the worksheet
  for (let R = 2; R <= range.e.r; R += 1) {
    // For column B
    const cellAddressB = XLSX.utils.encode_cell({ r: R, c: 3 }); // Column D has index 3
    if (!ws[cellAddressB]) ws[cellAddressB] = { t: "s", v: "" }; // Create cell if it doesn't exist
    ws[cellAddressB].z = "@"; // Set cell format to text

    // For column D
    const cellAddressD = XLSX.utils.encode_cell({ r: R, c: 1 }); // Column B has index 1
    if (!ws[cellAddressD]) ws[cellAddressD] = { t: "s", v: "" }; // Create cell if it doesn't exist
    ws[cellAddressD].z = "@"; // Set cell format to text
  }

  if (!order.voyage?.operator?.configs?.passenger_inputs.gender.enable) {
    // Hide column 5
    ws["!cols"] = ws["!cols"] || [];
    ws["!cols"][5] = { hidden: true };
  }

  if (!order.voyage?.operator?.configs?.passenger_inputs.plate_number.enable) {
    // Hide column 6
    ws["!cols"] = ws["!cols"] || [];
    ws["!cols"][6] = { hidden: true };
  }

  const wb = XLSX.utils.book_new();
  wb.SheetNames.push(wsName);
  wb.Sheets[wsName] = ws;

  // Write the workbook to a file
  XLSX.writeFile(
    wb,
    `Ds_hanh_khach_chuyen_${isReturn ? "ve" : "di"}_dh_${bookingId}.xls`
  );
};

export const handleExportTemplate = (passengerConfig: PassengerConfig) => {
  if (!workbook) {
    refreshWorkbook();
    return;
  }

  const sheetToCopy = workbook.Sheets[workbook.SheetNames[0]];
  const w = XLSX.utils.sheet_to_json(sheetToCopy, { header: 1 }) as [];
  // Clone the sheet
  const ws = XLSX.utils.aoa_to_sheet(w);

  const wsName = workbook.SheetNames[0];

  // Set column B and D as text
  const range = XLSX.utils.decode_range(ws["!ref"] ?? ""); // Get the range of the worksheet
  for (let R = 2; R <= range.e.r; R += 1) {
    // For column B
    const cellAddressB = XLSX.utils.encode_cell({ r: R, c: 1 }); // Column B has index 1
    if (!ws[cellAddressB]) ws[cellAddressB] = { t: "s", v: "" }; // Create cell if it doesn't exist
    ws[cellAddressB].z = "@"; // Set cell format to text

    // For column D
    const cellAddressD = XLSX.utils.encode_cell({ r: R, c: 3 }); // Column D has index 3
    if (!ws[cellAddressD]) ws[cellAddressD] = { t: "s", v: "" }; // Create cell if it doesn't exist
    ws[cellAddressD].z = "@"; // Set cell format to text
  }

  if (!passengerConfig.gender.enable) {
    // Hide column 5
    ws["!cols"] = ws["!cols"] || [];
    ws["!cols"][5] = { hidden: true };
  }

  if (!passengerConfig.plate_number.enable) {
    // Hide column 5
    ws["!cols"] = ws["!cols"] || [];
    ws["!cols"][6] = { hidden: true };
  }

  const wb = XLSX.utils.book_new();
  wb.SheetNames.push(wsName);
  wb.Sheets[wsName] = ws;

  // Write the workbook to a file
  XLSX.writeFile(wb, "passenger-template.xls");
};

export const handleExportPassengerFromTable = (
  data?: FormPassengerTicket[],
  passengerConfig?: PassengerConfig,
  isReturn: boolean = false
) => {
  if (!workbook) {
    refreshWorkbook();
    return;
  }
  if (!data) return;
  const sheetToCopy = workbook.Sheets[workbook.SheetNames[0]];
  const w = XLSX.utils.sheet_to_json(sheetToCopy, { header: 1 }) as [];
  // Clone the sheet
  const ws = XLSX.utils.aoa_to_sheet(w);

  const wsName = workbook.SheetNames[0];

  XLSX.utils.sheet_add_aoa(
    ws,
    [[`DS. HÀNH KHÁCH CHUYẾN ${isReturn ? "VỀ" : "ĐI"}`]],
    {
      origin: "A1",
    }
  );

  // Merge cells from A1 to F1
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

  XLSX.utils.sheet_add_aoa(
    ws,
    [1, 2, 3].map(() => [
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
      ["", "none"],
    ]),
    {
      origin: "A3",
    }
  );

  XLSX.utils.sheet_add_aoa(
    ws,
    data.map((seatData) => [
      [seatData.name, "none"],
      [format(new Date(seatData.dateOfBirth), "dd/MM/yyy"), "none"],
      [seatData.socialId, "none"],
      [seatData.address, "none"],
      [seatData.nationality.name, "none"],
      [seatData.gender, "none"],
      [seatData.plateNumber, "none"],
    ]) as any,
    {
      origin: "A3",
    }
  );
  // Set column B and D as text
  const range = XLSX.utils.decode_range(ws["!ref"] ?? ""); // Get the range of the worksheet
  for (let R = 2; R <= range.e.r; R += 1) {
    // For column B
    const cellAddressB = XLSX.utils.encode_cell({ r: R, c: 3 }); // Column D has index 3
    if (!ws[cellAddressB]) ws[cellAddressB] = { t: "s", v: "" }; // Create cell if it doesn't exist
    ws[cellAddressB].z = "@"; // Set cell format to text

    // For column D
    const cellAddressD = XLSX.utils.encode_cell({ r: R, c: 1 }); // Column B has index 1
    if (!ws[cellAddressD]) ws[cellAddressD] = { t: "s", v: "" }; // Create cell if it doesn't exist
    ws[cellAddressD].z = "@"; // Set cell format to text
  }

  if (!passengerConfig?.gender.enable) {
    // Hide column 5
    ws["!cols"] = ws["!cols"] || [];
    ws["!cols"][5] = { hidden: true };
  }

  if (!passengerConfig?.plate_number.enable) {
    // Hide column 5
    ws["!cols"] = ws["!cols"] || [];
    ws["!cols"][6] = { hidden: true };
  }

  const wb = XLSX.utils.book_new();
  wb.SheetNames.push(wsName);
  wb.Sheets[wsName] = ws;

  // Write the workbook to a file
  XLSX.writeFile(
    wb,
    `Ds_hanh_khach_chuyen_${isReturn ? "ve" : "di"}_${format(new Date(), "MMddyyyyhhmmsstt")}.xls`
  );
};
