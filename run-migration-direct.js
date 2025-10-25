// Script to run the migration directly
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the migration file
const migrationSQL = readFileSync(join(__dirname, 'supabase/migrations/20250128000001_create_soil_reports.sql'), 'utf-8');

console.log('📄 Migration SQL loaded');
console.log('\n⚠️  To run this migration:');
console.log('\n1. Go to: https://supabase.com/dashboard/project/osbyqrzbfcojbqjmwhej/sql/new');
console.log('2. Paste this SQL:');
console.log('\n' + migrationSQL);
console.log('\n3. Click "Run"');
console.log('\n(This is the safest way without exposing credentials)');

