import { apiClient } from './apiClient.js';
import * as XLSX from 'xlsx';

export type ExportModule = 'donors' | 'requests' | 'donations' | 'reports' | 'logs' | 'users';
export type ExportFormat = 'xlsx' | 'csv' | 'pdf';
export type ExportScope = 'all' | 'filtered' | 'current';

export interface ExportFilterParams {
  module: ExportModule;
  format: ExportFormat;
  scope: ExportScope;
  startDate?: string;
  endDate?: string;
  bloodGroup?: string;
  district?: string;
  upazila?: string;
  availability?: string;
  requestStatus?: string;
  userRole?: string;
}

export interface ExportResponseData {
  success: boolean;
  filename: string;
  module: ExportModule;
  format: ExportFormat;
  recordCount: number;
  filterSummary: string;
  data: Record<string, any>[];
  auditMeta: {
    userId: string;
    userName: string;
    role: string;
    exportTime: string;
    ipAddress: string;
    deviceInfo: string;
  };
  error?: string;
}

export const exportService = {
  async fetchExportData(params: ExportFilterParams): Promise<ExportResponseData> {
    const res = await apiClient<ExportResponseData>('/export/data', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (res.error || !res.data) {
      throw new Error(res.error || 'এক্সপোর্ট ফাইল তৈরিতে ব্যর্থ হয়েছে।');
    }

    return res.data;
  },

  downloadFile(exportResult: ExportResponseData): void {
    const { data, filename, format, module, filterSummary, auditMeta } = exportResult;

    if (!data || data.length === 0) {
      throw new Error('এক্সপোর্ট করার মত কোনো ডাটা পাওয়া যায়নি।');
    }

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, module.toUpperCase());
      XLSX.writeFile(workbook, filename);
    } else if (format === 'csv') {
      if (data.length === 0) return;
      const headers = Object.keys(data[0]);
      const csvRows: string[] = [];

      csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

      for (const row of data) {
        const values = headers.map(h => {
          const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = '\uFEFF' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Create a printable HTML view in a popup or print frame for PDF download
      const headers = Object.keys(data[0]);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('পপ-আপ উইন্ডো অবরুদ্ধ রয়েছে। অনুগ্রহ করে পপ-আপ অনুমতি দিন।');
      }

      const tableHeadersHtml = headers.map(h => `<th style="border: 1px solid #cbd5e1; padding: 6px 8px; background-color: #f1f5f9; text-align: left; font-size: 11px;">${h}</th>`).join('');
      const tableRowsHtml = data.map((row, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        const cols = headers.map(h => `<td style="border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 10px; color: #334155;">${row[h] ?? ''}</td>`).join('');
        return `<tr style="background-color: ${bg};">${cols}</tr>`;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <style>
            body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 20px; color: #0f172a; margin: 0; }
            .header { text-align: center; margin-bottom: 20px; border-b: 2px solid #e2e8f0; padding-bottom: 15px; }
            .header h1 { font-size: 18px; color: #dc2626; margin: 0 0 5px 0; }
            .header p { font-size: 12px; color: #64748b; margin: 0; }
            .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 11px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 10px; }
            @media print {
              body { padding: 0; }
              @page { size: landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>পাংশা ব্লাড ডোনার্স এসোসিয়েশন (PBDA)</h1>
            <p>অফিসিয়াল ডাটা এক্সপোর্ট রিপোর্ট - ${module.toUpperCase()}</p>
          </div>

          <div class="meta-box">
            <strong>এক্সপোর্ট ফরম্যাট:</strong> PDF | <strong>ফাইলের নাম:</strong> ${filename}<br>
            <strong>ফিল্টার তথ্য:</strong> ${filterSummary}<br>
            <strong>মোট রেকর্ড:</strong> ${data.length} টি | <strong>এক্সপোর্টকারী:</strong> ${auditMeta.userName} (${auditMeta.role})<br>
            <strong>তারিখ ও সময়:</strong> ${new Date(auditMeta.exportTime).toLocaleString('bn-BD')}
          </div>

          <table>
            <thead>
              <tr>${tableHeadersHtml}</tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>গোপনীয় তথ্য - শুধুমাত্র দাপ্তরিক কাজের ব্যবহারের জন্য সংরক্ষিত। © PBDA Management System</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  }
};
