<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Santri</title>
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
        .text-center { text-align: center; }
        .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #64748b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $namaSistem }}</h1>
        @if($alamat)<p>{{ $alamat }}</p>@endif
        @if($telepon || $email)<p>{{ $telepon }}@if($telepon && $email) | @endif{{ $email }}</p>@endif
        <div class="sub">LAPORAN DATA SANTRI</div>
    </div>

    <div class="info">
        <span>Tanggal Cetak: <strong>{{ date('d/m/Y H:i') }}</strong></span>
        <span>Total Santri: <strong>{{ count($santri) }}</strong></span>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:30px" class="text-center">No</th>
                <th style="width:70px">NIS</th>
                <th>Nama</th>
                <th>Email</th>
                <th style="width:80px">Jenis Kelamin</th>
                <th style="width:80px">Kategori</th>
                <th>Kelas</th>
                <th style="width:90px">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($santri as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item['nis'] }}</td>
                <td>{{ $item['nama'] }}</td>
                <td>{{ $item['email'] }}</td>
                <td>{{ $item['jenis_kelamin'] }}</td>
                <td>{{ $item['kategori'] }}</td>
                <td>{{ $item['kelas'] }}</td>
                <td>{{ $item['status'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data santri.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh sistem {{ $namaSistem }} pada {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>