// src/utils/pdf.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type ColunaPDF = {
  chave: string;
  label: string;
  largura: number;
};

type LinhaTabela = {
  [key: string]: unknown;
};

type GerarPDFBaseParams = {
  titulo: string;
  subTitulo: string;
  fazenda: string;
  dados: LinhaTabela[];
  colunas: ColunaPDF[];
};

export async function gerarPDFBase({
  titulo,
  subTitulo,
  fazenda,
  dados,
  colunas,
}: GerarPDFBaseParams) {
  const pdf = await PDFDocument.create();
  const pageWidth = 595;
  const pageHeight = 842;

  let page = pdf.addPage([pageWidth, pageHeight]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = pageHeight - 50;
  const margemX = 40;
  const linhaAltura = 20;

  // CABEÇALHO
  page.drawText("EASYFARM", {
    x: margemX,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  y -= 28;

  page.drawText(`Relatório: ${titulo}`, {
    x: margemX,
    y,
    size: 14,
    font: fontBold,
  });

  y -= 20;

  page.drawText(`Fazenda: ${fazenda}`, {
    x: margemX,
    y,
    size: 11,
    font,
  });

  y -= 14;

  page.drawText(`Descrição: ${subTitulo}`, {
    x: margemX,
    y,
    size: 11,
    font,
  });

  y -= 20;

  const dataEmissao = new Date().toLocaleString("pt-BR");
  page.drawText(`Emitido em: ${dataEmissao}`, {
    x: margemX,
    y,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 20;

  // LINHA SEPARADORA
  page.drawLine({
    start: { x: margemX, y },
    end: { x: pageWidth - margemX, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 30;

  // FUNÇÃO PARA NOVA PÁGINA
  const desenharCabecalhoTabela = () => {
    let x = margemX;

    colunas.forEach((col) => {
      page.drawText(col.label, {
        x,
        y,
        size: 10,
        font: fontBold,
      });
      x += col.largura;
    });

    y -= 8;

    // linha horizontal
    page.drawLine({
      start: { x: margemX, y },
      end: { x: pageWidth - margemX, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    y -= 12;
  };

  const novaPagina = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - 60;

    page.drawText(`Relatório: ${titulo}`, {
      x: margemX,
      y,
      size: 14,
      font: fontBold,
    });

    y -= 25;
    desenharCabecalhoTabela();
  };

  // cabeçalho da planilha
  desenharCabecalhoTabela();

  // CONTEÚDO DA TABELA
  dados.forEach((item, index) => {
    if (y < 60) {
      novaPagina();
    }

    let x = margemX;

    // zebra row
    if (index % 2 === 1) {
      page.drawRectangle({
        x: margemX - 2,
        y: y - 4,
        width: pageWidth - margemX * 2 + 4,
        height: linhaAltura - 6,
        color: rgb(0.96, 0.96, 0.96),
      });
    }

    colunas.forEach((col) => {
      const raw = item[col.chave];
      const valor =
        raw === null || raw === undefined ? "—" : String(raw).slice(0, 50);

      page.drawText(valor, {
        x,
        y,
        size: 10,
        font,
      });

      x += col.largura;
    });

    y -= linhaAltura;
  });

  // FINALIZAÇÃO (download)
  const pdfBytes = await pdf.save();

  // cria um Uint8Array "seguro" para o Blob (resolve o erro de ArrayBufferLike)
  const safeBytes = Uint8Array.from(pdfBytes);
  const blob = new Blob([safeBytes], { type: "application/pdf" });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", `${titulo}.pdf`);
  link.setAttribute("target", "_blank");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
