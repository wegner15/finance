import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';

interface MonthlyTrendChartProps {
  data: Array<{
    month: string;
    month_name: string;
    income: number;
    expenses: number;
  }>;
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return `KSH ${value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Monthly Transaction Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-lg font-medium">No transaction data available</p>
            <p className="text-sm text-gray-400 mt-2">Add transactions to see monthly trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data chronologically (oldest first)
  const sortedData = [...data].reverse();

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: function(params: any) {
        const income = params[0].value;
        const expenses = params[1].value;
        const net = income - expenses;
        return `
          <div style="padding: 8px;">
            <strong>${params[0].axisValue}</strong><br/>
            <span style="color: #10b981;">● Income: KSH ${income.toLocaleString()}</span><br/>
            <span style="color: #ef4444;">● Expenses: KSH ${expenses.toLocaleString()}</span><br/>
            <hr style="margin: 8px 0; border-color: #e5e7eb;"/>
            <strong style="color: ${net >= 0 ? '#10b981' : '#ef4444'};">Net: KSH ${net.toLocaleString()}</strong>
            <span style="font-size: 16px;">${net >= 0 ? ' 📈' : ' 📉'}</span>
          </div>
        `;
      },
    },
    legend: {
      data: ['Income', 'Expenses'],
      top: 10,
      textStyle: {
        fontSize: 12,
        fontWeight: 600,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sortedData.map(item => item.month_name),
      axisLine: {
        lineStyle: {
          color: '#9ca3af',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `KSH ${(value / 1000).toFixed(0)}K`,
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
        },
      },
    },
    series: [
      {
        name: 'Income',
        type: 'line',
        smooth: true,
        data: sortedData.map(item => item.income),
        lineStyle: {
          color: '#10b981',
          width: 3,
        },
        itemStyle: {
          color: '#10b981',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
        },
      },
      {
        name: 'Expenses',
        type: 'line',
        smooth: true,
        data: sortedData.map(item => item.expenses),
        lineStyle: {
          color: '#ef4444',
          width: 3,
        },
        itemStyle: {
          color: '#ef4444',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
        },
      },
    ],
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardTitle className="text-xl flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Monthly Transaction Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 text-sm text-gray-600">
          <p>Track your income and expenses over time. Hover over the chart for detailed information.</p>
        </div>
        
        <div className="mb-6">
          <ReactECharts 
            option={option} 
            style={{ height: '400px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="space-y-4">
          {sortedData.map((item, index) => {
            const net = item.income - item.expenses;
            const isProfit = net >= 0;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{item.month_name}</h3>
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${isProfit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isProfit ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    Net: {formatCurrency(Math.abs(net))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">Income</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(item.income)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-600 font-medium mb-1">Expenses</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(item.expenses)}</p>
                  </div>
                </div>
                
                {/* Visual bar */}
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(item.income / (item.income + item.expenses)) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(item.expenses / (item.income + item.expenses)) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendChart;
