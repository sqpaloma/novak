export function parseBRDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Remove espaços extras
  const cleanDate = dateString.toString().trim();

  // Tenta diferentes formatos
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
  ];

  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      if (format.source.includes("yyyy")) {
        // Formato com ano completo
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Formato com ano abreviado
        const [, day, month, year] = match;
        const fullYear =
          parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
        return new Date(fullYear, parseInt(month) - 1, parseInt(day));
      }
    }
  }

  // Se for uma data ISO (YYYY-MM-DD), usa diretamente
  if (cleanDate.includes("-") && cleanDate.length === 10) {
    const date = new Date(cleanDate);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Se for um número (data do Excel)
  if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
    const excelDate = Number(cleanDate);
    return new Date((excelDate - 25569) * 86400 * 1000);
  }

  return null;
}

export function formatPrazoDisplay(prazoStr: string | null | undefined): string {
  if (!prazoStr) return "N/A";
  const d = parseBRDate(prazoStr.toString());
  if (d && !isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
  return prazoStr.toString();
}