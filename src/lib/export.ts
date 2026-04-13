import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Profile, ShiftTemplate, ScheduleEntry } from "@/types/database";

type EntryWithShift = ScheduleEntry & { shift_template?: ShiftTemplate };

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(date.toISOString().slice(0, 10));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function getShiftForCell(
  entries: EntryWithShift[],
  userId: string,
  date: string
): EntryWithShift | undefined {
  return entries.find((e) => e.user_id === userId && e.date === date);
}

// ─── PDF Export ───────────────────────────────────────────────

export function exportSchedulePDF(
  employees: Profile[],
  entries: EntryWithShift[],
  shifts: ShiftTemplate[],
  month: number,
  year: number,
  orgName: string
) {
  const days = getDaysInMonth(year, month);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Title
  doc.setFontSize(14);
  doc.text(`Horário — ${MONTH_NAMES[month - 1]} ${year}`, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(orgName, 14, 21);

  // Legend
  let legendX = 14;
  const legendY = 27;
  doc.setFontSize(7);
  for (const s of shifts) {
    const hex = s.color || "#6B7280";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    doc.setFillColor(r, g, b);
    doc.rect(legendX, legendY - 2.5, 3, 3, "F");
    doc.setTextColor(80);
    doc.text(`${s.name} (${s.start_time.slice(0, 5)}-${s.end_time.slice(0, 5)})`, legendX + 4, legendY);
    legendX += doc.getTextWidth(`${s.name} (${s.start_time.slice(0, 5)}-${s.end_time.slice(0, 5)})`) + 8;
  }

  // Table headers
  const headers = [
    "Funcionário",
    ...days.map((d) => {
      const date = new Date(d + "T00:00:00");
      const dow = DOW_LABELS[date.getDay()];
      const num = date.getDate();
      return `${dow}\n${num}`;
    }),
  ];

  // Table body
  const body = employees.map((emp) => {
    const row = [emp.full_name];
    for (const day of days) {
      const entry = getShiftForCell(entries, emp.id, day);
      if (entry?.shift_template) {
        row.push(entry.shift_template.name.slice(0, 3));
      } else {
        row.push("—");
      }
    }
    return row;
  });

  // Build column styles for shift coloring
  const cellStyles: Record<string, Record<string, { fillColor?: [number, number, number]; textColor?: [number, number, number] }>> = {};

  autoTable(doc, {
    head: [headers],
    body,
    startY: 32,
    styles: {
      fontSize: 6,
      cellPadding: 1,
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [60, 60, 60],
      fontSize: 5.5,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 30, fontSize: 6.5 },
    },
    didParseCell(data) {
      // Color shift cells
      if (data.section === "body" && data.column.index > 0) {
        const empIdx = data.row.index;
        const dayIdx = data.column.index - 1;
        if (empIdx < employees.length && dayIdx < days.length) {
          const entry = getShiftForCell(entries, employees[empIdx].id, days[dayIdx]);
          if (entry?.shift_template?.color) {
            const hex = entry.shift_template.color;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            data.cell.styles.fillColor = [
              Math.min(255, r + 40),
              Math.min(255, g + 40),
              Math.min(255, b + 40),
            ];
            data.cell.styles.textColor = [r, g, b];
            data.cell.styles.fontStyle = "bold";
          }
          // Weekend shading
          const date = new Date(days[dayIdx] + "T00:00:00");
          if (date.getDay() === 0 || date.getDay() === 6) {
            if (!entry?.shift_template) {
              data.cell.styles.fillColor = [240, 240, 240];
            }
          }
        }
      }
      // Weekend header shading
      if (data.section === "head" && data.column.index > 0) {
        const dayIdx = data.column.index - 1;
        if (dayIdx < days.length) {
          const date = new Date(days[dayIdx] + "T00:00:00");
          if (date.getDay() === 0 || date.getDay() === 6) {
            data.cell.styles.fillColor = [230, 230, 230];
          }
        }
      }
    },
    margin: { left: 5, right: 5 },
    tableWidth: "auto",
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-PT")} — Shiftera`,
      14,
      doc.internal.pageSize.height - 5
    );
  }

  doc.save(`Horario_${MONTH_NAMES[month - 1]}_${year}.pdf`);
}

// ─── Excel Export ─────────────────────────────────────────────

export function exportScheduleExcel(
  employees: Profile[],
  entries: EntryWithShift[],
  shifts: ShiftTemplate[],
  month: number,
  year: number,
  orgName: string
) {
  const days = getDaysInMonth(year, month);

  // Header row
  const headerRow = [
    "Funcionário",
    ...days.map((d) => {
      const date = new Date(d + "T00:00:00");
      return `${DOW_LABELS[date.getDay()]} ${date.getDate()}`;
    }),
    "Total Horas",
  ];

  // Data rows
  const dataRows = employees.map((emp) => {
    const row: (string | number)[] = [emp.full_name];
    let totalHours = 0;

    for (const day of days) {
      const entry = getShiftForCell(entries, emp.id, day);
      if (entry?.shift_template) {
        row.push(entry.shift_template.name);
        // Calculate hours for this shift
        const startParts = entry.shift_template.start_time.split(":").map(Number);
        const endParts = entry.shift_template.end_time.split(":").map(Number);
        let hours = endParts[0] - startParts[0] + (endParts[1] - startParts[1]) / 60;
        if (hours < 0) hours += 24; // Overnight shift
        totalHours += hours;
      } else {
        row.push("");
      }
    }

    row.push(Math.round(totalHours * 10) / 10);
    return row;
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Schedule sheet
  const wsData = [
    [`Horário — ${MONTH_NAMES[month - 1]} ${year}`],
    [orgName],
    [],
    headerRow,
    ...dataRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws["!cols"] = [
    { wch: 25 },
    ...days.map(() => ({ wch: 8 })),
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Horário");

  // Summary sheet — hours per employee
  const summaryHeader = ["Funcionário", "Contrato", "Horas Semanais", "Horas Atribuidas", "Turnos Total"];
  const summaryRows = employees.map((emp) => {
    const empEntries = entries.filter((e) => e.user_id === emp.id);
    let totalHours = 0;
    for (const entry of empEntries) {
      if (entry.shift_template) {
        const startParts = entry.shift_template.start_time.split(":").map(Number);
        const endParts = entry.shift_template.end_time.split(":").map(Number);
        let hours = endParts[0] - startParts[0] + (endParts[1] - startParts[1]) / 60;
        if (hours < 0) hours += 24;
        totalHours += hours;
      }
    }
    return [
      emp.full_name,
      emp.contract_type === "full_time" ? "Tempo inteiro" : "Part-time",
      emp.weekly_hours,
      Math.round(totalHours * 10) / 10,
      empEntries.length,
    ];
  });

  const ws2Data = [
    [`Resumo — ${MONTH_NAMES[month - 1]} ${year}`],
    [],
    summaryHeader,
    ...summaryRows,
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Resumo");

  XLSX.writeFile(wb, `Horario_${MONTH_NAMES[month - 1]}_${year}.xlsx`);
}

// ─── Hours Report Export ──────────────────────────────────────

export function exportHoursReportExcel(
  employees: Profile[],
  entries: EntryWithShift[],
  month: number,
  year: number,
  orgName: string
) {
  const days = getDaysInMonth(year, month);

  const headers = [
    "Funcionário",
    "Contrato",
    "Horas/Semana",
    "Turnos Diurnos",
    "Turnos Noturnos",
    "Turnos Fim-de-Semana",
    "Horas Totais",
    "Horas Extra",
  ];

  const rows = employees.map((emp) => {
    const empEntries = entries.filter((e) => e.user_id === emp.id);
    let totalHours = 0;
    let dayShifts = 0;
    let nightShifts = 0;
    let weekendShifts = 0;

    for (const entry of empEntries) {
      if (!entry.shift_template) continue;
      const startHour = parseInt(entry.shift_template.start_time.split(":")[0]);
      const startParts = entry.shift_template.start_time.split(":").map(Number);
      const endParts = entry.shift_template.end_time.split(":").map(Number);
      let hours = endParts[0] - startParts[0] + (endParts[1] - startParts[1]) / 60;
      if (hours < 0) hours += 24;
      totalHours += hours;

      if (startHour >= 22 || startHour < 6) nightShifts++;
      else dayShifts++;

      const date = new Date(entry.date + "T00:00:00");
      if (date.getDay() === 0 || date.getDay() === 6) weekendShifts++;
    }

    // Rough overtime: assuming 4.33 weeks in a month
    const expectedMonthlyHours = emp.weekly_hours * 4.33;
    const overtime = Math.max(0, totalHours - expectedMonthlyHours);

    return [
      emp.full_name,
      emp.contract_type === "full_time" ? "Tempo inteiro" : "Part-time",
      emp.weekly_hours,
      dayShifts,
      nightShifts,
      weekendShifts,
      Math.round(totalHours * 10) / 10,
      Math.round(overtime * 10) / 10,
    ];
  });

  const wb = XLSX.utils.book_new();
  const wsData = [
    [`Relatorio de Horas — ${MONTH_NAMES[month - 1]} ${year}`],
    [orgName],
    [],
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    { wch: 25 }, { wch: 15 }, { wch: 13 }, { wch: 15 },
    { wch: 15 }, { wch: 20 }, { wch: 13 }, { wch: 13 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Horas");

  XLSX.writeFile(wb, `Relatorio_Horas_${MONTH_NAMES[month - 1]}_${year}.xlsx`);
}
