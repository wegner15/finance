# Implementation Plan

- [x] 1. Fix backend logo URL construction bug
  - Fix the logo_url path construction in the POST /companies handler to use `/${key}` instead of `/logos/${key}`
  - Simplify the update logic to always update all company fields including logo_url
  - Add logic to preserve existing logo_url when no new logo is uploaded during updates
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Add form encoding attribute for file uploads
  - Add `enctype="multipart/form-data"` attribute to the form element in EditCompany.tsx
  - _Requirements: 1.1, 1.5_

- [x] 3. Enhance logo display on Edit Company page
  - Increase logo preview size from 64px to 128px (w-32 h-32)
  - Add object-contain styling to maintain aspect ratio
  - Add rounded corners, border, padding, and background color
  - Add descriptive label "Current Logo:" above the preview
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Enhance logo display on Companies list page
  - Import Building icon from lucide-react
  - Increase logo size from 32px to 64px (w-16 h-16)
  - Add object-cover styling for better table display
  - Add rounded corners and border
  - Create placeholder component with Building icon for companies without logos
  - Improve alt text for accessibility
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Add error handling for logo display
  - Add onError handler to logo img elements on Edit Company page
  - Add onError handler to logo img elements on Companies list page
  - Hide broken images and log errors for debugging
  - _Requirements: 2.1, 3.1_

- [x] 6. Add file validation and security enhancements
  - Add file size validation (max 5MB) in backend handler
  - Add file type validation to only allow PNG, JPG, JPEG, and SVG
  - Add error handling for R2 upload failures
  - Return appropriate error messages for validation failures
  - _Requirements: 1.1, 1.3_

- [x] 7. Add cache headers to logo serving route
  - Update the GET /logos/{key} route to include Cache-Control headers
  - Set cache to public with long max-age for better performance
  - _Requirements: 2.1, 3.1_
