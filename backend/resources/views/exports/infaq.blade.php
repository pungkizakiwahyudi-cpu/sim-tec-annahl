<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Infaq</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1e293b; }
        .header { text-align: center; border-bottom: 3px solid #0B4832; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 18px; color: #0B4832; margin-bottom: 4px; }
        .header p { font-size: 10px; color: #64748b; }
        .header .sub { font-size: 11px; color: #334155; margin-top: 4px; font-weight: bold; }
        .info { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 10px; }
        .info span { color: #475569; }
        .info strong { color: #0B4832; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th { background: #0B4832; color: white; padding: 8px 6px; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row td { font-weight: bold; background: #f0fdf4; border-top: 2px solid #0B4832; }
        .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #64748b; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; }
        .badge-lunas { background: #dcfce7; color: #166534; }
        .badge-belum { background: #fee2e2; color: #991b1b; }
        .badge-proses { background: #fef3c7; color: #92400e; }
        .badge-pending { background: #e2e8f0; color: #334155; }
        .badge-ditolak { background: #fecaca; color: #7f1d1d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $namaSistem }}</h1>
        @if($alamat)<p>{{ $alamat }}</p>@endif
        @if($telepon || $email)<p>{{ $telepon }}@if($telepon && $email) | @endif{{ $email }}</p>@endif
        <div class="sub">LAPORAN INFAQ</div>
    </div>

    <div class="info">
        <span>Periode: <strong>{{ $filterBulan }} {{ $filterTahun }}</strong></span>
        <span>Status: <strong>{{ $filterStatus }}</strong></span>
        <span>Tanggal Cetak: <strong>{{ date('d/m/Y H:i') }}</strong></span>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:30px" class="text-center">No</th>
                <th>Nama Santri</th>
                <th style="width:70px">NIS</th>
                <th style="width:80px">Kategori</th>
                <th style="width:80px">Bulan</th>
                <th style="width:50px">Tahun</th>
                <th style="width:90px" class="text-right">Jumlah</th>
                <th style="width:100px">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($infaq as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item['nama_santri'] }}</td>
                <td>{{ $item['nis'] }}</td>
                <td>{{ $item['kategori'] }}</td>
                <td>{{ $item['bulan'] }}</td>
                <td>{{ $item['tahun'] }}</td>
                <td class="text-right">{{ number_format($item['jumlah'], 0, ',', '.') }}</td>
                <td>
                    @php
                        $badgeClass = match($item['status']) {
                            'Lunas' => 'badge-lunas',
                            'Belum Lunas' => 'badge-belum',
                            'Proses Verifikasi' => 'badge-proses',
                            'Pending' => 'badge-pending',
                            'Ditolak' => 'badge-ditolak',
                            default => 'badge-pending',
                        };
                    @endphp
                    <span class="badge {{ $badgeClass }}">{{ $item['status'] }}</span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data infaq.</td>
            </tr>
            @endforelse
            @if(count($infaq) > 0)
            <tr class="total-row">
                <td colspan="6" class="text-right">Total Lunas:</td>
                <td class="text-right">{{ number_format($totalLunas, 0, ',', '.') }}</td>
                <td></td>
            </tr>
            <tr class="total-row">
                <td colspan="6" class="text-right">Total Keseluruhan:</td>
                <td class="text-right">{{ number_format($totalSemua, 0, ',', '.') }}</td>
                <td></td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh sistem {{ $namaSistem }} pada {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>