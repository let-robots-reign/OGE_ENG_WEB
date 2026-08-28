import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });
    }

    const allowedExtensions = /\.(mp3|wav|ogg|m4a|aac)$/i;
    if (!allowedExtensions.test(file.name)) {
      return NextResponse.json(
        { error: "Допустимы только аудиофайлы (.mp3, .wav, .ogg, .m4a, .aac)" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "audio");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/audio/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { error: "Не удалось сохранить аудиофайл" },
      { status: 500 },
    );
  }
}
