import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary only if environment variables are present
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized. Seller credentials required." },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // 3. Convert file into Node.js Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload to Cloudinary if configured, else fallback to local storage
    if (isCloudinaryConfigured) {
      console.log("☁️ Uploading image file to Cloudinary...");
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "vamika-bhargavi-boutique",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.write(buffer);
        uploadStream.end();
      });

      return NextResponse.json({
        success: true,
        url: (uploadResult as any).secure_url,
      });
    } else {
      console.warn("⚠️ Cloudinary keys not found. Falling back to local storage inside public/uploads/");
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // Dir exists
      }

      const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await writeFile(filePath, buffer);
      const relativeUrl = `/uploads/${uniqueFilename}`;

      return NextResponse.json({
        success: true,
        url: relativeUrl,
      });
    }
  } catch (error: any) {
    console.error("Image upload processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image file." },
      { status: 500 }
    );
  }
}
