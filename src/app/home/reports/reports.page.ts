

import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExpenseService, Expense } from '../../services/expense-service';

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

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    // This listener automatically updates the dropdown whenever a user adds a new transaction
    this.expenseService.expenses$.subscribe((data: Expense[]) => {
      this.expensesList = data;
      
      // We target 'expenseHead' specifically, as this is the field from your Add Expense modal
      const userDefinedCategories = data
        .map(e => e.expenseHead) 
        .filter((cat): cat is string => !!cat && cat.trim() !== ''); // Removes null, undefined, or empty strings

      // Create a unique list and sort it alphabetically
      this.categories = [...new Set(userDefinedCategories)].sort();
    });
  }

  private getFilteredData(): Expense[] {
    return this.expensesList.filter((e) => {
      let matchesType = true;
      
      if (this.reportType === 'expense') {
        matchesType = e.amount < 0;
      } else if (this.reportType === 'income') {
        matchesType = e.amount > 0;
      } else if (this.reportType === 'category') {
        // If "All Categories" is selected (empty string), show everything. 
        // Otherwise, match exactly what the user picked.
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

  generatePDF() {
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

    doc.setFontSize(20);
    doc.setTextColor(123, 92, 255);
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
      
      if (exp.amount < 0) doc.setTextColor(200, 0, 0);
      else doc.setTextColor(0, 150, 0);

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

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  }

  generateExcel() {
    const data = this.getFilteredData();
    const reportData = data.map((exp) => ({
      Date: new Date(exp.date).toLocaleDateString(),
      Category: exp.expenseHead || 'Uncategorized',
      Description: exp.expenseName || '—',
      Amount: Math.abs(exp.amount),
      Type: exp.amount < 0 ? 'Expense' : 'Income'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = { Sheets: { Report: worksheet }, SheetNames: ['Report'] };
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `Report_${new Date().getTime()}.xlsx`);
  }
}