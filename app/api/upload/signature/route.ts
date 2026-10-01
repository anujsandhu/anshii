import { NextRequest, NextResponse } from "next/server";
import { generateSignedUploadParams } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "anshii_birthday_uploads";

    const params = generateSignedUploadParams(folder);

    if (!params) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary credentials not configured on server.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      ...params,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
