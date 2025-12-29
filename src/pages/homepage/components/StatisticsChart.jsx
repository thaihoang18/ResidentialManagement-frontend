import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#00c2a8', '#e052a2', '#64748b', '#0f766e', '#06b6d4', '#fbbf24'];

export default function StatisticsChart() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/residents/statistics');
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}: Lỗi tải dữ liệu thống kê`);
      }
      
      if (json.success) {
        setStatistics(json.data);
      } else {
        throw new Error(json.error || 'Lỗi không xác định');
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê';
      setError(errorMessage);
      console.error('Statistics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo giới tính</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo độ tuổi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Lỗi: {error}</p>
            <button
              onClick={fetchStatistics}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  // Chuẩn bị dữ liệu cho biểu đồ giới tính
  const genderData = [
    { name: 'Nam', value: statistics.byGender.male || 0, color: '#00c2a8' },
    { name: 'Nữ', value: statistics.byGender.female || 0, color: '#e052a2' },
  ];

  // Chuẩn bị dữ liệu cho biểu đồ độ tuổi
  const ageData = Object.entries(statistics.byAge || {}).map(([name, value]) => ({
    name,
    value: value || 0,
  }));

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-10">
        <div className="inline-block mb-3">
          <h2 className="px-4 py-1.5 bg-teal-100 text-teal-600 rounded-full text-2xl font-bold">PHÂN TÍCH DÂN SỐ</h2>
        </div>
        <p className="text-slate-600 text-lg">Tổng cộng: <span className="font-bold text-teal-600 text-2xl">{statistics.total || 0}</span> <span className="text-slate-600">cư dân</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Biểu đồ tròn - Giới tính */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-800">Phân bố theo giới tính</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#00c2a8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={600}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} người`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-teal-100 hover:border-teal-300 hover:bg-teal-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{backgroundColor: '#00c2a8'}}></div>
                  <span className="text-slate-700 font-medium">Nam</span>
                </div>
                <span className="font-bold text-teal-600 text-lg">{statistics.byGender.male || 0}</span>
              </div>
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-pink-100 hover:border-pink-300 hover:bg-pink-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{backgroundColor: '#e052a2'}}></div>
                  <span className="text-slate-700 font-medium">Nữ</span>
                </div>
                <span className="font-bold text-pink-600 text-lg">{statistics.byGender.female || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biểu đồ cột - Độ tuổi */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-800">Phân bố theo độ tuổi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #00c2a8', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(0, 194, 168, 0.1)' }}
                />
                <Bar dataKey="value" fill="#00c2a8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {ageData.map((item, index) => (
                <div key={index} className="flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 p-3 rounded-lg border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all">
                  <span className="text-slate-600 text-xs font-medium mb-1">{item.name}</span>
                  <span className="font-bold text-teal-600 text-lg">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

