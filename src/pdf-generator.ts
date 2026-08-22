import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

export async function generateProfessionalQuotePDF(quote: any, company: any, client: any, project: any, env?: any) {
  const pdfDoc = await PDFDocument.create();

  // Standard Fonts
  const fontRegular = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique);

  let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = currentPage.getSize();

  // Config
  const margin = 50;
  const contentWidth = width - (margin * 2);
  const minY = 80; // Minimum Y before triggering new page (leaving room for footer)
  let y = height - margin;
  let pageNumber = 1;

  // Colors
  const colorPrimary = rgb(0.23, 0.51, 0.96); // #3B82F6 (Blue-500)
  const colorDark = rgb(0.1, 0.1, 0.1);
  const colorLightGray = rgb(0.6, 0.6, 0.6);
  const colorTableHeader = rgb(0.12, 0.16, 0.23); // Slate-900
  const colorTableAlt = rgb(0.97, 0.98, 0.99); // Slate-50
  const colorBorder = rgb(0.9, 0.9, 0.9);

  // Helpers
  const sanitize = (text: string | null | undefined) => (text || '').replace(/\r/g, '');

  // Add new page helper
  const addNewPage = () => {
    currentPage = pdfDoc.addPage([595.28, 841.89]);
    y = height - margin;
    pageNumber++;
  };

  // Check if we need a new page
  const checkPageBreak = (spaceNeeded: number) => {
    if (y - spaceNeeded < minY) {
      addNewPage();
      return true;
    }
    return false;
  };

  const drawText = (text: string, x: number, yPos: number, font: PDFFont, size: number, color = colorDark, options: any = {}) => {
    currentPage.drawText(sanitize(text), { x, y: yPos, font, size, color, ...options });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = colorBorder, thickness = 1) => {
    currentPage.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness });
  };

  const drawRectangle = (x: number, yPos: number, w: number, h: number, color: any) => {
    currentPage.drawRectangle({ x, y: yPos, width: w, height: h, color });
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
          currentPage.drawImage(logoImage, {
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
    checkPageBreak(50);
    drawText('Introduction', margin, y, fontBold, 12, colorDark);
    y -= 15;
    const lines = wordWrap(sanitize(quote.introduction), contentWidth, fontRegular, 10);
    lines.forEach(line => {
      checkPageBreak(20);
      drawText(line, margin, y, fontRegular, 10, colorDark);
      y -= 14;
    });
    y -= 20;
  }

  // Scope Summary Section
  if (quote.scope_summary) {
    checkPageBreak(50);
    drawText('Project Scope', margin, y, fontBold, 12, colorDark);
    y -= 15;
    const lines = wordWrap(sanitize(quote.scope_summary), contentWidth, fontRegular, 10);
    lines.forEach(line => {
      checkPageBreak(20);
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
  checkPageBreak(50);
  const headerHeight = 25;
  drawRectangle(margin, y - headerHeight + 8, contentWidth, headerHeight, colorTableHeader);

  const thY = y;
  drawText('DESCRIPTION', col1 + 10, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('QTY', col2, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('RATE', col3, thY, fontBold, 9, rgb(1, 1, 1));
  drawText('AMOUNT', col4, thY, fontBold, 9, rgb(1, 1, 1));

  y -= 30;

  let subtotal = 0;
  items.forEach((item: any, i: number) => {
    checkPageBreak(25);

    // Alt Row BG
    if (i % 2 === 0) {
      drawRectangle(margin, y - 8, contentWidth, 20, colorTableAlt);
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

    // Page break check
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

  const totalStr = `${quote.currency || 'KSH'} ${subtotal.toLocaleString('en', { minimumFractionDigits: 2 })}`;
  const totalW = fontBold.widthOfTextAtSize(totalStr, 14);

  drawText(totalStr, width - margin - totalW, y - 20, fontBold, 14, colorPrimary);

  y -= 60;

  // --- PAYMENT MILESTONES ---
  const paymentTerms = JSON.parse(quote.payment_terms || '[]');
  if (paymentTerms.length > 0) {
    checkPageBreak(50);
    drawText('Payment Schedule', margin, y, fontBold, 12, colorDark);
    y -= 20;

    paymentTerms.forEach((milestone: any, index: number) => {
      checkPageBreak(45);
      // Milestone box with light background
      const boxHeight = 35;
      if (index % 2 === 0) {
        drawRectangle(margin, y - boxHeight + 8, contentWidth, boxHeight, colorTableAlt);
      }

      // Milestone name and percentage
      const milestoneName = milestone.name || `Milestone ${index + 1}`;
      drawText(milestoneName, margin + 10, y, fontBold, 10, colorDark);

      // Percentage
      const percentText = `${milestone.percentage}%`;
      drawText(percentText, margin + contentWidth / 2, y, fontRegular, 10, colorDark);

      // Calculated amount
      const milestoneAmount = (subtotal * milestone.percentage) / 100;
      const amountText = `${quote.currency || 'KSH'} ${milestoneAmount.toLocaleString('en', { minimumFractionDigits: 2 })}`;
      const amountW = fontBold.widthOfTextAtSize(amountText, 10);
      drawText(amountText, width - margin - amountW - 10, y, fontBold, 10, colorPrimary);

      // Due date
      if (milestone.dueDate) {
        const dueText = `Due: ${new Date(milestone.dueDate).toLocaleDateString()}`;
        drawText(dueText, margin + 10, y - 15, fontRegular, 9, colorLightGray);
      }

      y -= boxHeight + 5;
    });

    y -= 20;
  }

  // --- TERMS / FOOTER ---
  if (quote.notes) {
    checkPageBreak(50);
    drawText('Terms & Conditions', margin, y, fontBold, 10, colorDark);
    y -= 15;
    const lines = wordWrap(sanitize(quote.notes), contentWidth, fontRegular, 9);
    lines.forEach(line => {
      checkPageBreak(20);
      drawText(line, margin, y, fontRegular, 9, colorLightGray);
      y -= 12;
    });
  }

  // Render footer on all pages
  const totalPages = pdfDoc.getPageCount();
  const pages = pdfDoc.getPages();
  const footerY = 30;

  pages.forEach((page, idx) => {
    page.drawLine({ start: { x: margin, y: footerY + 15 }, end: { x: width - margin, y: footerY + 15 }, color: colorBorder, thickness: 1 });
    page.drawText('Generated by Accounting Platform', { x: margin, y: footerY, font: fontItalic, size: 8, color: colorLightGray });
    page.drawText(`Page ${idx + 1} of ${totalPages}`, { x: width - margin - 60, y: footerY, font: fontRegular, size: 8, color: colorLightGray });
  });

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


export async function generateProfessionalReceiptPDF(receipt: any, company: any, client: any, project: any, env?: any) {
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

  // Colors - Teal Theme for Receipts
  const colorPrimary = rgb(0.0, 0.5, 0.5); // Teal
  const colorDark = rgb(0.1, 0.1, 0.1);
  const colorLightGray = rgb(0.6, 0.6, 0.6);
  const colorTableHeader = rgb(0.0, 0.3, 0.3); // Dark Teal
  const colorTableAlt = rgb(0.95, 1.0, 1.0); // Light Teal Tint
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

  // Receipt Details (Right Aligned)
  const label = 'RECEIPT';
  const labelWidth = fontBold.widthOfTextAtSize(label, 30);
  drawText(label, width - margin - labelWidth, y - 25, fontBold, 30, colorDark);

  y -= 60;

  const drawMeta = (label: string, value: string) => {
    const sanitizedVal = sanitize(value);
    const valWidth = fontRegular.widthOfTextAtSize(sanitizedVal, 10);
    const labelWidth = fontRegular.widthOfTextAtSize(label, 10);

    // Draw Value (Right Aligned)
    drawText(sanitizedVal, width - margin - valWidth, y, fontRegular, 10, colorDark);

    // Draw Label (Left of Value with padding)
    // 80px fixed width for label column, or dynamic
    drawText(label, width - margin - valWidth - labelWidth - 10, y, fontRegular, 10, colorLightGray);

    y -= 15;
  };

  drawText(`#${receipt.id}`, width - margin - fontBold.widthOfTextAtSize(`#${receipt.id}`, 12), y, fontBold, 12, colorLightGray);
  y -= 25;

  drawMeta('Type:', (receipt.receipt_type === 'incoming' ? 'INCOMING' : 'OUTGOING'));
  drawMeta('Date:', new Date(receipt.date).toLocaleDateString());
  if (project) drawMeta('Project:', project.name);
  if (receipt.payment_method) drawMeta('Payment Method:', receipt.payment_method);
  if (receipt.reference_number) drawMeta('Ref Number:', receipt.reference_number);
  drawMeta('Status:', (receipt.status || 'draft').toUpperCase());

  y -= 25;

  // --- ADDRESSES ---
  const topAddressY = y;
  const isIncomingReceipt = receipt.receipt_type === 'incoming';

  // From
  y = topAddressY;
  drawText(isIncomingReceipt ? 'MERCHANT' : 'FROM', margin, y, fontBold, 9, colorLightGray);
  y -= 15;
  if (isIncomingReceipt) {
    const merchantName = receipt.merchant_name || company?.name || 'Merchant';
    drawText(merchantName, margin, y, fontBold, 11, colorDark);
    y -= 15;
  } else if (company) {
    drawText(company.name, margin, y, fontBold, 11, colorDark);
    y -= 15;
    const details = [company.email, company.phone, company.address].filter(Boolean);
    details.forEach(d => {
      drawText(d, margin, y, fontRegular, 10, colorDark);
      y -= 14;
    });
  }

  if (!isIncomingReceipt) {
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
  }

  y = Math.min(y, topAddressY - 80) - 40;

  // --- TABLE ---
  const items = JSON.parse(receipt.items || '[]');

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
  drawText('Total Paid:', totalX, y, fontBold, 12, colorDark);

  const totalStr = `KSH ${subtotal.toLocaleString('en', { minimumFractionDigits: 2 })}`;
  const totalW = fontBold.widthOfTextAtSize(totalStr, 14);

  drawText(totalStr, width - margin - totalW, y - 20, fontBold, 14, colorPrimary);

  y -= 60;

  // --- FOOTER / NOTES ---
  if (receipt.notes) {
    drawText('Notes', margin, y, fontBold, 10, colorDark);
    y -= 15;
    drawText(sanitize(receipt.notes), margin, y, fontRegular, 10, colorDark);
    y -= 30;
  }

  // Bottom Footer
  const footerY = 30;
  drawLine(margin, footerY + 15, width - margin, footerY + 15, colorBorder);
  drawText('Generated by Accounting Platform', margin, footerY, fontItalic, 8, colorLightGray);

  return await pdfDoc.save();
}
