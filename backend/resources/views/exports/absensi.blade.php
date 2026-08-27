<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Absensi</title>
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
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; }
        .badge-hadir { background: #dcfce7; color: #166534; }
        .badge-izin { background: #fef3c7; color: #92400e; }
        .badge-sakit { background: #fef9c3; color: #854d0e; }
        .badge-alpha { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $namaSistem }}</h1>
        @if($alamat)<p>{{ $alamat }}</p>@endif
        @if($telepon || $email)<p>{{ $telepon }}@if($telepon && $email) | @endif{{ $email }}</p>@endif
        <div class="sub">LAPORAN ABSENSI</div>
    </div>

    <div class="info">
        <span>Tanggal Cetak: <strong>{{ date('d/m/Y H:i') }}</strong></span>
        <span>Total Data: <strong>{{ count($absensi) }}</strong></span>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:30px" class="text-center">No</th>
                <th style="width:90px">Tanggal</th>
                <th>Nama Santri</th>
                <th style="width:70px">NIS</th>
                <th>Kelas</th>
                <th style="width:80px">Status</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($absensi as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($item->tanggal)->format('d/m/Y') }}</td>
                <td>{{ $item->santri?->user?->name ?? '-' }}</td>
                <td>{{ $item->santri?->nis ?? '-' }}</td>
                <td>{{ $item->kelas?->nama_kelas ?? '-' }}</td>
                <td>
                    @php
                        $badgeClass = match(strtolower($item->status)) {
                            'hadir' => 'badge-hadir',
                            'izin' => 'badge-izin',
                            'sakit' => 'badge-sakit',
                            'alpha' => 'badge-alpha',
                            default => 'badge-alpha',
                        };
                    @endphp
                    <span class="badge {{ $badgeClass }}">{{ ucfirst($item->status) }}</span>
                </td>
                <td>{{ $item->keterangan ?? '' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="text-center" style="padding: 20px; color: #94a3b8;">Tidak ada data absensi.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh sistem {{ $namaSistem }} pada {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>