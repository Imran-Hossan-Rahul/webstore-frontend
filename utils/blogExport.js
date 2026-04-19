/**
 * Blog Export Utilities
 * Enhanced export functionality for blogs
 */

import jsPDF from "jspdf";

/**
 * Export blog as PDF
 */
export async function exportToPDF(editor, title = "Blog Post") {
  if (!editor) return;

  try {
    const html = editor.getHTML();
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add title
    pdf.setFontSize(20);
    pdf.text(title, 20, 20);

    // Convert HTML to PDF (simplified - you may want to use html2canvas for better rendering)
    const text = editor.getText();
    const lines = pdf.splitTextToSize(text, 170);
    pdf.setFontSize(12);
    pdf.text(lines, 20, 40);

    // Save
    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`${title}-${timestamp}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    // Fallback: Use browser print
    window.print();
  }
}

/**
 * Export blog as HTML
 */
export function exportToHTML(editor, title = "Blog Post") {
  if (!editor) return;

  const html = editor.getHTML();
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${html}
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}-${new Date().toISOString().slice(0, 10)}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export blog as JSON
 */
export function exportToJSON(editor, title = "Blog Post") {
  if (!editor) return;

  const json = editor.getJSON();
  const exportData = {
    title,
    content: json,
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate embed code for blog/template
 */
export function generateEmbedCode(type, id, title) {
  const baseUrl = window.location.origin;
  
  if (type === "blog") {
    return `<iframe 
  src="${baseUrl}/embed/blog/${id}" 
  width="100%" 
  height="600" 
  frameborder="0"
  title="${title}"
></iframe>`;
  } else if (type === "template") {
    return `<iframe 
  src="${baseUrl}/embed/template/${id}" 
  width="100%" 
  height="600" 
  frameborder="0"
  title="${title}"
></iframe>`;
  }
  
  return "";
}

