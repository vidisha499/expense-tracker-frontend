

import { Component, inject, AfterViewInit } from '@angular/core';
import { ExpenseService } from 'src/app/services/expense-service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
  standalone: false,
})
export class ChartsPage implements AfterViewInit {
  chart!: Chart<'doughnut'>;
  
  // Data for the list below the chart
  chartLabels: string[] = [];
  chartValues: number[] = [];
  chartColors: string[] = [];
  private router = inject(Router);

  constructor(private expenseService: ExpenseService) {}

  ngAfterViewInit() {
    this.loadChart();
  }

  ionViewDidEnter() {
    this.loadChart();
  }

  loadChart() {
    const data = this.expenseService.getExpenseChartData();
    this.chartLabels = data.labels;
    this.chartValues = data.values;
    this.chartColors = data.colors;

    const canvas = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: data.colors,
          borderWidth: 0, // No borders for a cleaner look
          hoverOffset: 20, // Expands slice on hover
          borderRadius: 10, // Rounded slices
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%', // Thinner doughnut
        plugins: {
          legend: { display: false }, // Using our custom list instead
          tooltip: {
            backgroundColor: '#2b1d52',
            padding: 12,
            cornerRadius: 10,
            titleFont: { size: 14, weight: 'bold' }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      },
    };

    this.chart = new Chart(canvas, config);
  }

  goToReports() {
    this.router.navigate(['/home/reports']);
  }
}