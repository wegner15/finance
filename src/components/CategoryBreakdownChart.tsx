import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Tags from 'lucide-react/dist/esm/icons/tags';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';

interface CategoryBreakdownChartProps {
  data: Array<{
    category: string;
    income: number;
    expenses: number;
    total: number;
  }>;
}

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return `KSH ${value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardTitle className="text-xl flex items-center">
            <Tags className="w-6 h-6 mr-2" />
            Transactions by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-lg font-medium">No category data available</p>
            <p className="text-sm text-gray-400 mt-2">Add categories to transactions to see breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalActivity = data.reduce((sum, item) => sum + item.income + item.expenses, 0);

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: function(params: any) {
        const item = data[params.dataIndex];
        const net = item.income - item.expenses;
        return `
          <div style="padding: 8px;">
            <strong>${params.name}</strong><br/>
            <span style="color: #10b981;">● Income: KSH ${item.income.toLocaleString()}</span><br/>
            <span style="color: #ef4444;">● Expenses: KSH ${item.expenses.toLocaleString()}</span><br/>
            <hr style="margin: 8px 0; border-color: #e5e7eb;"/>
            <strong>Activity: ${params.percent}%</strong><br/>
            <strong style="color: ${net >= 0 ? '#10b981' : '#ef4444'};">Net: KSH ${net.toLocaleString()}</strong>
          </div>
        `;
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 11,
      },
      formatter: function(name: string) {
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
      },
    },
    series: [
      {
        name: 'Category Activity',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: function(params: any) {
              return `${params.name}\n${params.percent}%`;
            },
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item, index) => ({
          value: item.income + item.expenses,
          name: item.category || 'Uncategorized',
          itemStyle: {
            color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'][index % 8],
          },
        })),
      },
    ],
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <CardTitle className="text-xl flex items-center">
          <Tags className="w-6 h-6 mr-2" />
          Transactions by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 text-sm text-gray-600">
          <p>Understand your spending patterns by category. Click on segments for details.</p>
        </div>
        
        <div className="mb-6">
          <ReactECharts 
            option={option} 
            style={{ height: '400px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="space-y-3">
          {data.map((item, index) => {
            const net = item.income - item.expenses;
            const activityPercentage = (((item.income + item.expenses) / totalActivity) * 100).toFixed(1);
            const isProfit = net >= 0;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{item.category || 'Uncategorized'}</h3>
                  <span className="text-sm font-semibold text-gray-500">{activityPercentage}% activity</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Income</p>
                    <p className="font-semibold text-green-600">{formatCurrency(item.income)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expenses</p>
                    <p className="font-semibold text-red-600">{formatCurrency(item.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Net</p>
                    <p className={`font-semibold flex items-center ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                      {isProfit ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatCurrency(Math.abs(net))}
                    </p>
                  </div>
                </div>
                
                {/* Visual bar showing income vs expenses */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(item.income / (item.income + item.expenses)) * 100}%` }}
                    title={`Income: ${formatCurrency(item.income)}`}
                  ></div>
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(item.expenses / (item.income + item.expenses)) * 100}%` }}
                    title={`Expenses: ${formatCurrency(item.expenses)}`}
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

export default CategoryBreakdownChart;
