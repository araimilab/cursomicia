function copyText(id) {
  const el = document.getElementById(id);
  if (el) {
    el.select();
    document.execCommand('copy');
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = CAMPUS_CONFIG.messages.copied;
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1500);
  }
}

function resetText(id) {
  const el = document.getElementById(id);
  if (el) {
    el.value = el.getAttribute('data-original');
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = CAMPUS_CONFIG.messages.restored;
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1000);
  }
}

function exportNotesToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título
  doc.setFontSize(18);
  doc.setTextColor(26, 54, 93);
  doc.text(CAMPUS_CONFIG.export.headerTitle, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Fecha
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado el: ${dateStr}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Notas por día
  for (let day = 1; day <= CAMPUS_CONFIG.totalDays; day++) {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const noteText = localStorage.getItem(`${CAMPUS_CONFIG.progress.notesPrefix}${day}`) || "";
    if (!CAMPUS_CONFIG.export.includeEmptyDays && (!noteText || noteText.trim() === "")) {
      continue;
    }

    // Título del día
    doc.setFontSize(12);
    doc.setTextColor(42, 115, 176);
    doc.text(`Día ${day}:`, 15, yPos);
    yPos += 8;

    // Contenido
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const cleanText = noteText || "(Sin notas)";
    const splitText = doc.splitTextToSize(cleanText, pageWidth - 30);
    doc.text(splitText, 15, yPos);
    yPos += (splitText.length * 6) + 10;
  }

  doc.save(CAMPUS_CONFIG.export.pdfFileName);
}