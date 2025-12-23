# Design Document

## Overview

This design addresses the company logo upload bug by fixing the incorrect URL path construction in the backend handler and enhancing the logo display on both the Edit Company page and Companies list page. The root cause is a path duplication issue where the logo URL is constructed as `/logos/logos/...` instead of `/logos/...`, resulting in 404 errors when attempting to load images.

## Architecture

### Current System Flow

1. User uploads logo file via Edit Company form
2. Backend receives multipart form data with logo file
3. Backend stores file in R2 bucket with key: `logos/{timestamp}-{filename}`
4. Backend constructs logo_url (currently incorrect: `/logos/${key}`)
5. Backend saves company data with logo_url to D1 database
6. Frontend attempts to load logo using logo_url (fails due to incorrect path)

### Fixed System Flow

1. User uploads logo file via Edit Company form
2. Backend receives multipart form data with logo file
3. Backend stores file in R2 bucket with key: `logos/{timestamp}-{filename}`
4. Backend constructs logo_url (fixed: `/${key}`)
5. Backend saves company data with logo_url to D1 database
6. Frontend successfully loads logo using correct logo_url

## Components and Interfaces

### Backend Handler (`src/index.tsx`)

**Location**: POST handler for `/companies` route (approximately line 1520-1560)

**Current Implementation**:
```typescript
let logo_url = '';
if (logoFile && logoFile.size > 0) {
    const key = `logos/${Date.now()}-${logoFile.name}`;
    console.log('Uploading logo to key:', key);
    await env.BUCKET.put(key, logoFile);
    logo_url = `/logos/${key}`;  // ❌ BUG: Creates /logos/logos/...
    console.log('Logo uploaded, URL:', logo_url);
}
```

**Fixed Implementation**:
```typescript
let logo_url = '';
if (logoFile && logoFile.size > 0) {
    const key = `logos/${Date.now()}-${logoFile.name}`;
    console.log('Uploading logo to key:', key);
    await env.BUCKET.put(key, logoFile);
    logo_url = `/${key}`;  // ✅ FIXED: Creates /logos/...
    console.log('Logo uploaded, URL:', logo_url);
}
```

**Update Logic**:
The update logic also needs to be fixed to handle logo uploads correctly:

```typescript
if (id) {
    // Update
    const updateFields = [];
    const values = [];
    if (logo_url) {
        updateFields.push('logo_url = ?');
        values.push(logo_url);
    }
    updateFields.push('name = ?, email = ?, phone = ?, address = ?');
    values.push(name, email, phone, address, id);
    await env.DB.prepare(`UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`).bind(...values).run();
}
```

This logic should be simplified to always update all fields:

```typescript
if (id) {
    // Update - if no new logo uploaded, keep existing logo_url
    if (!logo_url) {
        const existing = await env.DB.prepare('SELECT logo_url FROM companies WHERE id = ?').bind(id).first();
        logo_url = existing?.logo_url || '';
    }
    await env.DB.prepare('UPDATE companies SET name = ?, email = ?, phone = ?, address = ?, logo_url = ? WHERE id = ?')
        .bind(name, email, phone, address, logo_url, id).run();
}
```

### Edit Company Page (`src/pages/EditCompany.tsx`)

**Current Logo Display**:
```tsx
{company.logo_url && <img src={company.logo_url} alt="Current Logo" className="w-16 h-16 mt-2" />}
```

**Enhanced Logo Display**:
```tsx
{company.logo_url && (
    <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Logo:</p>
        <img 
            src={company.logo_url} 
            alt="Company Logo" 
            className="w-32 h-32 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-700" 
        />
    </div>
)}
```

**Styling Changes**:
- Increase size from `w-16 h-16` (64px) to `w-32 h-32` (128px)
- Add `object-contain` to maintain aspect ratio
- Add `rounded-lg` for rounded corners
- Add `border-2` with theme-aware colors
- Add `p-2` for internal padding
- Add background color for better visibility

### Companies List Page (`src/pages/Companies.tsx`)

**Current Logo Display**:
```tsx
<TableCell>{company.logo_url ? <img src={company.logo_url} alt="Logo" className="w-8 h-8" /> : '-'}</TableCell>
```

**Enhanced Logo Display**:
```tsx
<TableCell>
    {company.logo_url ? (
        <img 
            src={company.logo_url} 
            alt={`${company.name} logo`} 
            className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-600" 
        />
    ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
            <Building className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
    )}
</TableCell>
```

**Styling Changes**:
- Increase size from `w-8 h-8` (32px) to `w-16 h-16` (64px)
- Add `object-cover` for better table display
- Add `rounded-md` for rounded corners
- Add border with theme-aware colors
- Add placeholder with Building icon when no logo exists
- Improve alt text for accessibility

**Required Import**:
```tsx
import Building from 'lucide-react/dist/esm/icons/building';
```

## Data Models

### Company Model (D1 Database)

**Table**: `companies`

**Relevant Fields**:
- `id`: INTEGER PRIMARY KEY
- `name`: TEXT NOT NULL
- `email`: TEXT NOT NULL
- `phone`: TEXT
- `address`: TEXT
- `logo_url`: TEXT (stores the path to retrieve logo from R2)

**Logo URL Format**: `/{key}` where key is `logos/{timestamp}-{filename}`

**Example**: `/logos/1699564800000-company-logo.png`

### R2 Bucket Storage

**Bucket Name**: `accounting-bucket` (from wrangler.jsonc)

**Storage Key Format**: `logos/{timestamp}-{filename}`

**Example**: `logos/1699564800000-company-logo.png`

**Retrieval Path**: `/logos/{key}` (handled by GET route in index.tsx)

## Error Handling

### File Upload Errors

**Scenario**: Logo file upload fails to R2 bucket

**Handling**:
- Wrap R2 put operation in try-catch
- Log error details for debugging
- Return 500 error with descriptive message
- Do not save company record if logo upload fails

```typescript
try {
    if (logoFile && logoFile.size > 0) {
        const key = `logos/${Date.now()}-${logoFile.name}`;
        await env.BUCKET.put(key, logoFile);
        logo_url = `/${key}`;
    }
} catch (error) {
    console.error('Logo upload failed:', error);
    return new Response('Error uploading logo: ' + error.message, { status: 500 });
}
```

### Image Load Errors

**Scenario**: Logo image fails to load in frontend (404, network error, etc.)

**Handling**:
- Add `onError` handler to img elements
- Display fallback placeholder on error
- Log error for debugging

```tsx
<img 
    src={company.logo_url} 
    alt="Company Logo" 
    className="w-32 h-32 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
    onError={(e) => {
        console.error('Failed to load logo:', company.logo_url);
        e.currentTarget.style.display = 'none';
    }}
/>
```

### Database Errors

**Scenario**: Database update/insert fails

**Handling**:
- Already wrapped in try-catch in existing code
- Return 500 error with message
- Consider cleanup of uploaded logo if DB operation fails (future enhancement)

## Testing Strategy

### Manual Testing

**Test Case 1: New Company with Logo**
1. Navigate to `/companies/new`
2. Fill in company details
3. Upload a logo file (PNG, JPG, or SVG)
4. Submit form
5. Verify redirect to `/companies`
6. Verify logo displays in companies list
7. Click Edit on the new company
8. Verify logo displays on edit page

**Test Case 2: Update Existing Company with New Logo**
1. Navigate to `/companies/{id}/edit` for existing company
2. Upload a new logo file
3. Submit form
4. Verify logo updates in companies list
5. Verify logo displays correctly on edit page

**Test Case 3: Update Company Without Changing Logo**
1. Navigate to `/companies/{id}/edit` for company with existing logo
2. Modify name or email (do not upload new logo)
3. Submit form
4. Verify existing logo still displays
5. Verify logo_url in database unchanged

**Test Case 4: Company Without Logo**
1. Create or view company without logo
2. Verify placeholder displays in companies list
3. Verify no logo preview on edit page

**Test Case 5: Invalid Image File**
1. Attempt to upload non-image file
2. Verify appropriate error handling
3. Verify form validation

### Browser Testing

**Browsers**: Chrome, Firefox, Safari, Edge

**Test Points**:
- Logo upload functionality
- Image display and rendering
- Responsive design (mobile, tablet, desktop)
- Dark mode compatibility
- Error handling and fallbacks

### Database Verification

**Queries to Run**:
```sql
-- Check logo URLs are correctly formatted
SELECT id, name, logo_url FROM companies WHERE logo_url IS NOT NULL;

-- Verify no double "logos/" paths
SELECT id, name, logo_url FROM companies WHERE logo_url LIKE '%logos/logos/%';
```

### R2 Bucket Verification

**Checks**:
- Verify files are stored with correct key format
- Verify files are accessible via GET `/logos/{key}` route
- Check file metadata and content-type

## Implementation Notes

### Form Encoding

The form must use `enctype="multipart/form-data"` to support file uploads. This is already correctly set in the EditCompany component:

```tsx
<form action="/companies" method="post" className="space-y-6">
```

Note: The form element should explicitly include `enctype="multipart/form-data"`:

```tsx
<form action="/companies" method="post" enctype="multipart/form-data" className="space-y-6">
```

### File Size Considerations

**Current**: No file size validation

**Recommendation**: Add file size check (e.g., max 5MB) to prevent large uploads:

```typescript
if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 5 * 1024 * 1024) { // 5MB limit
        return new Response('Logo file too large (max 5MB)', { status: 400 });
    }
    // ... rest of upload logic
}
```

### Content Type Validation

**Current**: Accepts any file type

**Recommendation**: Validate file type to ensure only images are uploaded:

```typescript
if (logoFile && logoFile.size > 0) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(logoFile.type)) {
        return new Response('Invalid file type. Only PNG, JPG, and SVG are allowed.', { status: 400 });
    }
    // ... rest of upload logic
}
```

### Performance Considerations

**Image Optimization**: Consider adding image optimization/resizing before storage to reduce file sizes and improve load times. This could be done using Cloudflare Images or a similar service.

**Caching**: The `/logos/{key}` GET route should include appropriate cache headers:

```typescript
return new Response(object.body, {
    headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
    },
});
```

## Security Considerations

### File Upload Security

- Validate file types to prevent malicious file uploads
- Implement file size limits to prevent DoS attacks
- Use timestamp-based naming to prevent path traversal attacks
- Store files in isolated R2 bucket with appropriate permissions

### Access Control

- Ensure only authenticated users can upload logos
- Verify user has permission to modify company records
- Implement CSRF protection on form submissions

### Content Security

- Sanitize filenames to remove special characters
- Validate image content (not just MIME type)
- Consider scanning uploaded files for malware
