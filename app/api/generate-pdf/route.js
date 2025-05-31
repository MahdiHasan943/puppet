import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // Read HTML string from POST body (assume application/json { html: "<your html>" })
    const { html } = await request.json();

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing HTML" },
        { status: 400 }
      );
    }

    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar"
    );

    const browser = await puppeteerCore.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    // Set page content to the HTML you send
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=generated.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { message: "Error generating PDF" },
      { status: 500 }
    );
  }
}
