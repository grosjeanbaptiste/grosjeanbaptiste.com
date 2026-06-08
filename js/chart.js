// Initialize daily life chart
document.addEventListener('DOMContentLoaded', function () {
    var ctx = document.getElementById('dailyLifeChart').getContext('2d');
    var dailyLifeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sleep', 'Transport', 'Work', 'Classes', 'Sport', 'Others'],
            datasets: [{
                data: [8, 2, 9, 3, 1, 5],
                backgroundColor: [
                    '#F3890B',
                    '#FF0000',
                    '#001F5A',
                    '#C0C0C0',
                    '#008000',
                    '#FFFF00'
                ],
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
});
