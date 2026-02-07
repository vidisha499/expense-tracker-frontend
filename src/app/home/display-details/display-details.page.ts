import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../services/expense-service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-display-details',
  templateUrl: './display-details.page.html',
  styleUrls: ['./display-details.page.scss'],
  standalone: false,
})
export class DisplayDetailsPage implements OnInit {
  images: string[] = [];
  expense: any;
  index!: number;

  constructor(
    private route: ActivatedRoute,
    private expenseService: ExpenseService,
    private platform: Platform
  ) {}

  ngOnInit() {
    const indexParam = this.route.snapshot.paramMap.get('index');
    if (indexParam !== null) {
      this.index = Number(indexParam);
      this.expenseService.expenses$.subscribe(data => {
        if (data && data[this.index]) {
          this.expense = data[this.index];
          this.images = this.expense.bills || [];
          console.log("Loaded Expense:", this.expense);
        }
      });
    }
  }

  async generateReport() {
    console.log("Generate Report Clicked");
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;

      // 1. Header (Voucher Style)
      doc.setFillColor(106, 17, 203);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      const title = this.expense.type === 'expense' ? 'EXPENSE VOUCHER' : 'INCOME VOUCHER';
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      const dateStr = new Date(this.expense.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
      doc.text(dateStr, pageWidth / 2, 30, { align: 'center' });

      // 2. A/C Head & Payment Mode
      doc.setTextColor(106, 17, 203);
      doc.setFontSize(14);
      doc.text(`A/C Head: ${this.expense.expenseHead || 'General'}`, margin, 55);
      
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(pageWidth - margin - 35, 48, 35, 10, 3, 3, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text((this.expense.paymentMode || 'CASH').toUpperCase(), pageWidth - margin - 17.5, 54.5, { align: 'center' });

      // 3. Main Table (Category Removed & Fixed Widths)
      autoTable(doc, {
        startY: 70,
        margin: { left: margin, right: margin },
        head: [['Particulars & Details', 'Amount (Rs.)']],
        body: [
          [
            { content: `${this.expense.expenseName || this.expense.title}\nRemark: ${this.expense.remark || 'None'}` },
            { content: `${Number(this.expense.amount).toFixed(2)}` }
          ]
        ],
        headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' } 
        },
        theme: 'grid',
        styles: { cellPadding: 5, fontSize: 11, lineColor: [200, 200, 200] }
      });

      const finalY = (doc as any).lastAutoTable.finalY;

      // 4. Footer Section (Total and Status)
      doc.setDrawColor(33, 150, 243);
      doc.setLineWidth(1.5);
      doc.line(margin, finalY + 5, pageWidth - margin, finalY + 5);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Transaction Status: Approved`, margin, finalY + 20);

      doc.setTextColor(106, 17, 203);
      doc.setFontSize(18);
      const totalText = `Total: Rs. ${Number(this.expense.amount).toLocaleString('en-IN')}`;
      doc.text(totalText, pageWidth - margin, finalY + 20, { align: 'right' });

      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text(`Prepared By: ${this.expense.expenseDoneBy || 'System User'}`, pageWidth - margin, finalY + 35, { align: 'right' });

      // --- MOBILE FIXES ---
      const fileName = `Voucher_${Date.now()}.pdf`;

      if (this.platform.is('hybrid')) {
        // Handle Mobile (Android/iOS)
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Documents,
          recursive: true
        });

        await FileOpener.open({
          filePath: savedFile.uri,
          contentType: 'application/pdf',
        });
      } else {
        // Handle Desktop Browser
        doc.save(fileName);
      }

    } catch (error) {
      console.error("Report Generation Error:", error);
    }
  }
}