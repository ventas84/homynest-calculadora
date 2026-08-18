// ============================================================
// INSTRUCCIONES:
// 1. Crea un Google Sheet nuevo (o usa uno existente)
// 2. Ve a Extensiones > Apps Script
// 3. Borra el contenido y pega este código completo
// 4. Haz clic en "Implementar" > "Nueva implementación"
// 5. Tipo: "Aplicación web"
// 6. Ejecutar como: "Yo" (tu cuenta)
// 7. Acceso: "Cualquier persona"
// 8. Clic en "Implementar" y copia la URL
// 9. Pega la URL en src/data/constants.js como SHEETS_WEBHOOK
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Crear encabezados si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha",
        "ID",
        "Cliente",
        "Teléfono",
        "Email",
        "Modelo",
        "m²",
        "Módulos",
        "Precio Neto",
        "Logística",
        "Comuna",
        "Terraza m²",
        "Terraza Precio",
        "Estado",
        "Notas",
      ]);
      // Formato encabezados
      var headerRange = sheet.getRange(1, 1, 1, 15);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#2D5A3D");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    // Buscar si ya existe esta cotización (actualizar en vez de duplicar)
    var ids = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    var rowIndex = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === data.id) {
        rowIndex = i + 2;
        break;
      }
    }

    var fecha = new Date(data.createdAt);
    var fechaStr = Utilities.formatDate(fecha, "America/Santiago", "dd/MM/yyyy HH:mm");
    var terraza = data.extras && data.extras.terraza ? data.extras.terraza : null;

    var row = [
      fechaStr,
      data.id,
      data.client ? data.client.name : "",
      data.client ? data.client.phone : "",
      data.client ? data.client.email || "" : "",
      data.modelName || "",
      data.mt2 || "",
      data.totalModulos || "",
      data.totals ? data.totals.precio : "",
      data.totals ? data.totals.totalLog : "",
      data.comuna ? data.comuna.nombre : "",
      terraza ? terraza.qty : "",
      terraza ? terraza.qty * terraza.price : "",
      "Nueva",
      data.client ? data.client.notes || "" : "",
    ];

    if (rowIndex > 0) {
      // Actualizar fila existente (no sobreescribir Estado ni Notas editadas manualmente)
      sheet.getRange(rowIndex, 1, 1, 13).setValues([row.slice(0, 13)]);
    } else {
      sheet.appendRow(row);
    }

    // Auto-ajustar columnas
    sheet.autoResizeColumns(1, 15);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "Webhook HomyNest activo" })
  ).setMimeType(ContentService.MimeType.JSON);
}
