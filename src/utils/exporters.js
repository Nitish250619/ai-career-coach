import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

/**
 * Capture a preview DOM node to PDF.
 * @param {string} elementId - DOM id of the preview container
 * @param {string} filename - e.g., "Resume.pdf"
 */
export async function exportPreviewToPDF(elementId, filename = "Resume.pdf") {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error("Preview element not found:", elementId);
    return;
  }

  // Make sure the preview fits an A4 width for better results
  const canvas = await html2canvas(node, {
    scale: 2, // crisp
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Fit the image into the page keeping aspect ratio
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  if (imgHeight < pageHeight) {
    // center vertically
    y = (pageHeight - imgHeight) / 2;
  }

  // If content taller than one page, split into multiple pages
  let remainingHeight = imgHeight;
  let position = y;

  const pageCanvasHeight = (canvas.width * pageHeight) / pageWidth;

  while (remainingHeight > 0) {
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    remainingHeight -= pageHeight;
    if (remainingHeight > 0) {
      pdf.addPage();
      position = 0;
    }
  }

  pdf.save(filename);
}

/**
 * Build a simple, ATS-friendly DOCX from data.
 * @param {object} data - resume data object
 * @param {string} filename - e.g., "Resume.docx"
 */
export async function exportToDocx(data, filename = "Resume.docx") {
  const {
    name,
    title,
    summary,
    contact = {},
    skills = [],
    experience = [],
    education = [],
    projects = [],
  } = data || {};

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: name || "Your Name",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: title || "",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: [
              contact.email,
              contact.phone,
              contact.location,
              contact.website,
              contact.linkedin,
              contact.github,
            ]
              .filter(Boolean)
              .join("  |  "),
          }),

          // Summary
          new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: summary || "" }),

          // Skills
          new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: skills.join(", ") }),

          // Experience
          new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }),
          ...experience.flatMap((exp) => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.role || "", bold: true }),
                new TextRun({ text: ` · ${exp.company || ""}` }),
                new TextRun({ text: ` (${exp.period || ""})`, italics: true }),
              ],
            }),
            ...((exp.bullets || []).map(
              (b) => new Paragraph({ text: `• ${b}` })
            )),
          ]),

          // Projects
          projects.length
            ? new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_2 })
            : null,
          ...projects.flatMap((p) => [
            new Paragraph({
              children: [
                new TextRun({ text: p.name || "", bold: true }),
                p.link ? new TextRun({ text: `  –  ${p.link}`, italics: true }) : null,
              ].filter(Boolean),
            }),
            new Paragraph({ text: p.details || "" }),
          ]),

          // Education
          new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }),
          ...education.flatMap((ed) => [
            new Paragraph({
              children: [
                new TextRun({ text: ed.school || "", bold: true }),
                new TextRun({ text: ` · ${ed.degree || ""}` }),
                new TextRun({ text: ` (${ed.period || ""})`, italics: true }),
              ],
            }),
          ]),
        ].filter(Boolean),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
