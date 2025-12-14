function submitForm() {
    if (saveClientSignature) saveClientSignature();
    if (saveEmployeeSignature) saveEmployeeSignature();

    const form = document.getElementById('hourForm');
    const formData = new FormData(form);

    generatePDF(formData);
}

function generatePDF(formData) {
    if (typeof jspdf === 'undefined') {
        alert('PDF library niet geladen. Voeg jsPDF toe aan de pagina.');
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    doc.setFontSize(16);
    doc.text('Urendeclaratie', 150, 20);

    doc.setFontSize(10);
    doc.text('Opdrachtgever', 20, 35);
    doc.text(formData.get('opdrachtgever') || '', 70, 35);
    doc.text('Werkadres', 20, 42);
    doc.text(formData.get('werkadres') || '', 70, 42);
    doc.text('PC + Plaats', 20, 49);
    doc.text(formData.get('pcplaats') || '', 70, 49);
    doc.text('Afdeling', 20, 56);
    doc.text(formData.get('afdeling') || '', 70, 56);

    doc.rect(140, 30, 60, 30);
    doc.line(140, 37, 200, 37);
    doc.line(140, 44, 200, 44);
    doc.line(140, 51, 200, 51);
    doc.line(175, 30, 175, 60);

    doc.text('Weeknummer', 142, 35);
    doc.text('Jaar', 142, 42);
    doc.text('Naam', 142, 49);
    doc.text('Woonplaats', 142, 56);

    doc.text(formData.get('weeknummer') || '', 177, 35);
    doc.text(formData.get('jaar') || '', 177, 42);
    doc.text(formData.get('naam') || '', 177, 49);
    doc.text(formData.get('woonplaats') || '', 177, 56);

    const tableStartY = 70;
    const rowHeight = 8;

    const col1 = 20;   // Dag
    const col2 = 50;   // Datum
    const col3 = 90;   // Start Tijd
    const col4 = 120;  // Eind Tijd
    const col5 = 150;  // N.U.
    const col6 = 175;  // O.W.
    const col7 = 200;  // Pauze
    const col8 = 220;  // Totaal gewerkte uren (wider)

    doc.rect(20, tableStartY, 250, rowHeight * 10); // table width increased

    doc.line(col2, tableStartY, col2, tableStartY + rowHeight * 10);
    doc.line(col3, tableStartY, col3, tableStartY + rowHeight * 10);
    doc.line(col4, tableStartY, col4, tableStartY + rowHeight * 10);
    doc.line(col5, tableStartY, col5, tableStartY + rowHeight * 10);
    doc.line(col6, tableStartY, col6, tableStartY + rowHeight * 10);
    doc.line(col7, tableStartY, col7, tableStartY + rowHeight * 10);
    doc.line(col8, tableStartY, col8, tableStartY + rowHeight * 10);

    for (let i = 1; i <= 10; i++) {
        doc.line(20, tableStartY + rowHeight * i, 270, tableStartY + rowHeight * i);
    }

    doc.setFontSize(8);
    doc.text('DATUM', col2 + 2, tableStartY + 5);
    doc.text('START TIJD', col3 + 2, tableStartY + 5);
    doc.text('EIND TIJD', col4 + 2, tableStartY + 5);
    doc.text('N.U.', col5 + 2, tableStartY + 5);
    doc.text('O.W.', col6 + 2, tableStartY + 5);
    doc.text('PAUZE', col7 + 2, tableStartY + 5);
    doc.text('TOTAAL GEWERKTE UREN', col8 + 2, tableStartY + 5);

    const days = [
        { name: 'MAANDAG', prefix: 'monday' },
        { name: 'DINSDAG', prefix: 'tuesday' },
        { name: 'WOENSDAG', prefix: 'wednesday' },
        { name: 'DONDERDAG', prefix: 'thursday' },
        { name: 'VRIJDAG', prefix: 'friday' },
        { name: 'ZATERDAG', prefix: 'saturday' },
        { name: 'ZONDAG', prefix: 'sunday' }
    ];

    days.forEach((day, index) => {
        const y = tableStartY + rowHeight * (index + 1) + 5;
        doc.text(day.name, col1 + 2, y);

        if (day.prefix) {
            doc.text(formData.get(`${day.prefix}_date`) || '', col2 + 2, y);
            doc.text(formData.get(`${day.prefix}_start`) || '', col3 + 2, y);
            doc.text(formData.get(`${day.prefix}_end`) || '', col4 + 2, y);
            doc.text(formData.get(`${day.prefix}_regular`) || '', col5 + 2, y);
            doc.text(formData.get(`${day.prefix}_overtime`) || '', col6 + 2, y);
            doc.text(formData.get(`${day.prefix}_break`) || '', col7 + 2, y);
            doc.text(formData.get(`${day.prefix}_total`) || '', col8 + 2, y);
        }
    });

    const bottomY = tableStartY + rowHeight * 10 + 10;

    doc.rect(20, bottomY, 3, 3);
    if (formData.get('bedrijfsauto')) doc.text('X', 21, bottomY + 2.5);
    doc.text('Bedrijfsauto', 25, bottomY + 2.5);

    doc.rect(55, bottomY, 3, 3);
    if (formData.get('eigenvervoer')) doc.text('X', 56, bottomY + 2.5);
    doc.text('Eigen vervoer', 60, bottomY + 2.5);

    doc.text('Aantal kilometers', 100, bottomY + 2.5);
    doc.text(formData.get('kilometers') || '', 130, bottomY + 2.5);

    doc.text('Plaats van het werk:', 20, bottomY + 10);
    doc.text(formData.get('plaatswerk') || '', 60, bottomY + 10);

    const sigY = bottomY + 20;
    doc.text('Akkoord opdrachtgever', 20, sigY);
    doc.text('Akkoord medewerker', 120, sigY);

    const clientSig = formData.get('akkoord_opdrachtgever');
    const employeeSig = formData.get('akkoord_medewerker');

    if (clientSig && clientSig.startsWith('data:image')) {
        try { doc.addImage(clientSig, 'PNG', 20, sigY + 2, 60, 20); } catch (e) { console.error(e); }
    }
    if (employeeSig && employeeSig.startsWith('data:image')) {
        try { doc.addImage(employeeSig, 'PNG', 120, sigY + 2, 60, 20); } catch (e) { console.error(e); }
    }

    doc.setFontSize(7);
    doc.text('N.U. = normale uren', 20, 280);
    doc.text('O.W. = overwerken', 80, 280);

    const weeknr = formData.get('weeknummer') || 'XX';
    const jaar = formData.get('jaar') || '2025';
    const naam = formData.get('naam') || 'Uren';
    doc.save(`Urendeclaratie_Week${weeknr}_${jaar}_${naam}.pdf`);
    alert('PDF succesvol gegenereerd!');
}
