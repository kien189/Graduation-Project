import React from 'react';
import './RevenueByCinema.css';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement } from 'chart.js';

// Đăng ký các thành phần cần thiết cho ChartJS
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement);

const RevenueByCinema = () => {
    const revenueData = [
        { cinema: 'Rạp 1', revenue: 10000 },
        { cinema: 'Rạp 2', revenue: 15000 },
        { cinema: 'Rạp 3', revenue: 8000 },
    ];

    const totalRevenue = revenueData.reduce((acc, item) => acc + item.revenue, 0);

    const areaData = {
        labels: revenueData.map(item => item.cinema),
        datasets: [{
            label: 'Doanh thu',
            data: revenueData.map(item => item.revenue),
            backgroundColor: 'rgba(39, 174, 96, 0.4)', // Xanh lá nhạt với độ trong suốt
            borderColor: '#27ae60', // Xanh lá đậm
            borderWidth: 2,
            fill: true, // Hiển thị dạng biểu đồ vùng
        }],
    };

    const pieData = {
        labels: revenueData.map(item => item.cinema),
        datasets: [{
            label: 'Phân phối doanh thu',
            data: revenueData.map(item => item.revenue),
            backgroundColor: ['#27ae60', '#3498db', '#e74c3c'],
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    };

    return (
        <div className="revenue-display">
            <h2>Tổng quan doanh thu</h2>
            <div className="summary-card">
                <h3>Đã thanh toán</h3>
                <p className="total-revenue">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="summary-card">
                <h3>Chờ thanh toán</h3>
                <p className="total-revenue">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="summary-card">
                <h3>Chưa thanh toán</h3>
                <p className="total-revenue">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="chart-container">
                <div className="chart-section1">
                    <h3>Doanh thu theo rạp (Biểu đồ vùng)</h3>
                    <Line data={areaData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `$${context.raw}`,
                                },
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Các rạp',
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Doanh thu',
                                },
                                ticks: {
                                    callback: (value) => `$${value}`,
                                },
                            },
                        },
                    }} />
                </div>
                <div className="chart-section2">
                    <h3>Phân phối doanh thu (Biểu đồ tròn)</h3>
                    <Pie data={pieData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `${context.label}: $${context.raw}`,
                                },
                            },
                        },
                    }} />
                </div>
            </div>
            <button className="export-btn">Xuất báo cáo</button>
        </div>
    );
};

export default RevenueByCinema;
