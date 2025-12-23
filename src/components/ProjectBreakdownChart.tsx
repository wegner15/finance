import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Folder from 'lucide-react/dist/esm/icons/folder';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';

interface ProjectBreakdownChartProps {
  data: Array<{
    project_name: string;
    project_id: number;
    income: number;
    expenses: number;
    total: number;
  }>;
}

const ProjectBreakdownChart: React.FC<ProjectBreakdownChartProps> = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  const formatCurrency = (value: number) => {
    return `KSH ${value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardTitle className="text-xl flex items-center">
            <Folder className="w-6 h-6 mr-2" />
            Transactions by Project
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p className="text-lg font-medium">No project data available</p>
            <p className="text-sm text-gray-400 mt-2">Assign transactions to projects to see breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVolume = data.reduce((sum, item) => sum + Math.abs(item.total), 0);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
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
        const percentage = ((Math.abs(income + expenses) / totalVolume) * 100).toFixed(1);
        return `
          <div style="padding: 8px;">
            <strong>${params[0].axisValue}</strong><br/>
            <span style="color: #10b981;">● Income: KSH ${income.toLocaleString()}</span><br/>
            <span style="color: #ef4444;">● Expenses: KSH ${expenses.toLocaleString()}</span><br/>
            <hr style="margin: 8px 0; border-color: #e5e7eb;"/>
            <strong style="color: ${net >= 0 ? '#10b981' : '#ef4444'};">Net: KSH ${net.toLocaleString()}</strong><br/>
            <span style="color: #6b7280; font-size: 11px;">${percentage}% of total activity</span>
          </div>
        `;
      },
    },
    legend: {
      data: ['Income', 'Expenses'],
      top: 10,
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `${(value / 1000).toFixed(0)}K`,
      },
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.project_name.length > 20 ? item.project_name.substring(0, 20) + '...' : item.project_name),
      axisLabel: {
        fontSize: 11,
      },
    },
    series: [
      {
        name: 'Income',
        type: 'bar',
        data: data.map(item => item.income),
        itemStyle: {
          color: '#10b981',
          borderRadius: [0, 4, 4, 0],
        },
        emphasis: {
          focus: 'series',
        },
      },
      {
        name: 'Expenses',
        type: 'bar',
        data: data.map(item => item.expenses),
        itemStyle: {
          color: '#ef4444',
          borderRadius: [0, 4, 4, 0],
        },
        emphasis: {
          focus: 'series',
        },
      },
    ],
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <CardTitle className="text-xl flex items-center">
          <Folder className="w-6 h-6 mr-2" />
          Transactions by Project
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 text-sm text-gray-600">
          <p>See which projects generate the most financial activity. Hover for details.</p>
        </div>
        
        <div className="mb-6">
          <ReactECharts 
            option={option} 
            style={{ height: `${Math.max(300, data.length * 60)}px` }}
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="space-y-3">
          {data.map((item, index) => {
            const net = item.income - item.expenses;
            const percentage = ((Math.abs(item.total) / totalVolume) * 100).toFixed(1);
            const isProfit = net >= 0;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <h3 className="font-bold text-gray-900">{item.project_name}</h3>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{percentage}%</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
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
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectBreakdownChart;
