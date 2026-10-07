import { Resend } from "resend";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      studentName = "Student",
      reportId = "",
      fileName = "Teacher-Tribe-Report.pdf",
      pdfBase64 = "",
    } = req.body || {};

    if (!reportId || !pdfBase64) {
      return res.status(400).json({ ok: false, error: "Missing report data" });
    }

    const cleanBase64 = String(pdfBase64).replace(
      /^data:application\/pdf;base64,/,
      ""
    );
    const pdfBuffer = Buffer.from(cleanBase64, "base64");

    if (pdfBuffer.length < 4 || pdfBuffer.subarray(0, 4).toString() !== "%PDF") {
      return res.status(400).json({ ok: false, error: "Invalid PDF attachment" });
    }

    if (pdfBuffer.length > 8 * 1024 * 1024) {
      return res.status(413).json({ ok: false, error: "PDF is too large to email" });
    }

    const safeFileName =
      String(fileName).replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 180) ||
      "Teacher-Tribe-Report.pdf";

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "RESEND_API_KEY is not configured in Vercel.",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const recipient =
      process.env.TEACHER_TRIBE_REPORT_RECIPIENT || "thryvemeeraki@gmail.com";
    const from =
      process.env.TEACHER_TRIBE_MAIL_FROM ||
      "Teacher Tribe Reports <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from,
      to: [recipient],
      subject: `Teacher Tribe Eligibility Report — ${studentName} — ${reportId}`,
      text: [
        "A new Teacher Tribe Eligibility Report has been generated.",
        "",
        `Student: ${studentName}`,
        `Report ID: ${reportId}`,
        `Generated: ${new Date().toISOString()}`,
        "",
        "The full PDF report is attached.",
      ].join("\n"),
      attachments: [{ filename: safeFileName, content: pdfBuffer }],
      headers: { "X-Teacher-Tribe-Report-ID": reportId },
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({
        ok: false,
        error: "Email provider rejected the message.",
      });
    }

    return res.status(200).json({
      ok: true,
      recipient,
      reportId,
      emailId: data?.id || null,
    });
  } catch (error) {
    console.error("Teacher Tribe report email failed:", error);
    return res.status(500).json({
      ok: false,
      error: "Unable to send the report email.",
    });
  }
}
