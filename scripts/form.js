const PAGE_MARGIN_LEFT = 20;
const PAGE_MARGIN_TOP = 10;
const TITLE_Y = PAGE_MARGIN_TOP;
const HEADER_START_Y = PAGE_MARGIN_TOP + 15;
const HEADER_LINE_HEIGHT = 7;
const HEADER_VALUE_X = 70;
const INFO_BOX_X = 150;
const INFO_BOX_Y = HEADER_START_Y - 5;
const INFO_BOX_WIDTH = 90;
const INFO_BOX_HEIGHT = 30;
const INFO_BOX_COLUMN_SPLIT = 45;
const INFO_BOX_ROW_HEIGHT = 7.5;
const TABLE_START_Y = INFO_BOX_Y + INFO_BOX_HEIGHT + 10;
const TABLE_ROW_HEIGHT = 8;
const TABLE_TOTAL_ROWS = 9;
const TABLE_LEFT_X = PAGE_MARGIN_LEFT;
const TABLE_WIDTH = 250;
const COL_DAY = 20;
const COL_DATE = 50;
const COL_START = 90;
const COL_END = 120;
const COL_REGULAR = 150;
const COL_OVERTIME = 175;
const COL_BREAK = 200;
const COL_TOTAL = 220;
const AFTER_TABLE_MARGIN = 10;
const CHECKBOX_SIZE = 3;
const SIGNATURE_OFFSET_Y = 28;
const FOOTER_Y = 280;

let employeeSignatureDataUrl = null;

document.getElementById('employeeSig').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { employeeSignatureDataUrl = reader.result; };
    reader.readAsDataURL(file);
});

function submitForm() {
    const form = document.getElementById('hourForm');
    const formData = new FormData(form);
    generatePDF(formData);
}

function parseHours(value) {
    if (!value) return 0;
    return parseFloat(value.replace(',', '.')) || 0;
}

function addHoursToTime(start, hours) {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + Math.round(hours * 60);
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}`;
}

function getRegularHoursFromTable(dayPrefix) {
    const row = document.querySelector(`tr[data-day="${dayPrefix}"]`);
    if (!row) return 0;
    const td = row.querySelector('.regular-hours');
    if (!td) return 0;
    return parseFloat(td.textContent.replace(',', '.')) || 0;
}

function generatePDF(formData) {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });

    doc.setFontSize(16);
    doc.text('Urendeclaratie', PAGE_MARGIN_LEFT, TITLE_Y);

    doc.setFontSize(10);
    doc.text('Opdrachtgever', PAGE_MARGIN_LEFT, HEADER_START_Y);
    doc.text(formData.get('opdrachtgever')||'', HEADER_VALUE_X, HEADER_START_Y);
    doc.text('Werkadres', PAGE_MARGIN_LEFT, HEADER_START_Y+HEADER_LINE_HEIGHT);
    doc.text(formData.get('werkadres')||'', HEADER_VALUE_X, HEADER_START_Y+HEADER_LINE_HEIGHT);
    doc.text('PC + Plaats', PAGE_MARGIN_LEFT, HEADER_START_Y+HEADER_LINE_HEIGHT*2);
    doc.text(formData.get('pcplaats')||'', HEADER_VALUE_X, HEADER_START_Y+HEADER_LINE_HEIGHT*2);
    doc.text('Afdeling', PAGE_MARGIN_LEFT, HEADER_START_Y+HEADER_LINE_HEIGHT*3);
    doc.text(formData.get('afdeling')||'', HEADER_VALUE_X, HEADER_START_Y+HEADER_LINE_HEIGHT*3);

    doc.rect(INFO_BOX_X, INFO_BOX_Y, INFO_BOX_WIDTH, INFO_BOX_HEIGHT);
    for (let i=1;i<=3;i++){ doc.line(INFO_BOX_X, INFO_BOX_Y+INFO_BOX_ROW_HEIGHT*i, INFO_BOX_X+INFO_BOX_WIDTH, INFO_BOX_Y+INFO_BOX_ROW_HEIGHT*i);}
    doc.line(INFO_BOX_X+INFO_BOX_COLUMN_SPLIT, INFO_BOX_Y, INFO_BOX_X+INFO_BOX_COLUMN_SPLIT, INFO_BOX_Y+INFO_BOX_HEIGHT);

    doc.text('Weeknummer', INFO_BOX_X+2, INFO_BOX_Y+5);
    doc.text('Jaar', INFO_BOX_X+2, INFO_BOX_Y+5+INFO_BOX_ROW_HEIGHT);
    doc.text('Naam', INFO_BOX_X+2, INFO_BOX_Y+5+INFO_BOX_ROW_HEIGHT*2);
    doc.text('Woonplaats', INFO_BOX_X+2, INFO_BOX_Y+5+INFO_BOX_ROW_HEIGHT*3);
    doc.text(formData.get('weeknummer')||'', INFO_BOX_X+INFO_BOX_COLUMN_SPLIT+2, INFO_BOX_Y+5);
    doc.text(formData.get('jaar')||'', INFO_BOX_X+INFO_BOX_COLUMN_SPLIT+2, INFO_BOX_Y+5+INFO_BOX_ROW_HEIGHT);
    doc.text(formData.get('naam')||'', INFO_BOX_X+INFO_BOX_COLUMN_SPLIT+2, INFO_BOX_Y+5+INFO_BOX_ROW_HEIGHT*2);
    doc.text(formData.get('woonplaats')||'', INFO_BOX_X+INFO_BOX_COLUMN_SPLIT+2, INFO_BOX_Y+5+INFO_BOX_ROW_HEIGHT*3);

    doc.rect(TABLE_LEFT_X, TABLE_START_Y, TABLE_WIDTH, TABLE_ROW_HEIGHT*TABLE_TOTAL_ROWS);
    [COL_DATE,COL_START,COL_END,COL_REGULAR,COL_OVERTIME,COL_BREAK,COL_TOTAL].forEach(x=>{doc.line(x, TABLE_START_Y, x, TABLE_START_Y+TABLE_ROW_HEIGHT*TABLE_TOTAL_ROWS);});
    for (let i=1;i<=TABLE_TOTAL_ROWS;i++){ doc.line(TABLE_LEFT_X, TABLE_START_Y+TABLE_ROW_HEIGHT*i, TABLE_LEFT_X+TABLE_WIDTH, TABLE_START_Y+TABLE_ROW_HEIGHT*i);}

    doc.setFontSize(8);
    doc.text('DATUM', COL_DATE+2, TABLE_START_Y+5);
    doc.text('START TIJD', COL_START+2, TABLE_START_Y+5);
    doc.text('EIND TIJD', COL_END+2, TABLE_START_Y+5);
    doc.text('N.U.', COL_REGULAR+2, TABLE_START_Y+5);
    doc.text('O.W.', COL_OVERTIME+2, TABLE_START_Y+5);
    doc.text('PAUZE', COL_BREAK+2, TABLE_START_Y+5);
    doc.text('TOTAAL GEWERKTE UREN', COL_TOTAL+2, TABLE_START_Y+5);

    const days = [
        {name:'MAANDAG',prefix:'monday'},
        {name:'DINSDAG',prefix:'tuesday'},
        {name:'WOENSDAG',prefix:'wednesday'},
        {name:'DONDERDAG',prefix:'thursday'},
        {name:'VRIJDAG',prefix:'friday'},
        {name:'ZATERDAG',prefix:'saturday'},
        {name:'ZONDAG',prefix:'sunday'}
    ];

    let totalHoursWorked=0;
    days.forEach((day,index)=>{
        const y=TABLE_START_Y+TABLE_ROW_HEIGHT*(index+1)+5;
        doc.text(day.name,COL_DAY+2,y);
        const start=formData.get(`${day.prefix}_start`);
        const uren=parseHours(formData.get(`${day.prefix}_hours`));
        const end=addHoursToTime(start,uren);
        const regular=getRegularHoursFromTable(day.prefix);
        const overtime=parseHours(formData.get(`${day.prefix}_overtime`));
        const pause=parseHours(formData.get(`${day.prefix}_break`));
        const total=Math.max(0,regular+overtime-pause);
        totalHoursWorked+=total;
        doc.text(formData.get(`${day.prefix}_date`)||'',COL_DATE+2,y);
        doc.text(start||'',COL_START+2,y);
        doc.text(end||'',COL_END+2,y);
        doc.text(regular?regular.toFixed(1):'',COL_REGULAR+2,y);
        doc.text(overtime?overtime.toFixed(1):'',COL_OVERTIME+2,y);
        doc.text(pause?pause.toFixed(1):'',COL_BREAK+2,y);
        doc.text(total?total.toFixed(1):'',COL_TOTAL+2,y);
    });

    const totalRowY=TABLE_START_Y+TABLE_ROW_HEIGHT*(TABLE_TOTAL_ROWS-1)+5;
    doc.setFontSize(9);
    doc.text('TOTAAL',COL_DAY+2,totalRowY);
    doc.text(totalHoursWorked?totalHoursWorked.toFixed(1):'',COL_TOTAL+2,totalRowY);

    const BOTTOM_SECTION_Y=TABLE_START_Y+TABLE_ROW_HEIGHT*TABLE_TOTAL_ROWS+AFTER_TABLE_MARGIN;
    doc.setFontSize(9);
    doc.text(`Opmerkingen: ${formData.get('opmerkingen')||''}`,PAGE_MARGIN_LEFT,BOTTOM_SECTION_Y,{maxWidth:TABLE_WIDTH});

    const TRANSPORT_Y=BOTTOM_SECTION_Y+5;
    const transport=formData.get('transport');
    doc.rect(PAGE_MARGIN_LEFT,TRANSPORT_Y,CHECKBOX_SIZE,CHECKBOX_SIZE);
    if(transport==='bedrijfsauto') doc.text('X',PAGE_MARGIN_LEFT+1,TRANSPORT_Y+2.5);
    doc.text('Bedrijfsauto',PAGE_MARGIN_LEFT+5,TRANSPORT_Y+2.5);
    doc.rect(PAGE_MARGIN_LEFT+35,TRANSPORT_Y,CHECKBOX_SIZE,CHECKBOX_SIZE);
    if(transport==='eigenvervoer') doc.text('X',PAGE_MARGIN_LEFT+36,TRANSPORT_Y+2.5);
    doc.text('Eigen vervoer',PAGE_MARGIN_LEFT+40,TRANSPORT_Y+2.5);
    doc.text('Aantal kilometers',PAGE_MARGIN_LEFT+80,TRANSPORT_Y+2.5);
    doc.text(formData.get('kilometers')||'',PAGE_MARGIN_LEFT+110,TRANSPORT_Y+2.5);
    doc.text('Plaats van het werk:',PAGE_MARGIN_LEFT,TRANSPORT_Y+10);
    doc.text(formData.get('plaatswerk')||'',PAGE_MARGIN_LEFT+40,TRANSPORT_Y+10);

    const SIGNATURE_Y=BOTTOM_SECTION_Y+SIGNATURE_OFFSET_Y;
    doc.text('Akkoord opdrachtgever',PAGE_MARGIN_LEFT,SIGNATURE_Y);
    doc.text('Akkoord medewerker',PAGE_MARGIN_LEFT+100,SIGNATURE_Y);
    const clientSig=formData.get('akkoord_opdrachtgever');
    if(clientSig && clientSig.startsWith('data:image')) doc.addImage(clientSig,'PNG',PAGE_MARGIN_LEFT,SIGNATURE_Y+2,60,20);
    if(employeeSignatureDataUrl) doc.addImage(employeeSignatureDataUrl,'PNG',PAGE_MARGIN_LEFT+100,SIGNATURE_Y+2,60,20);

    doc.setFontSize(7);
    doc.text('N.U. = normale uren',PAGE_MARGIN_LEFT,FOOTER_Y);
    doc.text('O.W. = overwerken',PAGE_MARGIN_LEFT+60,FOOTER_Y);

    const weeknr=formData.get('weeknummer')||'XX';
    const jaar=formData.get('jaar')||'2025';
    const naam=formData.get('naam')||'Uren';
    doc.save(`Urendeclaratie_Week${weeknr}_${jaar}_${naam}.pdf`);
}