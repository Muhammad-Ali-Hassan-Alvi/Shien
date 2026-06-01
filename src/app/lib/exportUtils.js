function escapeCsv(value) {
    const s = String(value ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function downloadCsv({ rows, headers, filename }) {
    const BOM = "\uFEFF";
    const headerLine = headers.map((h) => escapeCsv(h.label)).join(",");
    const body = rows
        .map((row) => headers.map((h) => escapeCsv(h.get(row))).join(","))
        .join("\n");
    const blob = new Blob([BOM + headerLine + "\n" + body], {
        type: "text/csv;charset=utf-8;",
    });
    triggerDownload(blob, filename);
}

export function printTableAsPdf({ title, subtitle, headers, rows, filename }) {
    const tableHead = headers.map((h) => `<th>${escapeHtml(h.label)}</th>`).join("");
    const tableBody = rows
        .map(
            (row) =>
                `<tr>${headers.map((h) => `<td>${escapeHtml(h.get(row))}</td>`).join("")}</tr>`
        )
        .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    p { color: #666; font-size: 12px; margin: 0 0 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background: #f5f5f5; font-weight: 700; text-transform: uppercase; font-size: 10px; }
    tr:nth-child(even) { background: #fafafa; }
    @media print {
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(subtitle)}</p>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 300);
    };
  </script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return false;
    win.document.write(html);
    win.document.close();
    return true;
}

export function getCustomerExportHeaders() {
    return [
        { label: "Name", get: (c) => c.name || "Unknown" },
        { label: "Email", get: (c) => c.email || "" },
        { label: "Phone", get: (c) => c.phone || "" },
        { label: "Role", get: (c) => (c.role || "user").toUpperCase() },
        {
            label: "Joined",
            get: (c) =>
                c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                      })
                    : "",
        },
        {
            label: "City",
            get: (c) => {
                const addr = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0];
                return addr?.city || "";
            },
        },
        {
            label: "Address",
            get: (c) => {
                const addr = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0];
                return addr?.address || "";
            },
        },
    ];
}

export function exportCustomersExcel(customers, filenamePrefix = "imart-customers") {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv({
        rows: customers,
        headers: getCustomerExportHeaders(),
        filename: `${filenamePrefix}-${date}.csv`,
    });
}

export function exportCustomersPdf(customers, filenamePrefix = "imart-customers") {
    const date = new Date().toLocaleString();
    printTableAsPdf({
        title: "Customer List",
        subtitle: `${customers.length} customer(s) · Exported ${date}`,
        headers: getCustomerExportHeaders(),
        rows: customers,
        filename: `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
}
