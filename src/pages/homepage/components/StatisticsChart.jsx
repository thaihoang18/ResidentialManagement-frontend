import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#31b9d8', '#f9a8d4', '#64748b', '#0f766e', '#06b6d4', '#fbbf24'];

export default function StatisticsChart() {
  const [statistics, setStatistics] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [topHouseholds, setTopHouseholds] = useState(null);
  const [frequencyStats, setFrequencyStats] = useState(null);
  const [culturalFamilies, setCulturalFamilies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [topHouseholdsLoading, setTopHouseholdsLoading] = useState(true);
  const [frequencyLoading, setFrequencyLoading] = useState(true);
  const [culturalFamiliesLoading, setCulturalFamiliesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceError, setAttendanceError] = useState(null);
  const [topHouseholdsError, setTopHouseholdsError] = useState(null);
  const [frequencyError, setFrequencyError] = useState(null);
  const [culturalFamiliesError, setCulturalFamiliesError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(''); // 'YYYY-MM'
  const [selectedFrequencyMonth, setSelectedFrequencyMonth] = useState(''); // 'YYYY-MM'

  useEffect(() => {
    fetchStatistics();
    fetchAttendanceStatistics();
    fetchTopHouseholds();
    fetchCulturalFamilies();
  }, []);

  // Fetch frequency stats khi selectedFrequencyMonth thay đổi
  useEffect(() => {
    if (selectedFrequencyMonth) {
      fetchFrequencyStats(selectedFrequencyMonth);
    }
  }, [selectedFrequencyMonth]);

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
        const latestMonth = availableMonths[0];
        setSelectedMonth(latestMonth); // Set tháng gần nhất
        setSelectedFrequencyMonth(latestMonth); // Set tháng gần nhất cho frequency chart
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

  const fetchFrequencyStats = async (monthKey) => {
    if (!monthKey) return;
    
    setFrequencyLoading(true);
    setFrequencyError(null);
    try {
      const [year, month] = monthKey.split('-');
      const res = await fetch(`/api/attendance/frequency-by-month?year=${year}&month=${month}`);
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}: Lỗi tải dữ liệu tần suất tham gia`);
      }
      
      if (json.success) {
        setFrequencyStats(json.data);
      } else {
        throw new Error(json.error || 'Lỗi không xác định');
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải dữ liệu tần suất tham gia';
      setFrequencyError(errorMessage);
      console.error('Frequency stats error:', err);
    } finally {
      setFrequencyLoading(false);
    }
  };

  const fetchCulturalFamilies = async () => {
    setCulturalFamiliesLoading(true);
    setCulturalFamiliesError(null);
    try {
      const currentYear = new Date().getFullYear();
      const res = await fetch(`/api/attendance/cultural-families?year=${currentYear}`);
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}: Lỗi tải dữ liệu gia đình văn hóa`);
      }
      
      if (json.success) {
        setCulturalFamilies(json.data);
      } else {
        throw new Error(json.error || 'Lỗi không xác định');
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải dữ liệu gia đình văn hóa';
      setCulturalFamiliesError(errorMessage);
      console.error('Cultural families error:', err);
    } finally {
      setCulturalFamiliesLoading(false);
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
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo độ tuổi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Đang tải...</p>
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
              className="mt-4 px-4 py-2 rounded-md accent-btn action-btn"
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
    { name: 'Nam', value: statistics.byGender.male || 0, color: '#31b9d8' },
    { name: 'Nữ', value: statistics.byGender.female || 0, color: '#f9a8d4' },
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

  // Chuẩn bị dữ liệu cho biểu đồ hình quạt tần suất tham gia
  const frequencyChartData = frequencyStats ? [
    { name: '>= 90%', value: frequencyStats.categories['>=90%'] || 0, color: '#10b981' },
    { name: '70-90%', value: frequencyStats.categories['70-90%'] || 0, color: '#06b6d4' },
    { name: '50-70%', value: frequencyStats.categories['50-70%'] || 0, color: '#fbbf24' },
    { name: '< 50%', value: frequencyStats.categories['<50%'] || 0, color: '#ef4444' }
  ].filter(item => item.value > 0) : [];
  
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
  
  // Chuẩn bị dữ liệu - thêm thời gian vào label để phân biệt các cuộc họp trong cùng ngày
  const attendanceData = filteredData.map((meeting, index) => {
    let label = meeting.date;
    
    // Nếu có thời gian, thêm giờ:phút vào label để phân biệt các cuộc họp trong cùng ngày
    if (meeting.time) {
      const meetingDateTime = new Date(meeting.time);
      const hours = String(meetingDateTime.getHours()).padStart(2, '0');
      const minutes = String(meetingDateTime.getMinutes()).padStart(2, '0');
      label = `${meeting.date} ${hours}:${minutes}`;
    }
    
    return {
      ...meeting,
      label: label, // Label cho trục X (ngày + giờ)
      fullTopic: meeting.topic || `Cuộc họp ${index + 1}` 
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
                  fill="#31b9d8"
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
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-cyan-100 hover:border-cyan-300 hover:bg-cyan-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{backgroundColor: '#31b9d8'}}></div>
                  <span className="text-slate-700 font-medium">Nam</span>
                </div>
                <span className="font-bold text-cyan-600 text-lg">{statistics.byGender.male || 0}</span>
              </div>
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-pink-100 hover:border-pink-300 hover:bg-pink-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{backgroundColor: '#f9a8d4'}}></div>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ hình quạt - Tần suất tham gia họp */}
      <div className="mt-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-slate-800">Tần suất tham gia họp của hộ gia đình</CardTitle>
              <div className="flex items-center gap-2">
                <label htmlFor="frequencyMonthFilter" className="text-sm text-slate-600 font-medium">
                  Chọn tháng:
                </label>
                <select
                  id="frequencyMonthFilter"
                  value={selectedFrequencyMonth}
                  onChange={(e) => setSelectedFrequencyMonth(e.target.value)}
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
            {frequencyStats && (
              <p className="text-sm text-slate-600 mt-2">
                Tổng số hộ: <span className="font-semibold text-teal-600">{frequencyStats.totalHouseholds || 0}</span>
                {' • '}
                Tổng số cuộc họp: <span className="font-semibold text-teal-600">{frequencyStats.totalMeetings || 0}</span>
              </p>
            )}
          </CardHeader>
          <CardContent>
            {frequencyError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">Lỗi: {frequencyError}</p>
                <button
                  onClick={() => selectedFrequencyMonth && fetchFrequencyStats(selectedFrequencyMonth)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Thử lại
                </button>
              </div>
            ) : frequencyLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : !selectedFrequencyMonth ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Vui lòng chọn tháng</p>
              </div>
            ) : frequencyChartData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Không có dữ liệu cho tháng đã chọn</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={frequencyChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={600}
                      >
                        {frequencyChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} hộ`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {frequencyChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 text-lg">{item.value} hộ</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách gia đình văn hóa */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Gia đình văn hóa (Tỷ lệ tham gia ≥ 90% trong năm)</h3>
              {culturalFamiliesError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-red-500 mb-4">Lỗi: {culturalFamiliesError}</p>
                  <button
                    onClick={fetchCulturalFamilies}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Thử lại
                  </button>
                </div>
              ) : culturalFamiliesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : !culturalFamilies || culturalFamilies.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">Chưa có hộ gia đình nào đạt tiêu chí gia đình văn hóa</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Tổng số: <span className="font-semibold text-teal-600">{culturalFamilies.length}</span> hộ gia đình
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {culturalFamilies.map((household, index) => (
                      <div 
                        key={household.householdId} 
                        className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-xs font-medium text-green-700">Gia đình văn hóa</span>
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
                          <div className="pt-2 border-t border-green-200">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">Số lần tham gia:</span>
                              <span className="font-bold text-green-600">{household.attendanceCount}/{household.totalMeetings}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-slate-600">Tỷ lệ:</span>
                              <span className="font-bold text-green-600">{household.attendanceRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

