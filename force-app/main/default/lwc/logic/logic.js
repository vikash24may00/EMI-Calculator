import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import ChartJs from '@salesforce/resourceUrl/ChartJs';

export default class EmiCalculator extends LightningElement {
    loanAmount = 50000;
    interestRate = 5.0;
    termYears = 10;
    emi = 0;
    chart;
    isChartJsInitialized = false;


    connectedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;

        loadScript(this, ChartJs)
            .then(() => {
                this.initializeChart();
            })
            .catch(error => {
                console.error('Error loading ChartJs', error);
            });

        this.calculateEmi();
    }

    handleSliderChange(event) {
        const fieldName = event.target.dataset.id;
        this[fieldName] = event.target.value;
        this.calculateEmi();
        this.updateChart();
    }

    calculateEmi() {
        const P = parseFloat(this.loanAmount);
        const R = parseFloat(this.interestRate) / 100 / 12;
        const T = parseFloat(this.termYears) * 12;

        const emiValue = (P * R * Math.pow(1 + R, T)) / (Math.pow(1 + R, T) - 1);
        this.emi = emiValue.toFixed(2);
    }

    renderedCallback() {
        
    }

    initializeChart() {
        const ctx = this.template.querySelector('canvas[data-id="emiChart"]').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor:['Red','Green'],
                    borderColor:['Blue','Yellow'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        this.updateChart();
    }

    updateChart() {
        const totalInterest = this.calculateTotalInterest();
        const totalPrincipal = parseFloat(this.loanAmount);

        this.chart.data.datasets[0].data = [totalPrincipal, totalInterest];
        this.chart.update();
    }

    // updateChart() {
    //     const totalInterest = this.calculateTotalInterest();
    
    //     this.chart.data.datasets[0].data = [totalInterest]; // Update only interest data
    //     this.chart.update();
    // }

    calculateTotalInterest() {
        const P = parseFloat(this.loanAmount);
        const R = parseFloat(this.interestRate) / 100 / 12;
        const T = parseFloat(this.termYears) * 12;

        const emiValue = (P * R * Math.pow(1 + R, T)) / (Math.pow(1 + R, T) - 1);
        const totalPayment = emiValue * T;
        const totalInterest = totalPayment - P;

        return totalInterest.toFixed(2);
    }
}
