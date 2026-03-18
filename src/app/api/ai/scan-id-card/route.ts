/* eslint-disable @arthurgeron/react-usememo/require-memo */

import { IdCardResponse } from "@/components/qr-scanner/id-card-type";
import { NcmkIdCard } from "@/components/qr-scanner/ncmk-id-card-type";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Forward POST: NCMK OCR ID Card");

  const body = await request.formData();

  const res = await fetch("https://n8n.nucuoimekong.com/webhook/ocr/id_card", {
    method: "POST",
    body: body.get("image_front") as File,
  });

  const data: NcmkIdCard = await res.json();

  console.log(data);

  if (!data) {
    return Response.json(
      { message: "Failed to get id card information" },
      { status: 500 }
    );
  }

  if (data.message === "failed") {
    return Response.json(
      {
        code: 2,
      },
      { status: 200 }
    );
  }

  const result: IdCardResponse = {
    code: 1,
    information: {
      id: data.id,
      name: data.name,
      birthday: data.birthday,
      sex: data.sex,
      nationality: data.nationality,
      address: data.address,
      birthplace: data.birthday,
      issue_date: data.issue_date,
      expiry: data.expiry,
      cmnd_id: "",
      district: "",
      district_code: "",
      document: "",
      ethnicity: "",
      father_name: "",
      father_nationality: "",
      feature: "",
      hometown: "",
      issue_by: "",
      licence_class: "",
      marital_status: "",
      military_title: "",
      mother_name: "",
      mother_nationality: "",
      mrz1: "",
      mrz2: "",
      mrz3: "",
      passport_id: "",
      passport_type: "",
      portrait_location_front: [[]],
      province: "",
      province_code: "",
      religion: "",
      representative_name: "",
      representative_nationality: "",
      spouse_name: "",
      spouse_nationality: "",
      street: "",
      type: "",
      type_blood: "",
      type_list: "",
      ward: "",
      ward_code: "",
    },
    message: "",
    request_id: "",
  };

  return Response.json(result, { status: 200 });
}

// export async function POST(request: NextRequest) {
//   console.log("Forward POST: Viettel AI ID Card");

//   const body = await request.formData();

//   const formData = new FormData();
//   formData.append("image_front", body.get("image_front") as File);
//   formData.append("token", process.env.VIETTEL_AI_TOKEN as string);
//   console.log(formData);

//   const res = await fetch("https://viettelai.vn/ekyc/id_card", {
//     method: "POST",
//     body: formData,
//   });

//   const data = await res.json();

//   console.log(data);

//   if (!data) {
//     return Response.json(
//       { message: "Failed to get id card information" },
//       { status: 500 }
//     );
//   }

//   return Response.json(data, { status: 200 });
// }
