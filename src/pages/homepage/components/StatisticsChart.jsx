import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#00c2a8', '#e052a2', '#64748b', '#0f766e', '#06b6d4', '#fbbf24'];

export default function StatisticsChart() {
  const [statistics, setStatistics] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [topHouseholds, setTopHouseholds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [topHouseholdsLoading, setTopHouseholdsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceError, setAttendanceError] = useState(null);
  const [topHouseholdsError, setTopHouseholdsError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(''); // 'YYYY-MM'

  useEffect(() => {
    fetchStatistics();
    fetchAttendanceStatistics();
    fetchTopHouseholds();
  }, []);

  // Set tháng gần nhất khi có dữ liệu (chỉ set một lần)
  useEffect(() => {
    if (attendanceStats?.meetings && attendanceStats.meetings.length > 0 && selectedMonth === '') {
      const meetings = attendanceStats.meetings;
      const monthsSet = new Set();
      meetings.forEach(meeting => {
        if (meeting.time) {
          const date = new Date(meeting.time);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthsSet.add(monthKey);
        }
      });
      const availableMonths = Array.from(monthsSet).sort().reverse();
      if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0]); // Set tháng gần nhất
      }
    }
  }, [attendanceStats]);

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

  const fetchAttendanceStatistics = async () => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const res = await fetch('/api/attendance/statistics');
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}: Lỗi tải dữ liệu thống kê tham gia`);
      }
      
      if (json.success) {
        setAttendanceStats(json.data);
      } else {
        throw new Error(json.error || 'Lỗi không xác định');
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê tham gia';
      setAttendanceError(errorMessage);
      console.error('Attendance statistics error:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchTopHouseholds = async () => {
    setTopHouseholdsLoading(true);
    setTopHouseholdsError(null);
    try {
      const res = await fetch('/api/attendance/top-households');
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}: Lỗi tải dữ liệu top hộ gia đình`);
      }
      
      if (json.success) {
        setTopHouseholds(json.data);
      } else {
        throw new Error(json.error || 'Lỗi không xác định');
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải dữ liệu top hộ gia đình';
      setTopHouseholdsError(errorMessage);
      console.error('Top households error:', err);
    } finally {
      setTopHouseholdsLoading(false);
    }
  };

  if (loading || attendanceLoading) {
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thống kê tham gia họp</CardTitle>
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
    { name: 'Nam', value: statistics.byGender?.male || 0, color: '#00c2a8' },
    { name: 'Nữ', value: statistics.byGender?.female || 0, color: '#e052a2' },
  ];

  // Chuẩn bị dữ liệu cho biểu đồ độ tuổi
  const ageData = Object.entries(statistics.byAge || {}).map(([name, value]) => ({
    name,
    value: value || 0,
  }));

  // Chuẩn bị dữ liệu cho biểu đồ đường tham gia họp
  const attendanceDataRaw = attendanceStats?.meetings || [];
  
  // Lấy danh sách các tháng/năm có dữ liệu
  const getAvailableMonths = () => {
    const monthsSet = new Set();
    attendanceDataRaw.forEach(meeting => {
      if (meeting.time) {
        const date = new Date(meeting.time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(monthKey);
      }
    });
    return Array.from(monthsSet).sort().reverse(); // Sắp xếp từ mới nhất đến cũ nhất
  };
  
  const availableMonths = getAvailableMonths();
  
  // Filter dữ liệu theo tháng đã chọn
  const filterAttendanceData = () => {
    if (!selectedMonth) {
      return []; // Chưa chọn tháng thì không hiển thị gì
    }
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const filtered = attendanceDataRaw.filter(meeting => {
      if (!meeting.time) return false;
      
      const meetingDate = new Date(meeting.time);
      return meetingDate.getFullYear() === year && meetingDate.getMonth() + 1 === month;
    });
    
    return filtered;
  };
  
  const filteredData = filterAttendanceData();
  
  // Chuẩn bị dữ liệu - chỉ hiển thị ngày trên trục X, tên cuộc họp trong tooltip
  const attendanceData = filteredData.map((meeting, index) => {
    // Chỉ dùng ngày làm label, không có tên cuộc họp để tránh bị đè
    const label = meeting.date;
    
    return {
      ...meeting,
      label: label, // Label cho trục X (chỉ ngày)
      fullTopic: meeting.topic || `Cuộc họp ${index + 1}` // Tên đầy đủ cho tooltip
    };
  });

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-10">
        <div className="inline-block mb-3">
          <h2 className="px-4 py-1.5 bg-teal-100 text-teal-600 rounded-full text-2xl font-bold">PHÂN TÍCH DÂN SỐ</h2>
        </div>
        <p className="text-slate-600 text-lg">Tổng cộng: <span className="font-bold text-teal-600 text-2xl">{statistics.total || 0}</span> <span className="text-slate-600">cư dân</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

      {/* Biểu đồ đường - Tham gia họp */}
      <div className="mt-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800">Mức độ tham gia các cuộc họp</CardTitle>
                {attendanceStats && (
                  <p className="text-sm text-slate-600 mt-2">
                    Tổng số hộ: <span className="font-semibold text-teal-600">{attendanceStats.totalHouseholds || 0}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="monthFilter" className="text-sm text-slate-600 font-medium">
                  Chọn tháng:
                </label>
                <select
                  id="monthFilter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-700 bg-white hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  disabled={availableMonths.length === 0}
                >
                  {availableMonths.length === 0 ? (
                    <option value="">Đang tải...</option>
                  ) : (
                    availableMonths.map(monthKey => {
                      const [year, month] = monthKey.split('-');
                      const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                                        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
                      return (
                        <option key={monthKey} value={monthKey}>
                          {monthNames[parseInt(month) - 1]} {year}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {attendanceError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">Lỗi: {attendanceError}</p>
                <button
                  onClick={fetchAttendanceStatistics}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Thử lại
                </button>
              </div>
            ) : !selectedMonth ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : attendanceData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Không có dữ liệu tham gia họp trong tháng đã chọn</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={attendanceData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                    maxBarSize={80}
                    style={{ filter: 'none' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="label" 
                      angle={0}
                      textAnchor="middle"
                      height={60}
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                      interval={0}
                      minTickGap={10}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b' }}
                      label={{ value: 'Số hộ', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #00c2a8', borderRadius: '8px', whiteSpace: 'pre-wrap' }}
                      formatter={(value, name) => {
                        if (name === 'attendanceRate') {
                          return [`${value}%`, 'Tỷ lệ tham gia'];
                        }
                        return [value, name === 'attended' ? 'Tham gia' : 'Vắng mặt'];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0] && payload[0].payload) {
                          const meeting = payload[0].payload;
                          return `Ngày: ${meeting.date}\nCuộc họp: ${meeting.fullTopic || meeting.topic}`;
                        }
                        return `Ngày: ${label}`;
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'attendanceRate') return 'Tỷ lệ tham gia (%)';
                        if (value === 'attended') return 'Số hộ tham gia';
                        if (value === 'absent') return 'Số hộ vắng mặt';
                        return value;
                      }}
                    />
                    <Bar 
                      dataKey="attended" 
                      stackId="households"
                      fill="#10b981" 
                      name="attended"
                      radius={[0, 0, 0, 0]}
                      activeBar={{ fillOpacity: 1, stroke: '#10b981', strokeWidth: 2, filter: 'none' }}
                    />
                    <Bar 
                      dataKey="absent" 
                      stackId="households"
                      fill="#ef4444" 
                      name="absent"
                      radius={[8, 8, 0, 0]}
                      activeBar={{ fillOpacity: 1, stroke: '#ef4444', strokeWidth: 2, filter: 'none' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Top 3 hộ gia đình đi họp nhiều nhất */}
                {topHouseholdsLoading ? (
                  <div className="mt-6 flex items-center justify-center py-4">
                    <p className="text-gray-500 text-sm">Đang tải...</p>
                  </div>
                ) : topHouseholdsError ? (
                  <div className="mt-6 flex items-center justify-center py-4">
                    <p className="text-red-500 text-sm">Lỗi: {topHouseholdsError}</p>
                  </div>
                ) : topHouseholds && topHouseholds.length > 0 ? (
                  <div className="mt-8 pt-6 border-t border-teal-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 3 hộ gia đình tham gia nhiều nhất</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {topHouseholds.map((household) => (
                        <div 
                          key={household.householdId} 
                          className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                household.rank === 1 ? 'bg-yellow-500' :
                                household.rank === 2 ? 'bg-gray-400' :
                                'bg-amber-600'
                              }`}>
                                {household.rank}
                              </div>
                              <span className="text-xs font-medium text-slate-600">Hạng {household.rank}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Mã hộ:</p>
                              <p className="text-sm font-semibold text-slate-800">{household.householdCode}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Chủ hộ:</p>
                              <p className="text-sm font-medium text-slate-800">{household.headName}</p>
                            </div>
                            <div className="pt-2 border-t border-amber-200">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600">Số lần tham gia:</span>
                                <span className="font-bold text-amber-600">{household.attendanceCount}</span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-slate-600">Tỷ lệ:</span>
                                <span className="font-bold text-amber-600">{household.attendanceRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex items-center justify-center py-4">
                    <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

