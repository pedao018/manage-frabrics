'use client';

import { useState, useEffect } from 'react';

interface FabricItem {
  id: string;
  name: string;
  color: string;
  length: number; // số mét còn lại
  pricePerMeter: number;
  qrCode: string;
  note: string;
  updatedAt: string;
}

export default function FabricsMasterDataDemoPage({ title }: { title: string }) {
  const [fabrics, setFabrics] = useState<FabricItem[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [length, setLength] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Đọc dữ liệu từ Cache khi mở trang
  useEffect(() => {
    const saved = localStorage.getItem('fabric_inventory');
    if (saved) {
      try {
        setFabrics(JSON.parse(saved));
      } catch (e) {
        console.error('Lỗi đọc dữ liệu', e);
      }
    } else {
      // Dữ liệu mẫu ban đầu để test giao diện
      const sampleData: FabricItem[] = [
        { id: 'FAB-001', name: 'Vải Cotton Lụa', color: 'Đỏ đô', length: 45, pricePerMeter: 65000, qrCode: 'QR-COTTON-01', note: 'Hàng nhập xưởng Hàn Quốc', updatedAt: new Date().toLocaleString() },
        { id: 'FAB-002', name: 'Vải Voan Hoa Nhí', color: 'Xanh mint', length: 18, pricePerMeter: 45000, qrCode: 'QR-VOAN-02', note: 'Khách cọc trước 5 mét', updatedAt: new Date().toLocaleString() }
      ];
      setFabrics(sampleData);
      localStorage.setItem('fabric_inventory', JSON.stringify(sampleData));
    }
  }, []);

  // Lưu danh sách vào LocalStorage
  const saveToLocalStorage = (data: FabricItem[]) => {
    setFabrics(data);
    localStorage.setItem('fabric_inventory', JSON.stringify(data));
  };

  // Thêm cây vải mới
  const handleAddFabric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || length <= 0) {
      alert('Vui lòng nhập tên vải và số mét hợp lệ!');
      return;
    }

    const newFabric: FabricItem = {
      id: 'FAB-' + Math.floor(100 + Math.random() * 900),
      name,
      color: color || 'Chưa phân loại',
      length: Number(length),
      pricePerMeter: Number(price) || 0,
      qrCode: 'QR-' + Date.now().toString().slice(-6),
      note: note || 'Không có ghi chú',
      updatedAt: new Date().toLocaleString()
    };

    const updated = [newFabric, ...fabrics];
    saveToLocalStorage(updated);

    // Reset form
    setName('');
    setColor('');
    setLength(0);
    setPrice(0);
    setNote('');
  };

  // Xóa cây vải
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa cây vải này khỏi kho?')) {
      const updated = fabrics.filter(f => f.id !== id);
      saveToLocalStorage(updated);
    }
  };

  // Lọc tìm kiếm theo tên hoặc mã
  const filteredFabrics = fabrics.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 max-w-4xl mx-auto font-sans">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">🧵 Phần Mềm Quản Lý Kho Vải (MVP)</h1>
        <p className="text-sm text-gray-500">Giải pháp tối ưu cho cửa hàng và xưởng may nhỏ tại Sài Gòn</p>
      </header>

      {/* Form Nhập Kho Vải Mới */}
      <section className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-3 text-blue-600">+ Nhập Cây Vải / Cuộn Vải Mới</h2>
        <form onSubmit={handleAddFabric} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Tên loại vải (VD: Cotton, Lụa, Kaki...)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded-lg text-sm"
            required
          />
          <input
            type="text"
            placeholder="Màu sắc / Họa tiết"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="border p-2 rounded-lg text-sm"
          />
          <input
            type="number"
            placeholder="Số mét trong cuộn (VD: 50)"
            value={length || ''}
            onChange={e => setLength(Number(e.target.value))}
            className="border p-2 rounded-lg text-sm"
            required
          />
          <input
            type="number"
            placeholder="Giá bán / 1 mét (VNĐ)"
            value={price || ''}
            onChange={e => setPrice(Number(e.target.value))}
            className="border p-2 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Ghi chú (VD: Lỗi đầu cuộn 2m, hàng đặt...)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="border p-2 rounded-lg text-sm sm:col-span-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-medium p-2 rounded-lg hover:bg-blue-700 sm:col-span-2 transition"
          >
            Lưu Vào Kho Vải
          </button>
        </form>
      </section>

      {/* Khu vực Tìm kiếm & Danh sách */}
      <section className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-800">📦 Kho Vải Hiện Tại ({fabrics.length} cuộn)</h2>
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, màu, mã..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border p-2 rounded-lg text-sm w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border">Mã / QR</th>
                <th className="p-2 border">Tên & Màu</th>
                <th className="p-2 border">Còn lại (Mét)</th>
                <th className="p-2 border">Giá/Mét</th>
                <th className="p-2 border">Ghi chú</th>
                <th className="p-2 border text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredFabrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-400 italic">Không tìm thấy cây vải nào.</td>
                </tr>
              ) : (
                filteredFabrics.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border font-mono text-xs text-blue-600 font-bold">{item.id}</td>
                    <td className="p-2 border">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500">Màu: {item.color}</div>
                    </td>
                    <td className="p-2 border font-bold text-green-600">{item.length} m</td>
                    <td className="p-2 border">{item.pricePerMeter.toLocaleString()} đ</td>
                    <td className="p-2 border text-xs text-gray-600">{item.note}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-100"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Xem dữ liệu JSON thô đúng yêu cầu hệ thống */}
      <section className="bg-gray-900 text-green-400 p-4 rounded-xl shadow-sm">
        <h2 className="text-sm font-semibold mb-2 text-white">💻 Dữ liệu JSON Thô trong Cache:</h2>
        <pre className="text-xs overflow-y-auto max-h-40">{JSON.stringify(fabrics, null, 2)}</pre>
      </section>
    </main>
  );
}