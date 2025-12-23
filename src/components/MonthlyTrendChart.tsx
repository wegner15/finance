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

  // Data is already sorted chronologically by the API (which reverses the DB desc order)
  // So we use data directly.
  const chartData = data;

  const option = {
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'transparent',
      borderWidth: 0,
      padding: 16,
      textStyle: {
        color: '#1f2937',
        fontFamily: 'Inter, sans-serif',
      },
      extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border-radius: 12px; backdrop-filter: blur(8px);',
      formatter: function (params: any) {
        const income = params[0].value;
        const expenses = params[1].value;
        const net = income - expenses;
        return `
          <div class="font-sans">
            <div class="text-sm font-semibold text-gray-500 mb-2">${params[0].axisValue}</div>
            <div class="flex items-center justify-between mb-1 gap-4">
              <span class="flex items-center text-sm font-medium text-emerald-600">
                <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Income
              </span>
              <span class="font-bold text-gray-900">KSH ${income.toLocaleString()}</span>
            </div>
            <div class="flex items-center justify-between mb-2 gap-4">
              <span class="flex items-center text-sm font-medium text-rose-600">
                <span class="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
                Expenses
              </span>
              <span class="font-bold text-gray-900">KSH ${expenses.toLocaleString()}</span>
            </div>
            <div class="h-px bg-gray-200 my-2"></div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-gray-700">Net</span>
              <span class="font-bold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
                ${net >= 0 ? '+' : ''}KSH ${net.toLocaleString()}
              </span>
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['Income', 'Expenses'],
      top: 0,
      icon: 'circle',
      textStyle: {
        fontSize: 13,
        fontWeight: 500,
        color: '#6b7280',
        fontFamily: 'Inter, sans-serif',
      },
      itemGap: 24,
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.map(item => item.month_name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        margin: 16,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        formatter: (value: number) => `KSH ${(value / 1000).toFixed(0)}K`,
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Income',
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        data: chartData.map(item => item.income),
        lineStyle: {
          color: '#10b981',
          width: 4,
          shadowColor: 'rgba(16, 185, 129, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        itemStyle: {
          color: '#10b981',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' },
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
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        data: chartData.map(item => item.expenses),
        lineStyle: {
          color: '#f43f5e',
          width: 4,
          shadowColor: 'rgba(244, 63, 94, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        itemStyle: {
          color: '#f43f5e',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(244, 63, 94, 0.4)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0.0)' },
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
    <Card className="shadow-xl bg-white dark:bg-gray-800 border-none overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 pb-4">
        <CardTitle className="text-xl flex items-center text-gray-900 dark:text-gray-100 font-bold">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" />
          Financial Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-8">
          <ReactECharts
            option={option}
            style={{ height: '350px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {chartData.slice().reverse().map((item, index) => { // Reverse here only for the list view to show latest first
            const net = item.income - item.expenses;
            const isProfit = net >= 0;

            return (
              <div key={index} className="group flex flex-col p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{item.month_name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${isProfit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {isProfit ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {((Math.abs(net) / (item.income || 1)) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Income</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.income)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Expenses</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.expenses)}</span>
                  </div>
                </div>

                {/* Mini Visualization Bar */}
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(item.income / (item.income + item.expenses || 1)) * 100}%` }}></div>
                  <div className="bg-rose-500 transition-all duration-500" style={{ width: `${(item.expenses / (item.income + item.expenses || 1)) * 100}%` }}></div>
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
