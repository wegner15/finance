# Requirements Document

## Introduction

This feature fixes a critical bug in the company logo upload functionality. Currently, when users upload a company logo through the Edit Company page, the logo does not display on either the Edit Company page or the Companies list page. Investigation reveals that the logo URL is being constructed incorrectly in the backend, resulting in a double "logos/" path (e.g., `/logos/logos/...`) which causes 404 errors when attempting to load the image.

## Glossary

- **Edit Company Page**: The page at `/companies/{id}/edit` where users can modify company information and upload logos
- **Companies List Page**: The page at `/companies` that displays all companies in a table format
- **Company Logo**: An image file uploaded by the user to represent their company stored in R2 bucket
- **Logo URL**: The path used to reference and retrieve the uploaded logo from storage
- **R2 Bucket**: Cloudflare's object storage service where company logos are stored
- **Backend Handler**: The server-side code in `src/index.tsx` that processes form submissions

## Requirements

### Requirement 1

**User Story:** As a user, I want my uploaded company logo to be stored with the correct URL path, so that the logo can be retrieved and displayed successfully.

#### Acceptance Criteria

1. WHEN a logo file is uploaded, THE Backend Handler SHALL construct the storage key as `logos/{timestamp}-{filename}`
2. WHEN storing the logo URL in the database, THE Backend Handler SHALL set logo_url to `/{key}` without duplicating the "logos/" prefix
3. THE Backend Handler SHALL store the logo file in the R2 Bucket using the constructed key
4. THE Backend Handler SHALL save the correct logo_url value to the companies table in the database
5. THE Backend Handler SHALL handle both new company creation and existing company updates with logo uploads

### Requirement 2

**User Story:** As a user, I want to see my uploaded company logo displayed on the Edit Company page, so that I can verify the logo was uploaded successfully.

#### Acceptance Criteria

1. WHEN the Edit Company Page loads for a company with a logo_url, THE Edit Company Page SHALL fetch and display the logo image
2. THE Edit Company Page SHALL display the logo with a width of 128 pixels and height of 128 pixels
3. THE Edit Company Page SHALL apply object-fit contain styling to maintain aspect ratio
4. THE Edit Company Page SHALL display rounded corners on the logo image
5. WHERE no logo exists, THE Edit Company Page SHALL not display any logo preview

### Requirement 3

**User Story:** As a user, I want to see company logos displayed in the Companies list table, so that I can quickly identify companies visually.

#### Acceptance Criteria

1. WHEN the Companies List Page displays companies with logos, THE Companies List Page SHALL render each logo with appropriate sizing
2. THE Companies List Page SHALL display logos with a minimum width of 64 pixels and minimum height of 64 pixels
3. THE Companies List Page SHALL apply object-fit cover styling to maintain aspect ratio
4. THE Companies List Page SHALL apply rounded corners to logo images for visual consistency
5. WHERE a company has no logo_url, THE Companies List Page SHALL display a dash ("-") placeholder
