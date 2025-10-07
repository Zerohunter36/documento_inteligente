import ExcelJS from 'exceljs';

export async function generateExcel(fields, templatePath) {
  const workbook = new ExcelJS.Workbook();

  if (templatePath) {
    await workbook.xlsx.readFile(templatePath);
  } else {
    const sheet = workbook.addWorksheet('Documento');
    sheet.columns = [
      { header: 'Campo', key: 'campo', width: 30 },
      { header: 'Valor', key: 'valor', width: 50 },
      { header: 'Confianza', key: 'confianza', width: 15 },
    ];
    fields.forEach((field) => {
      sheet.addRow({
        campo: field.label,
        valor: field.value,
        confianza: field.confidence ? `${Math.round(field.confidence * 100)}%` : '',
      });
    });
    return workbook.xlsx.writeBuffer();
  }

  const sheet = workbook.worksheets[0];
  fields.forEach((field, index) => {
    const rowIndex = index + 2;
    sheet.getCell(`A${rowIndex}`).value = field.label;
    sheet.getCell(`B${rowIndex}`).value = field.value;
    sheet.getCell(`C${rowIndex}`).value = field.confidence
      ? `${Math.round(field.confidence * 100)}%`
      : '';
  });

  return workbook.xlsx.writeBuffer();
}
