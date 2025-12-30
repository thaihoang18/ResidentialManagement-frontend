import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

const mixWithWhite = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, white)`;
const mixColors = (a, aPct, b) => `color-mix(in srgb, ${a} ${aPct}%, ${b})`;
const brighten = (color) => mixWithWhite(color, 94);
const deepen = (color) => mixColors(color, 88, 'var(--foreground)');

// General palette (used as fallback only). Each chart below has its own palette.
const COLORS = [
  'var(--primary)',
  'var(--brand-cyan)',
  'var(--chart-1)',
  'var(--chart-3)',
  mixWithWhite('var(--destructive)', 84),
  mixColors('var(--primary)', 55, 'var(--brand-cyan)'),
  mixColors('var(--brand-cyan)', 55, 'var(--chart-1)'),
  mixColors('var(--primary)', 55, 'var(--chart-3)'),
];

const RADIAN = Math.PI / 180;

function renderPiePercentLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent == null) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.62;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="var(--foreground)"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 600, pointerEvents: 'none' }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

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

  // Derived data (must be declared before any early returns to respect Rules of Hooks)
  const genderData = useMemo(() => {
    const byGender = statistics?.byGender ?? {};
    return [
      // Nam/Nữ: xanh + hồng rõ ràng (hồng từ destructive + trắng, nhưng đậm hơn để ra "hồng hẳn")
      { name: 'Nam', value: byGender.male || 0, color: 'var(--brand-cyan)' },
      { name: 'Nữ', value: byGender.female || 0, color: 'var(--gender-female)' },
    ];
  }, [statistics]);

  const ageData = useMemo(() => {
    const byAge = statistics?.byAge ?? {};
    return Object.entries(byAge).map(([name, value]) => ({
      name,
      value: value || 0,
    }));
  }, [statistics]);

  // Độ tuổi: mỗi cột một màu khác nhau (palette mới riêng, không dùng màu vừa input cho chart khác)
  const ageBarColors = useMemo(
    () => [
      'var(--age-1)',
      'var(--age-2)',
      'var(--age-3)',
      'var(--age-4)',
      'var(--age-5)',
      'var(--age-6)',
      'var(--age-7)',
      'var(--age-8)',
    ],
    []
  );

  const frequencyChartData = useMemo(
    () => (frequencyStats
      ? [
          // Tần suất tham gia: dùng bộ màu khác (tránh giống nam/nữ và tránh giống "Tham gia họp")
          { name: '>= 90%', value: frequencyStats.categories['>=90%'] || 0, color: 'var(--freq-90)', opacity: 0.96 },
          { name: '70-90%', value: frequencyStats.categories['70-90%'] || 0, color: 'var(--freq-70-90)', opacity: 0.94 },
          { name: '50-70%', value: frequencyStats.categories['50-70%'] || 0, color: 'var(--freq-50-70)', opacity: 0.94 },
          { name: '< 50%', value: frequencyStats.categories['<50%'] || 0, color: 'var(--freq-lt-50)', opacity: 0.92 },
        ].filter((item) => item.value > 0)
      : []),
    [frequencyStats]
  );

  // Tham gia họp: giữ xanh primary + đỏ nhạt (đẹp rồi) nên không đổi tone
  const attendanceAbsentColor = useMemo(() => mixWithWhite('var(--destructive)', 84), []);

  const getCulturalHighlight = (rankIndex) => {
    // rankIndex: 0 = #1, 1 = #2
    if (rankIndex === 0) {
      // Gold (amber): use theme tokens
      return {
        border: '1px solid rgba(var(--gold-rgb),0.40)',
        background: 'var(--gold-metal)',
        boxShadow: '0 10px 22px rgba(var(--gold-rgb),0.18), inset 0 1px 0 rgba(255,255,255,0.55)',
      };
    }

    if (rankIndex === 1) {
      // Silver: use theme tokens
      return {
        border: '1px solid rgba(var(--silver-rgb),0.75)',
        background: 'var(--silver-metal)',
        boxShadow: '0 10px 22px rgba(var(--silver-rgb),0.28), inset 0 1px 0 rgba(255,255,255,0.70)',
      };
    }

    if (rankIndex === 2) {
      // Bronze: use theme tokens
      return {
        border: '1px solid rgba(var(--bronze-rgb),0.55)',
        background: 'var(--bronze-metal)',
        boxShadow: '0 10px 22px rgba(var(--bronze-rgb),0.20), inset 0 1px 0 rgba(255,255,255,0.55)',
      };
    }

    return null;
  };

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
    <div className="mx-6 flex-1 min-h-0 overflow-hidden">
      <div className="h-full min-h-0 flex flex-col gap-4">
        <div className="shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold accent-text">Phân tích dân số</h2>
            <p className="text-sm text-muted-foreground">
              Tổng cư dân: <span className="font-semibold text-teal-600">{statistics.total || 0}</span>
            </p>
          </div>
        </div>

        <div className="grid flex-1 min-h-0 gap-4 lg:gap-3 grid-cols-1 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Giới tính */}
          <Card className="shadow-lg border-0 rounded-xl flex flex-col min-h-0 lg:col-span-4 lg:row-span-1">
            <CardHeader className="py-3 lg:py-2">
              <CardTitle className="text-base text-slate-800">Giới tính</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-4">
              <div className="h-72 lg:h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {genderData.map((entry, index) => (
                        <linearGradient
                          key={`gender-grad-${index}`}
                          id={`home-gender-grad-${index}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={brighten(entry.color)} />
                          <stop offset="100%" stopColor={deepen(entry.color)} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPiePercentLabel}
                      outerRadius="98%"
                      paddingAngle={2}
                      stroke="var(--background)"
                      strokeWidth={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={450}
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`gender-${index}`}
                          fill={`url(#home-gender-grad-${index})`}
                          fillOpacity={0.95}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value} người`}
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                      }}
                      itemStyle={{ color: 'var(--foreground)' }}
                      labelStyle={{ color: 'var(--muted-foreground)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Độ tuổi */}
          <Card className="shadow-lg border-0 rounded-xl flex flex-col min-h-0 lg:col-span-4 lg:row-span-1">
            <CardHeader className="py-3 lg:py-2">
              <CardTitle className="text-base text-slate-800">Độ tuổi</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-4">
              <div className="h-64 lg:h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 8, right: 10, left: 0, bottom: 28 }}>
                    <defs>
                      {ageBarColors.map((color, index) => (
                        <linearGradient
                          key={`age-grad-${index}`}
                          id={`home-age-grad-${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={brighten(color)} />
                          <stop offset="100%" stopColor={deepen(color)} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" height={28} fontSize={11} tick={{ fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)' }} width={34} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                      }}
                      cursor={{ fill: "rgba(var(--primary-rgb), 0.08)" }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {ageData.map((entry, index) => (
                        <Cell
                          key={`age-${entry.name}-${index}`}
                          fill={`url(#home-age-grad-${index % ageBarColors.length})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tần suất */}
          <Card className="shadow-lg border-0 rounded-xl flex flex-col min-h-0 lg:col-span-4 lg:row-span-1">
            <CardHeader className="py-3 lg:py-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base text-slate-800">Tần suất tham gia</CardTitle>
                <select
                  id="frequencyMonthFilter"
                  value={selectedFrequencyMonth}
                  onChange={(e) => setSelectedFrequencyMonth(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-md text-xs text-slate-700 bg-white hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  disabled={availableMonths.length === 0}
                >
                  {availableMonths.length === 0 ? (
                    <option value="">Đang tải...</option>
                  ) : (
                    availableMonths.map((monthKey) => {
                      const [year, month] = monthKey.split("-");
                      const monthNames = [
                        "Tháng 1",
                        "Tháng 2",
                        "Tháng 3",
                        "Tháng 4",
                        "Tháng 5",
                        "Tháng 6",
                        "Tháng 7",
                        "Tháng 8",
                        "Tháng 9",
                        "Tháng 10",
                        "Tháng 11",
                        "Tháng 12",
                      ];
                      return (
                        <option key={monthKey} value={monthKey}>
                          {monthNames[parseInt(month) - 1]} {year}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
              {frequencyStats && (
                <p className="text-xs text-slate-600">
                  Hộ: <span className="font-semibold text-teal-600">{frequencyStats.totalHouseholds || 0}</span>
                  {" • "}
                  Họp: <span className="font-semibold text-teal-600">{frequencyStats.totalMeetings || 0}</span>
                </p>
              )}
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-4">
              {frequencyError ? (
                <div className="flex items-center justify-center h-64 lg:h-full">
                  <p className="text-red-500">Lỗi: {frequencyError}</p>
                </div>
              ) : frequencyLoading || !selectedFrequencyMonth ? (
                <div className="flex items-center justify-center h-64 lg:h-full">
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : frequencyChartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 lg:h-full">
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              ) : (
                <div className="h-72 lg:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {frequencyChartData.map((entry, index) => (
                          <linearGradient
                            key={`freq-grad-${index}`}
                            id={`home-freq-grad-${index}`}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop offset="0%" stopColor={brighten(entry.color)} />
                            <stop offset="100%" stopColor={deepen(entry.color)} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={frequencyChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPiePercentLabel}
                        outerRadius="98%"
                        paddingAngle={2}
                        stroke="var(--background)"
                        strokeWidth={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={450}
                      >
                        {frequencyChartData.map((entry, index) => (
                          <Cell
                            key={`freq-${index}`}
                            fill={`url(#home-freq-grad-${index})`}
                            fillOpacity={entry.opacity ?? 0.92}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `${value} hộ`}
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        labelStyle={{ color: 'var(--muted-foreground)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tham gia họp */}
          <Card className="shadow-lg border-0 rounded-xl flex flex-col min-h-0 lg:col-span-8 lg:row-span-1">
            <CardHeader className="py-3 lg:py-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base text-slate-800">Tham gia họp</CardTitle>
                  {attendanceStats && (
                    <p className="text-xs text-slate-600">
                      Tổng số hộ: <span className="font-semibold text-teal-600">{attendanceStats.totalHouseholds || 0}</span>
                    </p>
                  )}
                </div>
                <select
                  id="monthFilter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-md text-xs text-slate-700 bg-white hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  disabled={availableMonths.length === 0}
                >
                  {availableMonths.length === 0 ? (
                    <option value="">Đang tải...</option>
                  ) : (
                    availableMonths.map((monthKey) => {
                      const [year, month] = monthKey.split("-");
                      const monthNames = [
                        "Tháng 1",
                        "Tháng 2",
                        "Tháng 3",
                        "Tháng 4",
                        "Tháng 5",
                        "Tháng 6",
                        "Tháng 7",
                        "Tháng 8",
                        "Tháng 9",
                        "Tháng 10",
                        "Tháng 11",
                        "Tháng 12",
                      ];
                      return (
                        <option key={monthKey} value={monthKey}>
                          {monthNames[parseInt(month) - 1]} {year}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-4">
              {attendanceError ? (
                <div className="flex items-center justify-center h-80 lg:h-full">
                  <p className="text-red-500">Lỗi: {attendanceError}</p>
                </div>
              ) : !selectedMonth ? (
                <div className="flex items-center justify-center h-80 lg:h-full">
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : attendanceData.length === 0 ? (
                <div className="flex items-center justify-center h-80 lg:h-full">
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              ) : (
                <div className="h-72 lg:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData} margin={{ top: 8, right: 16, left: 6, bottom: 34 }} maxBarSize={70}>
                      <defs>
                        <linearGradient id="home-attended-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={brighten('var(--primary)')} />
                          <stop offset="100%" stopColor={deepen('var(--brand-cyan)')} />
                        </linearGradient>
                        <linearGradient id="home-absent-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={brighten(attendanceAbsentColor)} />
                          <stop offset="100%" stopColor={deepen(attendanceAbsentColor)} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" height={34} fontSize={10} tick={{ fill: 'var(--muted-foreground)' }} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: 'var(--muted-foreground)' }} width={34} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          whiteSpace: "pre-wrap",
                        }}
                        formatter={(value, name) => {
                          if (name === "attendanceRate") {
                            return [`${value}%`, "Tỷ lệ tham gia"];
                          }
                          return [value, name === "attended" ? "Tham gia" : "Vắng mặt"];
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
                        wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
                        formatter={(value) => {
                          if (value === "attendanceRate") return "Tỷ lệ tham gia (%)";
                          if (value === "attended") return "Tham gia";
                          if (value === "absent") return "Vắng mặt";
                          return value;
                        }}
                      />
                      <Bar dataKey="attended" stackId="households" fill="url(#home-attended-grad)" fillOpacity={0.96} name="attended" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="absent" stackId="households" fill="url(#home-absent-grad)" fillOpacity={0.96} name="absent" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gia đình văn hóa */}
          <Card className="shadow-lg border-0 rounded-xl flex flex-col min-h-0 lg:col-span-4 lg:row-span-1">
            <CardHeader className="py-3 lg:py-2">
              <CardTitle className="text-base text-slate-800">Gia đình văn hóa</CardTitle>
              <p className="text-xs text-slate-600">Tỷ lệ tham gia ≥ 90% trong năm</p>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-4">
              {culturalFamiliesError ? (
                <div className="flex items-center justify-center h-80 lg:h-full">
                  <p className="text-red-500">Lỗi: {culturalFamiliesError}</p>
                </div>
              ) : culturalFamiliesLoading ? (
                <div className="flex items-center justify-center h-80 lg:h-full">
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : !culturalFamilies || culturalFamilies.length === 0 ? (
                <div className="flex items-center justify-center h-80 lg:h-full">
                  <p className="text-gray-500">Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="h-full flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-600">
                      Tổng số: <span className="font-semibold text-teal-600">{culturalFamilies.length}</span> hộ
                    </p>
                    <p className="text-[11px] text-slate-500">Hiển thị 5 hộ</p>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 flex-1 min-h-0">
                    {[...culturalFamilies]
                      .sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0))
                      .slice(0, 5)
                      .map((household, index) => {
                        const highlight = getCulturalHighlight(index);
                        const isTop = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;
                        const baseClass = "relative p-2 rounded-lg border transition-all";
                        const normalClass = "bg-white/80 border-slate-200 table-row-hover hover:bg-transparent hover:border-slate-300";
                        const highlightClass = "border-transparent";
                        return (
                        <div
                          key={household.householdId}
                            className={`${baseClass} ${isTop || isSecond || isThird ? highlightClass : normalClass}`}
                          style={highlight || undefined}
                        >
                            {isTop ? (
                              <div
                                className="absolute -top-2 -right-2 rounded-full p-1.5"
                                style={{
                                  background: 'var(--gold-gradient)',
                                  boxShadow: '0 10px 18px rgba(var(--gold-rgb),0.22)',
                                }}
                                aria-label="Hạng 1"
                                title="Hạng 1"
                              >
                                <Crown className="h-4 w-4" style={{ color: 'var(--primary-foreground)' }} />
                              </div>
                            ) : null}
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-600 truncate">
                                <span className="font-semibold text-slate-800">{household.householdCode}</span>
                                {household.headName ? (
                                  <span className="text-slate-500"> • {household.headName}</span>
                                ) : null}
                              </p>
                              <p className="text-[11px] text-slate-600">
                                Tham gia: <span className="font-semibold text-slate-800">{household.attendanceCount}/{household.totalMeetings}</span>
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-bold text-slate-900 text-sm leading-4">{household.attendanceRate.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

