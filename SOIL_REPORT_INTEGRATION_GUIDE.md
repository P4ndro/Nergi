# Soil Report Integration - Changes Guide

## What Was Fixed

### Problem
- Dashboard had **mock/hardcoded soil data** that showed regardless of whether user uploaded a report
- Soil report data from AddCrop wasn't being saved to user profile
- No connection between uploaded reports and Dashboard display

### Solution
✅ Removed all mock soil data from Dashboard
✅ Created database fields to store soil report data in user profiles
✅ Connected AddCrop soil report upload to user profile storage
✅ Made Dashboard display **real data from uploaded reports only**

---

## Database Changes

### New Migration File
`supabase/migrations/20251025200000_add_soil_report_to_profiles.sql`

**New columns added to `profiles` table:**
- `soil_report_data` (JSONB) - Stores pH, N, P, K, OM%, EC, notes
- `soil_report_date` (TIMESTAMP) - When the report was uploaded
- `soil_report_location` (TEXT) - Field/location name for the report

### How to Apply Migration

```bash
# If using Supabase CLI locally
supabase db reset

# OR if using hosted Supabase
# Go to Supabase Dashboard > SQL Editor
# Copy and paste the migration SQL and run it
```

---

## Code Changes

### 1. AddCrop.tsx (Lines 309-325)
**Added:** Saves soil report data to user profile when crop is saved

```typescript
// Save soil report data to user profile if it was uploaded
if (recommendation.soilReportSummary) {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      soil_report_data: recommendation.soilReportSummary,
      soil_report_date: new Date().toISOString(),
      soil_report_location: fieldName || null
    })
    .eq('id', user.id);
}
```

### 2. Dashboard.tsx
**Changed:** 
- ❌ Removed hardcoded `soilData` state
- ✅ Added `soil_report_data` to Profile interface
- ✅ Conditionally renders soil status ONLY if user has uploaded a report
- ✅ Shows placeholder card with "Add Crop" button if no report exists

**New Display Logic:**
- Shows actual pH, N, P, K, Organic Matter from uploaded report
- Displays report date and location
- Shows analysis notes if available
- Provides clear call-to-action to upload first report

### 3. types.ts
**Added:** New fields to `profiles` table type definitions
- `soil_report_data: Json | null`
- `soil_report_date: string | null`
- `soil_report_location: string | null`

---

## User Flow

### Before
1. User sees mock soil data immediately ❌
2. Data never updates even after uploading reports ❌
3. No connection between reports and dashboard ❌

### After
1. User sees "No Soil Report Yet" placeholder ✅
2. User clicks "Add Crop with Soil Report" ✅
3. User uploads soil report (PDF/image/text) ✅
4. AI extracts soil data (pH, N, P, K, etc.) ✅
5. **User clicks "Save Crop"** ✅
6. Soil data saves to user profile ✅
7. Dashboard automatically shows real soil data ✅
8. Data updates each time new report is uploaded ✅

---

## Testing Instructions

1. **Start with clean profile:**
   - New user or clear existing soil_report_data

2. **Visit Dashboard:**
   - Should see "No Soil Report Yet" card with dashed border
   - Should NOT see any soil values

3. **Add a Crop:**
   - Go to Add Crop page
   - Select a crop (e.g., "Blueberries")
   - Upload the sample soil report (see attached file in chat)
   - Click "Get Recommendation"
   - Wait for AI analysis
   - **Click "Save Crop"** button

4. **Return to Dashboard:**
   - Should now see "Soil Status" card with real data
   - pH: 5.6
   - Nitrogen: 18 ppm
   - Phosphorus: 12 ppm
   - Potassium: 155 ppm
   - Organic Matter: 3.2%
   - Report date and location displayed

---

## Example Soil Report Data Structure

When saved to `soil_report_data` JSONB column:

```json
{
  "pH": 5.6,
  "EC": 0.45,
  "OM_percent": 3.2,
  "N_ppm": 18,
  "P_ppm": 12,
  "K_ppm": 155,
  "CEC": 12.5,
  "Fe_ppm": 18,
  "Zn_ppm": 1.2,
  "Mn_ppm": 22,
  "Cu_ppm": 0.6,
  "B_ppm": 0.35,
  "notes": "P2O5 converted to P ppm; Sample condition: fine loam with good structure"
}
```

---

## Troubleshooting

### TypeScript Error about soil_report_data
If you see: `'soil_report_data' does not exist in type`

**Fix:** Restart TypeScript server in your IDE
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Cursor: Same command palette

### Migration Not Applied
```bash
# Check current schema
supabase db diff

# Force reset (WARNING: deletes data)
supabase db reset
```

### No Data Showing in Dashboard
1. Check browser console for errors
2. Verify migration was applied: `SELECT column_name FROM information_schema.columns WHERE table_name='profiles';`
3. Check if soil_report_data is null: `SELECT soil_report_data FROM profiles WHERE id='your-user-id';`

---

## Notes

- The **"Save Crop" button already exists** in AddCrop.tsx (line 567-575)
- It appears after recommendations are generated
- Soil data is now automatically saved when this button is clicked
- Dashboard updates in real-time on next page load
- Most recent soil report overwrites previous data (by design)

---

## Future Enhancements

Consider adding:
- History of all soil reports (new `soil_reports` table)
- Compare reports over time
- Multi-field support (different soil data per field)
- Soil data expiration warnings (e.g., "Report is 6 months old")
- Export soil report data as CSV

