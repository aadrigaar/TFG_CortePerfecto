param(
  [string]$Root = (Resolve-Path ".").Path
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Escape-XmlText {
  param([string]$Text)
  return [System.Security.SecurityElement]::Escape($Text)
}

function New-ParagraphXml {
  param(
    [string]$Text,
    [string]$Style = "",
    [bool]$Bold = $false
  )

  $escaped = Escape-XmlText $Text
  $styleXml = ""
  if ($Style) {
    $styleXml = "<w:pPr><w:pStyle w:val=""$Style""/></w:pPr>"
  }

  $boldXml = ""
  if ($Bold) {
    $boldXml = "<w:rPr><w:b/></w:rPr>"
  }

  return "<w:p xmlns:w=""http://schemas.openxmlformats.org/wordprocessingml/2006/main"">$styleXml<w:r>$boldXml<w:t>$escaped</w:t></w:r></w:p>"
}

function New-TableXml {
  param([object[]]$Rows)

  $xml = @"
<w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:tblPr>
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="999999"/>
    </w:tblBorders>
  </w:tblPr>
"@

  for ($rowIndex = 0; $rowIndex -lt $Rows.Count; $rowIndex++) {
    $xml += "<w:tr>"
    foreach ($cell in $Rows[$rowIndex]) {
      $escaped = Escape-XmlText ([string]$cell)
      $boldXml = ""
      if ($rowIndex -eq 0) {
        $boldXml = "<w:rPr><w:b/></w:rPr>"
      }
      $xml += "<w:tc><w:tcPr><w:tcW w:w=""0"" w:type=""auto""/></w:tcPr><w:p><w:r>$boldXml<w:t>$escaped</w:t></w:r></w:p></w:tc>"
    }
    $xml += "</w:tr>"
  }

  $xml += "</w:tbl>"
  return $xml
}

function Get-ParagraphText {
  param($Paragraph, $NamespaceManager)
  $texts = $Paragraph.SelectNodes(".//w:t", $NamespaceManager) | ForEach-Object { $_.'#text' }
  return ($texts -join "")
}

function Add-ContentBeforeSummary {
  param(
    [string]$DocxPath,
    [string]$UniqueHeading,
    [string[]]$Fragments,
    [string]$BeforeText = ""
  )

  $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("corte-perfecto-docx-" + [Guid]::NewGuid().ToString("N"))
  $zipPath = Join-Path ([System.IO.Path]::GetTempPath()) ("corte-perfecto-docx-" + [Guid]::NewGuid().ToString("N") + ".docx")

  try {
    [System.IO.Compression.ZipFile]::ExtractToDirectory($DocxPath, $tempDir)
    $documentPath = Join-Path $tempDir "word\document.xml"
    [xml]$doc = Get-Content -Raw -Encoding UTF8 $documentPath

    $ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
    $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

    $paragraphs = $doc.SelectNodes("//w:p", $ns)
    foreach ($paragraph in $paragraphs) {
      if ((Get-ParagraphText $paragraph $ns) -eq $UniqueHeading) {
        Write-Host "Ya existe '$UniqueHeading' en $DocxPath"
        return
      }
    }

    $target = $null
    if ($BeforeText) {
      foreach ($paragraph in $paragraphs) {
        if ((Get-ParagraphText $paragraph $ns) -eq $BeforeText) {
          $target = $paragraph
          break
        }
      }
    }

    if (-not $target) {
      foreach ($paragraph in $paragraphs) {
        $paragraphText = Get-ParagraphText $paragraph $ns
        if ($paragraphText -eq "Resumen del capítulo" -or $paragraphText -eq "Resumen del Capítulo") {
          $target = $paragraph
          break
        }
      }
    }

    if (-not $target) {
      $target = $doc.SelectSingleNode("//w:sectPr", $ns)
    }

    $body = $doc.SelectSingleNode("//w:body", $ns)

    foreach ($fragmentXml in $Fragments) {
      $fragment = $doc.CreateDocumentFragment()
      $fragment.InnerXml = $fragmentXml
      [void]$body.InsertBefore($fragment, $target)
    }

    $doc.Save($documentPath)

    if (Test-Path $zipPath) {
      Remove-Item -LiteralPath $zipPath -Force
    }

    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)
    Move-Item -LiteralPath $zipPath -Destination $DocxPath -Force
    Write-Host "Actualizado $DocxPath"
  }
  finally {
    if (Test-Path $tempDir) {
      Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
    if (Test-Path $zipPath) {
      Remove-Item -LiteralPath $zipPath -Force
    }
  }
}

$capitulo1 = Join-Path $Root "entregas\Capitulo1.docx"
$capitulo2 = Join-Path $Root "entregas\Capitulo2.docx"
$capitulo3 = Join-Path $Root "entregas\Capitulo3.docx"

$cap1Fragments = @(
  (New-ParagraphXml "1.4.6 Trazabilidad metodológica y evidencia de construcción" "Heading3"),
  (New-ParagraphXml "Además del desarrollo funcional, el proyecto incorpora una estructura de seguimiento inspirada en pySigHor, repositorio de referencia indicado por la dirección académica. Esta estructura permite mantener una trazabilidad explícita entre requisitos, análisis, diseño, implementación y pruebas, evitando que la memoria y el código evolucionen por caminos separados."),
  (New-TableXml @(
    @("Elemento", "Función dentro del TFG"),
    @("RUP/99-seguimiento/trazabilidad-casos-uso.md", "Relaciona cada caso de uso con módulos reales, rutas, modelos y pruebas."),
    @("RUP/99-seguimiento/auditoria-diseno-implementacion.md", "Contrasta el diseño del Capítulo 3 con la implementación efectiva."),
    @("RUP/99-seguimiento/estado-casos-uso.puml", "Actúa como dashboard visual del avance de casos de uso."),
    @("backend/tests/", "Aporta evidencia ejecutable de reglas críticas de negocio.")
  )),
  (New-ParagraphXml "Este enfoque refuerza la metodología iterativa del proyecto: cada funcionalidad relevante no solo se implementa, sino que queda vinculada con su origen en requisitos y con una comprobación técnica cuando el riesgo lo justifica.")
)

$cap2Fragments = @(
  (New-ParagraphXml "2.4.7 Trazabilidad RUP y seguimiento de casos de uso" "Heading2"),
  (New-ParagraphXml "Para alinear el proyecto con el enfoque de pySigHor, se incorpora una trazabilidad viva que conecta requisitos, análisis, diseño, código y pruebas. Esta evidencia no sustituye a los diagramas del capítulo, sino que permite comprobar que cada caso de uso importante tiene reflejo en módulos reales del sistema."),
  (New-TableXml @(
    @("Artefacto", "Evidencia", "Ubicación"),
    @("Matriz UC a implementación", "Relaciona cada caso de uso con controlador, servicio, modelo y prueba.", "RUP/99-seguimiento/trazabilidad-casos-uso.md"),
    @("Dashboard RUP", "Resume el estado de implementación y verificación de los 17 casos de uso.", "RUP/99-seguimiento/estado-casos-uso.puml"),
    @("Auditoría diseño-código", "Comprueba que el diseño del Capítulo 3 se refleja en el proyecto real.", "RUP/99-seguimiento/auditoria-diseno-implementacion.md"),
    @("Pruebas backend", "Verifican reglas críticas de agenda, chatbot y citas.", "backend/tests/")
  )),
  (New-ParagraphXml "2.4.8 Criterios de aceptación verificables" "Heading2"),
  (New-ParagraphXml "Los casos de uso críticos se cierran con criterios de aceptación ejecutables. De esta forma, la especificación deja de ser únicamente descriptiva y pasa a estar respaldada por comprobaciones automáticas."),
  (New-TableXml @(
    @("Regla de negocio", "Caso de uso", "Evidencia"),
    @("No registrar citas en sábado o domingo.", "UC-05, UC-07, UC-13, UC-14", "calendarService.test.js y appointmentService.test.js"),
    @("No aceptar horas pasadas ni fuera de 10:00 a 20:00.", "UC-05, UC-07, UC-13, UC-14", "appointmentService.test.js"),
    @("No aceptar nombres inválidos o genéricos.", "UC-05, UC-07", "bookingFlowService.test.js y appointmentService.test.js"),
    @("No solapar citas activas.", "UC-05, UC-09, UC-13, UC-14", "appointmentService.test.js"),
    @("Aceptar selección de servicios por número 1..7.", "UC-03, UC-06", "bookingFlowService.test.js")
  ))
)

$cap3Fragments = @(
  (New-ParagraphXml "3.4 Auditoría diseño-implementación" "Heading1"),
  (New-ParagraphXml "Siguiendo la práctica de revisión de pySigHor, se contrasta el diseño con el código real. El objetivo es evitar brechas entre lo modelado en análisis y diseño y lo construido finalmente en React, Node.js, Express, MongoDB y LM Studio."),
  (New-TableXml @(
    @("Área", "Diseño", "Implementación", "Estado"),
    @("Arquitectura", "Cliente-servidor con API REST y ejecución local.", "frontend React/Vite, backend Express, MongoDB local y LM Studio local.", "Correcto"),
    @("MVC backend", "Rutas, controladores, servicios y modelos separados.", "routes, controllers, services, models.", "Correcto"),
    @("Reglas de agenda", "Validación determinista fuera de la IA.", "appointmentService, bookingFlowService y calendarService.", "Correcto"),
    @("Seguridad admin", "JWT y rutas privadas para el panel.", "authController, adminService, requireAuth y appointmentRoutes.", "Correcto"),
    @("Contingencia IA", "Si LM Studio cae no se confirma ninguna cita inventada.", "lmStudioService devuelve AppError controlado.", "Correcto"),
    @("Evidencia de pruebas", "Reglas críticas verificables.", "backend/tests con node:test.", "Reforzado")
  )),
  (New-ParagraphXml "3.5 Plan de pruebas automatizadas" "Heading1"),
  (New-ParagraphXml "El plan de pruebas se centra en los riesgos principales del sistema: citas inválidas, solapes, errores de calendario, selección numérica de servicios y gestión administrativa de estados. Se priorizan pruebas de servicios porque ahí reside la lógica de negocio."),
  (New-TableXml @(
    @("Prueba", "Riesgo cubierto", "Módulos"),
    @("calendarService.test.js", "Interpretación incorrecta de días laborables y fines de semana.", "calendarService"),
    @("bookingFlowService.test.js", "Pérdida de contexto conversacional, servicio numérico o fin de semana.", "bookingFlowService, serviceCatalog"),
    @("appointmentService.test.js", "Citas inválidas, solapes, estados y borrado.", "appointmentService, Appointment"),
    @("npm run build --prefix frontend", "Errores de integración o empaquetado del cliente.", "React/Vite"),
    @("npm run check --prefix backend", "Errores sintácticos de entrada del servidor.", "Node.js/Express")
  )),
  (New-ParagraphXml "3.6 Dashboard RUP del proyecto" "Heading1"),
  (New-ParagraphXml "Además de los diagramas del capítulo, el repositorio incluye un dashboard PlantUML de seguimiento. Este artefacto toma la idea de pySigHor de usar el diagrama de contexto como herramienta de gestión: los casos de uso no solo se dibujan, también se marca su estado de implementación y verificación."),
  (New-ParagraphXml "El dashboard se conserva en RUP/99-seguimiento/estado-casos-uso.puml y permite enseñar de forma rápida qué casos están implementados por build y cuáles cuentan además con pruebas específicas.")
)

Add-ContentBeforeSummary -DocxPath $capitulo1 -UniqueHeading "1.4.6 Trazabilidad metodológica y evidencia de construcción" -Fragments $cap1Fragments -BeforeText "1.5 Alcance y Limitaciones"
Add-ContentBeforeSummary -DocxPath $capitulo2 -UniqueHeading "2.4.7 Trazabilidad RUP y seguimiento de casos de uso" -Fragments $cap2Fragments
Add-ContentBeforeSummary -DocxPath $capitulo3 -UniqueHeading "3.4 Auditoría diseño-implementación" -Fragments $cap3Fragments
