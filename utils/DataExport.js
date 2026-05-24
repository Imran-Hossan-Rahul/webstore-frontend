// utils/DataExport.js
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class DataExport {
  /**
   * Export data to CSV format
   */
  static toCSV(data, filename = 'export.csv') {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export data to Excel format
   */
  static toExcel(data, filename = 'export.xlsx', sheetName = 'Data') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-size columns
    const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 10);
    worksheet['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export data to JSON format
   */
  static toJSON(data, filename = 'export.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    saveAs(blob, filename);
  }

  /**
   * Export data to PDF format
   */
  static toPDF(data, filename = 'export.pdf', title = 'Analytics Report') {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Add table
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => headers.map(header => row[header]));
    
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc.save(filename);
  }

  /**
   * Export multiple datasets to Excel with multiple sheets
   */
  static toMultiSheetExcel(datasets, filename = 'export.xlsx') {
    const workbook = XLSX.utils.book_new();
    
    datasets.forEach(({ data, sheetName }) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export chart data with visualization metadata
   */
  static exportChartData(chartData, filename = 'chart-data.json') {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        chartType: chartData.type,
        title: chartData.title
      },
      data: chartData.data,
      config: chartData.config
    };
    
    this.toJSON(exportData, filename);
  }

  /**
   * Schedule automated export
   */
  static scheduleExport(config) {
    const { frequency, format, dataSource, email } = config;
    
    // This would typically call a backend API to set up scheduled exports
    return fetch('/api/analytics/schedule-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frequency, format, dataSource, email })
    });
  }

  /**
   * Export with filters and date range
   */
  static async exportWithFilters(endpoint, filters, format = 'csv') {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${endpoint}?${queryParams}`);
      const data = await response.json();
      
      const filename = `export-${new Date().toISOString().split('T')[0]}.${format}`;
      
      switch (format) {
        case 'csv':
          this.toCSV(data, filename);
          break;
        case 'excel':
          this.toExcel(data, filename);
          break;
        case 'json':
          this.toJSON(data, filename);
          break;
        case 'pdf':
          this.toPDF(data, filename);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Bulk export multiple reports
   */
  static async bulkExport(reports, format = 'excel') {
    const datasets = await Promise.all(
      reports.map(async report => {
        const response = await fetch(report.endpoint);
        const data = await response.json();
        return { data, sheetName: report.name };
      })
    );
    
    const filename = `bulk-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    this.toMultiSheetExcel(datasets, filename);
  }
}

export default DataExport;
