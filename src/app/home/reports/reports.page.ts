import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ExpenseService, Expense } from '../../services/expense-service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false,
})
export class ReportsPage implements OnInit {
  reportType: 'expense' | 'income' | 'all' | 'category' = 'all';
  selectedCategory: string = '';
  categories: string[] = []; 
  expensesList: Expense[] = [];

  startDate: string = new Date().toISOString();
  endDate: string = new Date().toISOString();

  constructor(
    private expenseService: ExpenseService,
    private platform: Platform
  ) {}

  ngOnInit() {
    // Listener for transactions
    this.expenseService.expenses$.subscribe((data: Expense[]) => {
      this.expensesList = data;
      this.updateCategoryDropdown();
    });

    // Listener for user-added categories to ensure they persist
    this.expenseService.categories$.subscribe(() => {
      this.updateCategoryDropdown();
    });
  }

  private updateCategoryDropdown() {
    const usedInTransactions = this.expensesList
      .map(e => e.expenseHead) 
      .filter((cat): cat is string => !!cat && cat.trim() !== '');

    this.expenseService.categories$.subscribe(savedCats => {
      const savedNames = savedCats.map(c => c.name);
      // Combine used heads and saved category names
      const combined = [...new Set([...usedInTransactions, ...savedNames])];
      this.categories = combined.sort();
    });
  }

  private getFilteredData(): Expense[] {
    return this.expensesList.filter((e) => {
      let matchesType = true;
      if (this.reportType === 'expense') matchesType = e.amount < 0;
      else if (this.reportType === 'income') matchesType = e.amount > 0;
      else if (this.reportType === 'category') {
        matchesType = this.selectedCategory === '' || (e.expenseHead === this.selectedCategory);
      }

      const expenseDate = new Date(e.date).getTime();
      const start = new Date(this.startDate).setHours(0, 0, 0, 0);
      const end = new Date(this.endDate).setHours(23, 59, 59, 999);
      return matchesType && (expenseDate >= start && expenseDate <= end);
    });
  }

  private getTotalAmount(data: Expense[]): number {
    return data.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  }

  async generatePDF() {
    const data = this.getFilteredData();
    const total = this.getTotalAmount(data);
    const doc = new jsPDF();

    let title = 'Transaction Report';
    if (this.reportType === 'category') {
      title = this.selectedCategory ? `Category: ${this.selectedCategory}` : 'All Categories Report';
    } else if (this.reportType === 'expense') {
      title = 'Expense Report';
    } else if (this.reportType === 'income') {
      title = 'Income Report';
    }

    // --- RESTORED ORIGINAL FORMATTING ---
    doc.setFontSize(20);
    doc.setTextColor(123, 92, 255); // Original Purple
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Period: ${new Date(this.startDate).toLocaleDateString()} - ${new Date(this.endDate).toLocaleDateString()}`, 14, 28);

    let y = 45;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 14, y);
    doc.text('Category', 50, y);
    doc.text('Description', 100, y);
    doc.text('Amount', 170, y);

    y += 4;
    doc.setDrawColor(123, 92, 255);
    doc.line(14, y, 195, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    data.forEach((exp) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(new Date(exp.date).toLocaleDateString(), 14, y);
      doc.text(exp.expenseHead || 'Uncategorized', 50, y);
      doc.text(exp.expenseName || '—', 100, y);
      
      if (exp.amount < 0) doc.setTextColor(200, 0, 0); // Red for expense
      else doc.setTextColor(0, 150, 0); // Green for income

      doc.text(`INR ${Math.abs(exp.amount).toLocaleString()}`, 170, y);
      doc.setTextColor(0);
      y += 8;
    });

    y += 5;
    doc.setDrawColor(200);
    doc.line(14, y, 195, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(123, 92, 255);
    doc.text('TOTAL', 100, y);
    doc.text(`INR ${total.toLocaleString()}`, 170, y);

    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;

    // MOBILE Logic
    if (this.platform.is('hybrid')) {
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      await this.saveAndOpenFile(pdfBase64, fileName, 'application/pdf');
    } else {
      doc.save(fileName);
    }
  }

  async generateExcel() {
    const data = this.getFilteredData();
    const reportData = data.map((exp) => ({
      Date: new Date(exp.date).toLocaleDateString(),
      Category: exp.expenseHead || 'Uncategorized',
      Description: exp.expenseName || '—',
      Amount: Math.abs(exp.amount),
      Type: exp.amount < 0 ? 'Expense' : 'Income'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    const fileName = `Report_${new Date().getTime()}.xlsx`;

    if (this.platform.is('hybrid')) {
      const excelBase64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      await this.saveAndOpenFile(excelBase64, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else {
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const { saveAs } = await import('file-saver');
      saveAs(blob, fileName);
    }
  }

  private async saveAndOpenFile(base64Data: string, fileName: string, contentType: string) {
    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });
      await FileOpener.open({ filePath: savedFile.uri, contentType });
    } catch (error) {
      console.error('File Error', error);
      alert('Cannot open file. Please ensure a viewer is installed.');
    }
  }
}