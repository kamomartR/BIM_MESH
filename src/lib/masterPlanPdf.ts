/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { MasterPlanDocument, TableBlock } from './masterPlanData';

const LOGO_SOURCES = [
  '/logo-mesh.webp',
  'https://i.postimg.cc/K89NWRmZ/cropped-logo-mesh-estudio-2024.webp',
];

async function loadMeshLogoPng(): Promise<{ dataUrl: string; ratio: number } | null> {
  for (const src of LOGO_SOURCES) {
    try {
      const result = await new Promise<{ dataUrl: string; ratio: number }>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const w = img.naturalWidth || 400;
          const h = img.naturalHeight || 140;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No 2d context'));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            ratio: w / h,
          });
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = src;
      });
      return result;
    } catch {
      // Try next source
    }
  }
  return null;
}

/**
 * Strip markdown bold markers for clean PDF measurement/rendering
 */
function stripMarkdown(text: string): string {
  return (text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\$\\ge\$/g, '≥')
    .replace(/\\ge/g, '≥');
}

/**
 * Compute proportional column widths for any table based on header/content length
 */
function computeColumnWidths(table: TableBlock, totalWidth: number): number[] {
  const colCount = Math.max(1, table.headers.length);
  const weights: number[] = Array(colCount).fill(1);

  for (let c = 0; c < colCount; c++) {
    const headerLen = stripMarkdown(table.headers[c] || '').length;
    let maxCellLen = headerLen;
    table.rows.forEach((row) => {
      const cellLen = stripMarkdown(row[c] || '').length;
      if (cellLen > maxCellLen) maxCellLen = cellLen;
    });
    // Clamp weight so short code columns stay compact while description columns get ample width
    weights[c] = Math.max(10, Math.min(85, Math.pow(maxCellLen, 0.72) * 2.2));
  }

  const sum = weights.reduce((a, b) => a + b, 0);
  const rawWidths = weights.map((w) => (w / sum) * totalWidth);

  // Enforce a safe minimum column width of 14mm
  const minW = Math.min(15, totalWidth / colCount);
  const adjusted = rawWidths.map((w) => Math.max(minW, w));
  const adjustedSum = adjusted.reduce((a, b) => a + b, 0);
  return adjusted.map((w) => (w / adjustedSum) * totalWidth);
}

/**
 * Generates and downloads an executive A4 PDF for the Master Implementation Plan
 */
export async function generateMasterPlanPdf(plan: MasterPlanDocument): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const topStartPage2 = 24;
  const bottomLimit = pageHeight - 17;

  const logoAsset = await loadMeshLogoPng();
  const { metadata, modules } = plan;

  const drawRunningHeader = (pageNum: number) => {
    if (pageNum === 1) return;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 16, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 16, pageWidth - margin, 16);

    if (logoAsset) {
      const logoH = 7;
      const logoW = Math.min(26, logoH * logoAsset.ratio);
      doc.addImage(logoAsset.dataUrl, 'PNG', margin, 4.5, logoW, logoH);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(metadata.organization.toUpperCase(), margin, 10);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${metadata.code}  ·  ${metadata.title}`.slice(0, 72), pageWidth - margin, 8, {
      align: 'right',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Versión ${metadata.version}  ·  ${metadata.issueDate}`, pageWidth - margin, 12.2, {
      align: 'right',
    });
  };

  let y = 14;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomLimit) {
      doc.addPage();
      drawRunningHeader(doc.getNumberOfPages());
      y = topStartPage2;
    }
  };

  // =========================================================================
  // PAGE 1: CORPORATE DOCUMENT HEADER & METADATA SHEET
  // =========================================================================
  // Subtle dark slate accent stripe at top
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 3.2, 'F');

  // Header box with logo + Document Control block
  const headerTop = 10;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, headerTop, contentWidth, 26, 2, 2, 'FD');

  // Vertical dividers inside header box
  const col1End = margin + 42;
  const col2End = pageWidth - margin - 44;
  doc.line(col1End, headerTop, col1End, headerTop + 26);
  doc.line(col2End, headerTop, col2End, headerTop + 26);

  // Col 1: Logo
  if (logoAsset) {
    const maxW = 34;
    const maxH = 16;
    let w = maxH * logoAsset.ratio;
    let h = maxH;
    if (w > maxW) {
      w = maxW;
      h = w / logoAsset.ratio;
    }
    const lx = margin + (42 - w) / 2;
    const ly = headerTop + (26 - h) / 2;
    doc.addImage(logoAsset.dataUrl, 'PNG', lx, ly, w, h);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(metadata.organization.toUpperCase(), margin + 21, headerTop + 14, { align: 'center' });
  }

  // Col 2: Main Title
  const centerX = col1End + (col2End - col1End) / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('SISTEMA DE GESTIÓN DE LA INFORMACIÓN BIM', centerX, headerTop + 7, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const wrappedTitle = doc.splitTextToSize(metadata.title, col2End - col1End - 8);
  doc.text(wrappedTitle, centerX, headerTop + 13.5, { align: 'center' });

  // Col 3: Code / Version / Date
  const rightColX = col2End + 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CÓDIGO:', rightColX, headerTop + 6.5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.2);
  doc.text(metadata.code || 'ME-BIM-PLA-001', rightColX, headerTop + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('EMISIÓN:', rightColX, headerTop + 15.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text((metadata.issueDate || '').slice(0, 26), rightColX, headerTop + 19.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('ORG:', rightColX, headerTop + 23.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text((metadata.organization || 'Mesh Estudio').slice(0, 22), rightColX + 9, headerTop + 23.5);

  y = headerTop + 31;

  // Compact Metadata Strip below Header Box
  const metaItems = [
    { label: 'Versión:', value: metadata.version },
    { label: 'Marco Normativo:', value: metadata.normativeFramework },
    { label: 'Elaborado por:', value: metadata.author },
  ];

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const metaStartY = y;
  let metaInnerY = y + 5;
  const metaLinesPerRow: { label: string; lines: string[] }[] = metaItems.map((m) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    return {
      label: m.label,
      lines: doc.splitTextToSize(m.value || '-', contentWidth - 36),
    };
  });
  const totalMetaH =
    metaLinesPerRow.reduce((sum, r) => sum + Math.max(1, r.lines.length) * 4 + 1.5, 0) + 5;

  doc.roundedRect(margin, metaStartY, contentWidth, totalMetaH, 1.5, 1.5, 'FD');

  metaLinesPerRow.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    doc.text(row.label, margin + 3.5, metaInnerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(row.lines, margin + 32, metaInnerY);
    metaInnerY += Math.max(1, row.lines.length) * 4 + 1.5;
  });

  y = metaStartY + totalMetaH + 7;

  // =========================================================================
  // RENDER ALL MODULES DYNAMICALLY
  // =========================================================================
  modules.forEach((mod, modIdx) => {
    ensureSpace(16);

    // Module Heading Bar
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, 2.2, 6.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    const modHeading = `${modIdx + 1}. ${mod.title}`;
    const headingLines = doc.splitTextToSize(modHeading, contentWidth - 6);
    doc.text(headingLines, margin + 4.5, y + 4.7);
    y += Math.max(7.5, headingLines.length * 5.2 + 2);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(margin, y - 1, pageWidth - margin, y - 1);
    y += 2.5;

    // Render Blocks inside Module
    mod.blocks.forEach((block) => {
      if (block.type === 'subheading') {
        ensureSpace(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.3);
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(stripMarkdown(block.text), contentWidth);
        doc.text(lines, margin, y + 3);
        y += lines.length * 4.5 + 2.5;
      } else if (block.type === 'paragraph') {
        const clean = stripMarkdown(block.text);
        if (!clean.trim()) return;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.7);
        doc.setTextColor(51, 65, 85);
        const lines = doc.splitTextToSize(clean, contentWidth);
        const lineH = 4.2;

        // Render line-by-line so long paragraphs paginate cleanly
        lines.forEach((line: string) => {
          ensureSpace(lineH + 1);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.7);
          doc.setTextColor(51, 65, 85);
          doc.text(line, margin, y + 3);
          y += lineH;
        });
        y += 2.5;
      } else if (block.type === 'list') {
        block.items.forEach((item, iIdx) => {
          const bullet = block.ordered ? `${iIdx + 1}.` : '•';
          const leadClean = stripMarkdown(item.lead || '').trim();
          const bodyClean = stripMarkdown(item.text || '').trim();
          const combined = leadClean ? `${leadClean} ${bodyClean}` : bodyClean;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          const lines = doc.splitTextToSize(combined, contentWidth - 7);
          const needed = lines.length * 4.1 + 1.5;
          ensureSpace(needed);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(bullet, margin + 1.5, y + 3);

          // Draw first line with bold lead if possible, otherwise clean unified prose
          if (leadClean) {
            doc.setFont('helvetica', 'bold');
            const leadW = doc.getTextWidth(`${leadClean} `);
            if (leadW < contentWidth - 18) {
              const firstLineRemaining = contentWidth - 7 - leadW;
              doc.setFont('helvetica', 'normal');
              const restLines = doc.splitTextToSize(bodyClean, contentWidth - 7);
              const firstRest = doc.splitTextToSize(bodyClean, firstLineRemaining);

              // Simple robust approach: print bold lead + remaining wrapped lines cleanly
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(15, 23, 42);
              doc.text(leadClean, margin + 6.5, y + 3);

              doc.setFont('helvetica', 'normal');
              doc.setTextColor(51, 65, 85);
              if (firstRest.length > 0) {
                doc.text(firstRest[0], margin + 6.5 + leadW, y + 3);
                const remainingText = bodyClean.slice(firstRest[0].length).trim();
                y += 4.1;
                if (remainingText) {
                  const tailLines = doc.splitTextToSize(remainingText, contentWidth - 7);
                  tailLines.forEach((tl: string) => {
                    ensureSpace(4.2);
                    doc.text(tl, margin + 6.5, y + 3);
                    y += 4.1;
                  });
                }
              } else if (restLines.length === 0) {
                y += 4.1;
              }
            } else {
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(51, 65, 85);
              lines.forEach((ln: string) => {
                ensureSpace(4.2);
                doc.text(ln, margin + 6.5, y + 3);
                y += 4.1;
              });
            }
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
            lines.forEach((ln: string) => {
              ensureSpace(4.2);
              doc.text(ln, margin + 6.5, y + 3);
              y += 4.1;
            });
          }
          y += 1.2;
        });
        y += 2;
      } else if (block.type === 'callout') {
        const cleanTitle = stripMarkdown(block.title || 'Nota Técnica');
        const cleanText = stripMarkdown(block.text || '');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.4);
        const textLines = doc.splitTextToSize(cleanText, contentWidth - 10);
        const boxH = 7.5 + textLines.length * 4.1 + 3;
        ensureSpace(boxH + 2);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.25);
        doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, 'FD');

        // Emerald left accent bar
        doc.setFillColor(5, 150, 105);
        doc.rect(margin, y, 2, boxH, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(cleanTitle, margin + 5, y + 5.2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.3);
        doc.setTextColor(51, 65, 85);
        doc.text(textLines, margin + 5, y + 10);

        y += boxH + 4;
      } else if (block.type === 'table') {
        const colWidths = computeColumnWidths(block, contentWidth);
        const padX = 2.2;
        const padY = 2.2;
        const fontSize = block.headers.length >= 6 ? 7.1 : 7.8;
        const lineH = block.headers.length >= 6 ? 3.4 : 3.8;

        const drawTableHeader = () => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(fontSize);
          let maxHeaderLines = 1;
          const wrappedHeaders = block.headers.map((h, ci) => {
            const lines = doc.splitTextToSize(
              stripMarkdown(h || ''),
              Math.max(8, colWidths[ci] - padX * 2)
            );
            if (lines.length > maxHeaderLines) maxHeaderLines = lines.length;
            return lines;
          });
          const headerH = maxHeaderLines * lineH + padY * 2;
          ensureSpace(headerH + 8);

          doc.setFillColor(15, 23, 42);
          doc.rect(margin, y, contentWidth, headerH, 'F');

          let cx = margin;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(fontSize);
          doc.setTextColor(255, 255, 255);
          wrappedHeaders.forEach((lines, ci) => {
            doc.text(lines, cx + padX, y + padY + lineH * 0.78);
            cx += colWidths[ci];
          });
          y += headerH;
        };

        drawTableHeader();

        block.rows.forEach((row, rIdx) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(fontSize);
          let maxLines = 1;
          const wrappedCells = block.headers.map((_, ci) => {
            const cellVal = stripMarkdown(row[ci] || '');
            const lines = doc.splitTextToSize(cellVal, Math.max(8, colWidths[ci] - padX * 2));
            if (lines.length > maxLines) maxLines = lines.length;
            return lines;
          });
          const rowH = maxLines * lineH + padY * 2;

          if (y + rowH > bottomLimit) {
            doc.addPage();
            drawRunningHeader(doc.getNumberOfPages());
            y = topStartPage2;
            drawTableHeader();
          }

          // Alternating zebra fill
          if (rIdx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentWidth, rowH, 'F');
          }

          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.2);
          doc.rect(margin, y, contentWidth, rowH, 'S');

          let cx = margin;
          wrappedCells.forEach((lines, ci) => {
            if (ci > 0) {
              doc.line(cx, y, cx, y + rowH);
            }
            doc.setFont('helvetica', ci === 0 ? 'bold' : 'normal');
            doc.setFontSize(fontSize);
            doc.setTextColor(ci === 0 ? 15 : 51, ci === 0 ? 23 : 65, ci === 0 ? 42 : 85);
            doc.text(lines, cx + padX, y + padY + lineH * 0.78);
            cx += colWidths[ci];
          });

          y += rowH;
        });

        y += 4.5;
      } else if (block.type === 'signatures') {
        const entries = block.entries || [];
        if (entries.length === 0) return;

        // Render in pairs (2 per row)
        for (let i = 0; i < entries.length; i += 2) {
          const pair = entries.slice(i, i + 2);
          ensureSpace(32);
          y += 10;

          const sigGap = 14;
          const sigW = pair.length === 1 ? contentWidth * 0.55 : (contentWidth - sigGap) / 2;

          pair.forEach((entry, pIdx) => {
            const sx = margin + pIdx * (sigW + sigGap);
            doc.setDrawColor(100, 116, 139);
            doc.setLineWidth(0.35);
            doc.line(sx, y + 8, sx + sigW, y + 8);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.text(entry.name || '', sx, y + 13);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(entry.role || '', sx, y + 17.2);

            doc.setFontSize(7.8);
            doc.setTextColor(100, 116, 139);
            doc.text(entry.organization || '', sx, y + 21.2);
            doc.text(entry.datePlaceholder || 'Fecha: ____ / ____ / 2026', sx, y + 25.4);
          });

          y += 30;
        }
      }
    });

    y += 3;
  });

  // =========================================================================
  // ADD FOOTER WITH PAGE NUMBERS TO ALL PAGES
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${metadata.organization}  ·  ${metadata.code}  ·  Documento Controlado ISO 19650`,
      margin,
      pageHeight - 7.5
    );
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 7.5, {
      align: 'right',
    });
  }

  const safeCode = (metadata.code || 'ME-BIM-PLA-001').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeCode}_Plan_Maestro_BIM_Mesh_Estudio.pdf`;
  doc.save(fileName);
}
