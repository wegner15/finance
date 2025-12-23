import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

export async function generateProfessionalQuotePDF(quote: any, company: any, client: any, project: any, env?: any) {
  const pdfDoc = await PDFDocument.create();

  // Standard Fonts
  const fontRegular = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  // Config
  const margin = 50;
  const contentWidth = width - (margin * 2);
  let y = height - margin;

  // Colors
  const colorPrimary = rgb(0.23, 0.51, 0.96); // #3B82F6 (Blue-500)
  const colorDark = rgb(0.1, 0.1, 0.1);
  const colorLightGray = rgb(0.6, 0.6, 0.6);
  const colorTableHeader = rgb(0.12, 0.16, 0.23); // Slate-900
  const colorTableAlt = rgb(0.97, 0.98, 0.99); // Slate-50
  const colorBorder = rgb(0.9, 0.9, 0.9);

  // Helpers
  const sanitize = (text: string | null | undefined) => (text || '').replace(/\r/g, '');

  const drawText = (text: string, x: number, y: number, font: PDFFont, size: number, color = colorDark, options: any = {}) => {
    page.drawText(sanitize(text), { x, y, font, size, color, ...options });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = colorBorder, thickness = 1) => {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness });
  };

  // --- HEADER ---

  // Logo (Simulated or Real)
  let logoEmbedded = false;
  if (company?.logo_url && env?.BUCKET) {
    try {
      const logoKey = company.logo_url.startsWith('/') ? company.logo_url.slice(1) : company.logo_url;
      const logoObject = await env.BUCKET.get(logoKey);
      if (logoObject) {
        const logoBytes = await logoObject.arrayBuffer();
        let logoImage;
        if (company.logo_url.toLowerCase().endsWith('.png')) {
          logoImage = await pdfDoc.embedPng(logoBytes);
        } else if (company.logo_url.toLowerCase().match(/\.(jpg|jpeg)$/)) {
          logoImage = await pdfDoc.embedJpg(logoBytes);
        }
        if (logoImage) {
          const logoDims = logoImage.scaleToFit(120, 60);
          page.drawImage(logoImage, {
            x: margin,
            y: y - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
          });
          logoEmbedded = true;
        }
      }
    } catch (e) {
      console.error('Logo embed failed', e);
    }
  }

  if (!logoEmbedded) {
    // Placeholder Logo Text if no image
    drawText(company?.name?.toUpperCase() || 'COMPANY', margin, y - 20, fontBold, 20, colorPrimary);
  }

  // Quote Details (Right Aligned)
  const quoteLabel = 'QUOTE';
  const quoteLabelWidth = fontBold.widthOfTextAtSize(quoteLabel, 30);
  drawText(quoteLabel, width - margin - quoteLabelWidth, y - 25, fontBold, 30, colorDark);

  y -= 60;

  const metaX = width - margin - 150;
  const metaLabelX = metaX - 20;

  drawText(`#${quote.id}`, width - margin - fontBold.widthOfTextAtSize(`#${quote.id}`, 12), y, fontBold, 12, colorLightGray);
  y -= 25;

  const dateFn = (d: string | undefined) => d ? new Date(d).toLocaleDateString() : new Date().toLocaleDateString();

  const drawMeta = (label: string, value: string) => {
    const sanitizedVal = sanitize(value);
    const wVal = fontRegular.widthOfTextAtSize(sanitizedVal, 10);
    drawText(label, width - margin - wVal - 70, y, fontRegular, 10, colorLightGray);
    drawText(sanitizedVal, width - margin - wVal, y, fontRegular, 10, colorDark);
    y -= 15;
  };

  drawMeta('Date:', dateFn(quote.created_at));
  drawMeta('Valid Until:', new Date(Date.now() + (quote.validity_period || 30) * 86400000).toLocaleDateString());
  if (project) drawMeta('Project:', project.name);

  y -= 20;

  // --- ADDRESSES ---
  const topAddressY = y;

  // From
  y = topAddressY;
  drawText('FROM', margin, y, fontBold, 9, colorLightGray);
  y -= 15;
  if (company) {
    drawText(company.name, margin, y, fontBold, 11, colorDark);
    y -= 15;
    const details = [company.email, company.phone, company.address].filter(Boolean);
    details.forEach(d => {
      drawText(d, margin, y, fontRegular, 10, colorDark);
      y -= 14;
    });
  }

  // To
  y = topAddressY;
  const rightColX = width / 2 + 20;
  drawText('TO', rightColX, y, fontBold, 9, colorLightGray);
  y -= 15;
  if (client) {
    drawText(client.name, rightColX, y, fontBold, 11, colorDark);
    y -= 15;
    const details = [client.email, client.phone, client.address].filter(Boolean);
    details.forEach(d => {
      drawText(d, rightColX, y, fontRegular, 10, colorDark);
      y -= 14;
    });
  }

  // Adjust y to lowest point
  y = Math.min(y, topAddressY - 80) - 30;

  // --- INTRO / SCOPE ---
  if (quote.introduction) {
    drawText('Introduction', margin, y, fontBold, 12, colorDark);
    y -= 15;
    const lines = wordWrap(sanitize(quote.introduction), contentWidth, fontRegular, 10);
    lines.forEach(line => {
      drawText(line, margin, y, fontRegular, 10, colorDark);
      y -= 14;
    });
    y -= 20;
  }

  // --- TABLE ---
  const items = JSON.parse(quote.items || '[]');

  // Table Config
  const col1 = margin;
  const col2 = width - margin - 220; // Qty
  const col3 = width - margin - 140; // Rate
  const col4 = width - margin - 60;  // Total

  // Header
  const headerHeight = 25;
  page.drawRectangle({ x: margin, y: y - headerHeight + 8, width: contentWidth, height: headerHeight, color: colorTableHeader });

  const thY = y;
  drawText('DESCRIPTION', col1 + 10, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('QTY', col2, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('RATE', col3, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('AMOUNT', col4, thY, fontBold, 9, rgb(1, 1, 1));

  y -= 30;

  let subtotal = 0;
  items.forEach((item: any, i: number) => {
    // Alt Row BG
    if (i % 2 === 0) {
      page.drawRectangle({ x: margin, y: y - 8, width: contentWidth, height: 20, color: colorTableAlt });
    }

    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const amount = qty * rate;
    subtotal += amount;

    drawText(item.description || 'Item', col1 + 10, y, fontRegular, 10, colorDark);
    drawText(qty.toString(), col2, y, fontRegular, 10, colorDark);
    drawText(rate.toLocaleString('en', { minimumFractionDigits: 2 }), col3, y, fontRegular, 10, colorDark);
    drawText(amount.toLocaleString('en', { minimumFractionDigits: 2 }), col4, y, fontRegular, 10, colorDark);

    y -= 20;

    // Page break check (simplified)
    if (y < 50) {
      // Would add new page logic here ideally
      // For now just clamping
    }
  });

  y -= 10;
  drawLine(margin, y, width - margin, y, colorBorder);
  y -= 25;

  // --- TOTALS ---
  const totalX = width - margin - 150;
  drawText('Total Amount:', totalX, y, fontBold, 12, colorDark);

  const totalStr = `KSH ${subtotal.toLocaleString('en', { minimumFractionDigits: 2 })}`;
  const totalW = fontBold.widthOfTextAtSize(totalStr, 14);

  drawText(totalStr, width - margin - totalW, y - 20, fontBold, 14, colorPrimary);

  y -= 60;

  // --- TERMS / FOOTER ---
  if (quote.notes) {
    drawText('Terms & Conditions', margin, y, fontBold, 10, colorDark);
    y -= 15;
    const lines = wordWrap(sanitize(quote.notes), contentWidth, fontRegular, 9);
    lines.forEach(line => {
      drawText(line, margin, y, fontRegular, 9, colorLightGray);
      y -= 12;
    });
  }

  // Bottom Footer
  const footerY = 30;
  drawLine(margin, footerY + 15, width - margin, footerY + 15, colorBorder);
  drawText('Generated by Accounting Platform', margin, footerY, fontItalic, 8, colorLightGray);
  drawText(`Page 1 of 1`, width - margin - 50, footerY, fontRegular, 8, colorLightGray);

  return await pdfDoc.save();
}


export async function generateProfessionalInvoicePDF(invoice: any, company: any, client: any, project: any, env?: any) {
  const pdfDoc = await PDFDocument.create();

  // Standard Fonts
  const fontRegular = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  // Config
  const margin = 50;
  const contentWidth = width - (margin * 2);
  let y = height - margin;

  // Colors - Purple Theme for Invoices
  const colorPrimary = rgb(0.5, 0.23, 0.96); // Purple-600
  const colorDark = rgb(0.1, 0.1, 0.1);
  const colorLightGray = rgb(0.6, 0.6, 0.6);
  const colorTableHeader = rgb(0.15, 0.10, 0.25); // Dark Purple
  const colorTableAlt = rgb(0.98, 0.97, 1.0); // Light Purple Tint
  const colorBorder = rgb(0.9, 0.9, 0.9);

  // Helpers
  const sanitize = (text: string | null | undefined) => (text || '').replace(/\r/g, '');

  const drawText = (text: string, x: number, y: number, font: PDFFont, size: number, color = colorDark, options: any = {}) => {
    page.drawText(sanitize(text), { x, y, font, size, color, ...options });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = colorBorder, thickness = 1) => {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness });
  };

  // --- HEADER ---

  // Logo (Simulated or Real)
  let logoEmbedded = false;
  if (company?.logo_url && env?.BUCKET) {
    try {
      const logoKey = company.logo_url.startsWith('/') ? company.logo_url.slice(1) : company.logo_url;
      const logoObject = await env.BUCKET.get(logoKey);
      if (logoObject) {
        const logoBytes = await logoObject.arrayBuffer();
        let logoImage;
        if (company.logo_url.toLowerCase().endsWith('.png')) {
          logoImage = await pdfDoc.embedPng(logoBytes);
        } else if (company.logo_url.toLowerCase().match(/\.(jpg|jpeg)$/)) {
          logoImage = await pdfDoc.embedJpg(logoBytes);
        }
        if (logoImage) {
          const logoDims = logoImage.scaleToFit(120, 60);
          page.drawImage(logoImage, {
            x: margin,
            y: y - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
          });
          logoEmbedded = true;
        }
      }
    } catch (e) {
      console.error('Logo embed failed', e);
    }
  }

  if (!logoEmbedded) {
    // Placeholder Logo Text if no image
    drawText(company?.name?.toUpperCase() || 'COMPANY', margin, y - 20, fontBold, 20, colorPrimary);
  }

  // Invoice Details (Right Aligned)
  const label = 'INVOICE';
  const labelWidth = fontBold.widthOfTextAtSize(label, 30);
  drawText(label, width - margin - labelWidth, y - 25, fontBold, 30, colorDark);

  y -= 60;

  const drawMeta = (label: string, value: string) => {
    const sanitizedVal = sanitize(value);
    const wVal = fontRegular.widthOfTextAtSize(sanitizedVal, 10);
    drawText(label, width - margin - wVal - 70, y, fontRegular, 10, colorLightGray);
    drawText(sanitizedVal, width - margin - wVal, y, fontRegular, 10, colorDark);
    y -= 15;
  };

  drawText(`#${invoice.id}`, width - margin - fontBold.widthOfTextAtSize(`#${invoice.id}`, 12), y, fontBold, 12, colorLightGray);
  y -= 25;

  drawMeta('Date:', new Date(invoice.created_at).toLocaleDateString());
  drawMeta('Due Date:', invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Due on receipt');
  if (project) drawMeta('Project:', project.name);
  drawMeta('Status:', (invoice.status || 'draft').toUpperCase());

  y -= 20;

  // --- ADDRESSES ---
  const topAddressY = y;

  // From
  y = topAddressY;
  drawText('FROM', margin, y, fontBold, 9, colorLightGray);
  y -= 15;
  if (company) {
    drawText(company.name, margin, y, fontBold, 11, colorDark);
    y -= 15;
    const details = [company.email, company.phone, company.address].filter(Boolean);
    details.forEach(d => {
      drawText(d, margin, y, fontRegular, 10, colorDark);
      y -= 14;
    });
  }

  // To
  y = topAddressY;
  const rightColX = width / 2 + 20;
  drawText('BILL TO', rightColX, y, fontBold, 9, colorLightGray);
  y -= 15;
  if (client) {
    drawText(client.name, rightColX, y, fontBold, 11, colorDark);
    y -= 15;
    const details = [client.email, client.phone, client.address].filter(Boolean);
    details.forEach(d => {
      drawText(d, rightColX, y, fontRegular, 10, colorDark);
      y -= 14;
    });
  }

  y = Math.min(y, topAddressY - 80) - 40;

  // --- TABLE ---
  const items = JSON.parse(invoice.items || '[]');

  // Table Config
  const col1 = margin;
  const col2 = width - margin - 220; // Qty
  const col3 = width - margin - 140; // Rate
  const col4 = width - margin - 60;  // Total

  // Header
  const headerHeight = 25;
  page.drawRectangle({ x: margin, y: y - headerHeight + 8, width: contentWidth, height: headerHeight, color: colorTableHeader });

  const thY = y;
  drawText('DESCRIPTION', col1 + 10, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('QTY', col2, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('RATE', col3, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('AMOUNT', col4, thY, fontBold, 9, rgb(1, 1, 1));

  y -= 30;

  let subtotal = 0;
  items.forEach((item: any, i: number) => {
    // Alt Row BG
    if (i % 2 === 0) {
      page.drawRectangle({ x: margin, y: y - 8, width: contentWidth, height: 20, color: colorTableAlt });
    }

    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const amount = qty * rate;
    subtotal += amount;

    drawText(item.description || item.item || 'Item', col1 + 10, y, fontRegular, 10, colorDark);
    drawText(qty.toString(), col2, y, fontRegular, 10, colorDark);
    drawText(rate.toLocaleString('en', { minimumFractionDigits: 2 }), col3, y, fontRegular, 10, colorDark);
    drawText(amount.toLocaleString('en', { minimumFractionDigits: 2 }), col4, y, fontRegular, 10, colorDark);

    y -= 20;
  });

  y -= 10;
  drawLine(margin, y, width - margin, y, colorBorder);
  y -= 25;

  // --- TOTALS ---
  const totalX = width - margin - 150;
  drawText('Total Amount:', totalX, y, fontBold, 12, colorDark);

  const totalStr = `${invoice.currency || 'KSH'} ${subtotal.toLocaleString('en', { minimumFractionDigits: 2 })}`;
  const totalW = fontBold.widthOfTextAtSize(totalStr, 14);

  drawText(totalStr, width - margin - totalW, y - 20, fontBold, 14, colorPrimary);

  y -= 60;

  // --- FOOTER / NOTES ---
  // Banking Info or Notes could go here
  if (company?.name) {
    drawText('Payment Info:', margin, y, fontBold, 10, colorDark);
    y -= 15;
    drawText(`Please make checks payable to ${company.name}`, margin, y, fontRegular, 10, colorDark);
    y -= 30;
  }

  // Bottom Footer
  const footerY = 30;
  drawLine(margin, footerY + 15, width - margin, footerY + 15, colorBorder);
  drawText('Generated by Accounting Platform', margin, footerY, fontItalic, 8, colorLightGray);

  return await pdfDoc.save();
}

// Simple word wrap helper
function wordWrap(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const cleanText = (text || '').replace(/\r/g, '');
  const paragraphs = cleanText.split('\n');
  const lines: string[] = [];

  paragraphs.forEach(paragraph => {
    const words = paragraph.split(' ');
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = font.widthOfTextAtSize(currentLine + " " + word, size);
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  });

  return lines;
}

