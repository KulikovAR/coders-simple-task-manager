<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        $csvPath = base_path('geo.csv');
        
        if (!File::exists($csvPath)) {
            return;
        }
        
        $handle = fopen($csvPath, 'r');
        
        if ($handle === false) {
            return;
        }
        
        $header = fgetcsv($handle);
        
        if ($header === false) {
            fclose($handle);
            return;
        }
        
        $header = array_map('trim', $header);
        
        $data = [];
        $batchSize = 1000;
        $batch = [];
        
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) !== count($header)) {
                continue;
            }
            
            $rowData = array_combine($header, $row);
            
            $batch[] = [
                'criteria_id' => (int)$rowData['Criteria ID'],
                'name' => $rowData['Name'],
                'canonical_name' => $rowData['Canonical Name'],
                'parent_id' => !empty($rowData['Parent ID']) ? (int)$rowData['Parent ID'] : null,
                'country_code' => $rowData['Country Code'],
                'target_type' => $rowData['Target Type'],
                'status' => $rowData['Status'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            if (count($batch) >= $batchSize) {
                DB::table('geo')->insert($batch);
                $batch = [];
            }
        }
        
        if (count($batch) > 0) {
            DB::table('geo')->insert($batch);
        }
        
        fclose($handle);
    }

    public function down(): void
    {
        DB::table('geo')->truncate();
    }
};

