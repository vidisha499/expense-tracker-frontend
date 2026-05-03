

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
        cutout: '75%', 
        // Force chart to listen to all mouse and touch events
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            position: 'average',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            padding: 15,
            cornerRadius: 15,
            displayColors: true,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                return ` ₹${value.toLocaleString()}`;
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false, // This makes it show details even if you are just 'near' the slice
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

  get totalAmount(): number {
    return this.chartValues.reduce((sum, val) => sum + val, 0);
  }

  getRGB(hex: string): string {
    if (!hex || hex.length < 7) return '139, 92, 246';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  getIcon(label: string): string {
    const icons: { [key: string]: string } = {
      'Food & Dining': 'restaurant',
      'Shopping': 'cart',
      'Travel': 'airplane',
      'Fuel': 'speedometer',
      'Coffee': 'cafe',
      'Salary': 'cash',
      'Medical': 'medkit',
      'Entertainment': 'game-controller',
      'Education': 'school',
      'Personal Care': 'cut',
      'Freelance': 'laptop',
      'Business': 'briefcase',
      'Others': 'grid'
    };
    return icons[label.trim()] || 'cube-outline';
  }
}