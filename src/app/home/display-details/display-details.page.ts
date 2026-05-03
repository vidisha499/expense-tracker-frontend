import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../services/expense-service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Platform, ModalController, AlertController, NavController } from '@ionic/angular';

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
    private platform: Platform,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async editExpense() {
    const { AddExpenseModalPage } = await import('../add-expense-modal/add-expense-modal.page');
    const modal = await this.modalCtrl.create({
      component: AddExpenseModalPage,
      componentProps: {
        existingExpense: this.expense
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      const isExpense = data.type === 'expense';
      const updated = {
        ...this.expense,
        ...data,
        amount: isExpense ? -Math.abs(+data.amount) : +data.amount,
        date: new Date(data.date)
      };
      this.expenseService.updateExpense(updated);
      this.expense = updated; // Update local view
    }
  }

  async deleteExpense() {
    const alert = await this.alertCtrl.create({
      header: 'Delete Record',
      message: 'Are you sure you want to remove this transaction forever?',
      cssClass: 'midnight-alert',
      buttons: [
        { text: 'Keep It', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.expense.id) {
              this.expenseService.deleteExpenseFromDB(this.expense.id);
              this.navCtrl.back();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async previewImage(imgUrl: string) {
    const modal = await this.modalCtrl.create({
      component: ImagePreviewComponent,
      componentProps: { imgUrl }
    });
    return await modal.present();
  }

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

@Component({
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar style="--background: #000; --color: #fff;">
        <ion-title style="font-size: 0.9rem; font-weight: 700;">Bill Preview</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()" style="--color: #fff; font-weight: 700;">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content style="--background: #000;">
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 10px;">
        <img [src]="imgUrl" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 0 30px rgba(255,255,255,0.1);">
      </div>
    </ion-content>
  `,
  standalone: false
})
export class ImagePreviewComponent {
  @Input() imgUrl: string = '';
  constructor(private modalCtrl: ModalController) {}
  close() { this.modalCtrl.dismiss(); }
}