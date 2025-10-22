<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\SeoSite;
use App\Services\Seo\Services\ReportsService;
use App\Services\Seo\Services\SeoHtmlReportService;
use App\Services\Seo\Services\ExcelReportService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    public function __construct(
        private ReportsService $reportsService,
        private SeoHtmlReportService $htmlReportService,
        private ExcelReportService $excelReportService
    ) {}

    public function index(Request $request)
    {
        $query = Report::where('user_id', Auth::id())
            ->with('site')
            ->orderBy('created_at', 'desc');

        if ($request->filled('site_id')) {
            $query->where('site_id', $request->site_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $reports = $query->paginate(20);
        $sites = SeoSite::whereHas('users', function($q) {
            $q->where('user_id', Auth::id());
        })->get();

        return inertia('Reports/Index', [
            'reports' => $reports,
            'filters' => $request->only(['site_id', 'date_from', 'date_to']),
            'sites' => $sites
        ]);
    }

    public function export(Request $request)
    {
        $request->validate([
            'site_id' => 'required|integer',
            'type' => 'required|in:excel,html',
            'filters' => 'array'
        ]);


        $siteId = $request->site_id;
        $type = $request->type;
        $filters = $request->filters ?? [];

        try {
            $reportData = $this->reportsService->getReportsData($siteId, $filters);

            if (!$reportData) {
                return response()->json(['error' => 'No access to site'], 403);
            }

            $report = Report::create([
                'user_id' => Auth::id(),
                'site_id' => $siteId,
                'name' => $this->generateReportName($reportData['project']['name'], $filters),
                'type' => $type,
                'filters' => $filters,
                'status' => 'processing'
            ]);

            if ($type === 'excel') {
                $filePath = $this->excelReportService->exportToExcel($reportData, $report->id);
                $fullPath = storage_path('app/' . $filePath);

                if (!file_exists($fullPath)) {
                    throw new \Exception("Excel file was not created");
                }

                $fileSize = filesize($fullPath);
                if ($fileSize === 0) {
                    throw new \Exception("Excel file is empty");
                }

                $report->update([
                    'file_path' => $filePath,
                    'status' => 'completed'
                ]);

                $downloadUrl = route('reports.download', $report->id);
                return response()->json(['url' => $downloadUrl])
                    ->header('Content-Type', 'application/json');
            }

            if ($type === 'html') {
                $publicUrl = $this->htmlReportService->exportToHtml($reportData, $report->id);
                $report->update([
                    'public_url' => $publicUrl,
                    'status' => 'completed'
                ]);

                return response()->json(['url' => $publicUrl])
                    ->header('Content-Type', 'application/json');
            }
        } catch (\Exception $e) {
            Log::error("Error creating report export: " . $e->getMessage(), [
                'site_id' => $siteId,
                'type' => $type,
                'filters' => $filters,
                'trace' => $e->getTraceAsString()
            ]);

            if (isset($report)) {
                $report->update(['status' => 'failed']);
            }

            return response()->json(['error' => 'Failed to create report'], 500);
        }
    }

    public function download(Report $report)
    {
        if ($report->user_id !== Auth::id()) {
            abort(403);
        }

        if ($report->type !== 'excel' || !$report->file_path) {
            abort(404);
        }

        $fullPath = storage_path('app/' . $report->file_path);

        if (!file_exists($fullPath)) {
            abort(404);
        }

        $fileSize = filesize($fullPath);
        if ($fileSize === 0) {
            abort(404);
        }

        return response()->download($fullPath, basename($report->file_path));
    }

    public function show(Report $report)
    {
        if ($report->user_id !== Auth::id()) {
            abort(403);
        }

        if ($report->type !== 'html' || !$report->public_url) {
            abort(404);
        }

        return redirect($report->public_url);
    }

    private function generateReportName(string $siteName, array $filters): string
    {
        $dateFrom = $filters['date_from'] ?? now()->subMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? now()->format('Y-m-d');

        return "{$siteName} отчет {$dateFrom} - {$dateTo}";
    }
}
