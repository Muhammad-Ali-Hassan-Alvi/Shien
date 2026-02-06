import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configuration
const cloudConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
};

if (!cloudConfig.cloud_name || !cloudConfig.api_key || !cloudConfig.api_secret) {
    console.error("Cloudinary config missing. Please check .env.local");
}

cloudinary.config(cloudConfig);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!cloudConfig.cloud_name || !cloudConfig.api_key || !cloudConfig.api_secret) {
            return NextResponse.json({ error: "Server Configuration Error: Missing Cloudinary Credentials" }, { status: 500 });
        }

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'shein-pk-products' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({ url: result.secure_url });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
