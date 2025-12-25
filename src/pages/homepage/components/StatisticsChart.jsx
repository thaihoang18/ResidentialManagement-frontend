import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
    { name: 'Nam', value: statistics.byGender.male || 0 },
    { name: 'Nữ', value: statistics.byGender.female || 0 },
  ];

  // Chuẩn bị dữ liệu cho biểu đồ độ tuổi
  const ageData = Object.entries(statistics.byAge || {}).map(([name, value]) => ({
    name,
    value: value || 0,
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Thống kê nhân khẩu</h2>
        <p className="text-gray-600 mt-2">Tổng số nhân khẩu: <span className="font-semibold text-blue-600">{statistics.total || 0}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biểu đồ tròn - Giới tính */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo giới tính</CardTitle>
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
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center space-y-1">
              <p className="text-sm text-gray-600">
                Nam: <span className="font-semibold">{statistics.byGender.male || 0}</span> người
              </p>
              <p className="text-sm text-gray-600">
                Nữ: <span className="font-semibold">{statistics.byGender.female || 0}</span> người
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Biểu đồ cột - Độ tuổi */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo độ tuổi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {ageData.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.name}:</span>
                  <span className="font-semibold">{item.value} người</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

