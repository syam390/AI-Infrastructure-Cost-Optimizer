import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

interface CostChartsProps {
  distribution: any[];
  comparison: any[];
  utilization?: any[];
}

const COLORS = ['#f87171', '#fbbf24', '#34d399'];

export const CostCharts: React.FC<CostChartsProps> = ({ distribution, comparison, utilization }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 h-[350px]">
          <h3 className="text-zinc-400 text-sm font-medium mb-6 uppercase tracking-wider">Optimization Opportunities</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e4' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 h-[350px]">
          <h3 className="text-zinc-400 text-sm font-medium mb-6 uppercase tracking-wider">Cost Comparison</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparison}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                cursor={{ fill: '#27272a' }}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e4' }}
                formatter={(value: number) => [`$${(value || 0).toLocaleString()}`, 'Cost']}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                <Cell fill="#3f3f46" />
                <Cell fill="#8b5cf6" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {utilization && utilization.length > 0 && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 h-[350px]">
          <h3 className="text-zinc-400 text-sm font-medium mb-6 uppercase tracking-wider">Resource Utilization (Top Instances)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={utilization}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                cursor={{ fill: '#27272a' }}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e4' }}
                formatter={(value: number, name: string) => [`${(value || 0).toFixed(1)}%`, name.toUpperCase()]}
              />
              <Legend verticalAlign="bottom" height={36}/>
              <Bar dataKey="cpu" name="CPU" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="memory" name="Memory" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
