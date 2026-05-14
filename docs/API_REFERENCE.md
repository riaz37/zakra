# Backend API Reference

> Auto-generated from OpenAPI spec at `https://kb-production-45df.up.railway.app/openapi.json`

> 98 endpoints · 142 schemas


## Authentication

### `POST /api/v1/auth/change-password`
_Change Password_

Change current user's password.

This will invalidate all existing sessions.

**Request body:**
  *(schema: `app__schemas__auth__ChangePasswordRequest`)*
  - `current_password` `string` [**required**]
  - `new_password` `string` [**required**]

**Responses:**
  - `200` → `SuccessResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/auth/login`
_Login_

Authenticate user and return access and refresh tokens.

**Request body:**
  *(schema: `LoginRequest`)*
  - `email` `string` [**required**]
  - `password` `string` [**required**]
  - `remember_me` `boolean` [optional] *(default: `False`)*

**Responses:**
  - `200` → `LoginResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/auth/logout`
_Logout_

Logout current session.

If refresh_token is provided, only that session is logged out.
Otherwise, all sessions are terminated.

**Request body:**
  *(schema: `LogoutRequest`)*
  - `refresh_token` `string` [optional]

**Responses:**
  - `200` → `LogoutResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/auth/logout-all`
_Logout All_

Logout from all devices/sessions.

Revokes all refresh tokens for the user.

**Responses:**
  - `200` → `SuccessResponse` Successful Response

### `GET /api/v1/auth/me`
_Get Me_

Get current user's profile.

**Responses:**
  - `200` → `app__schemas__auth__UserResponse` Successful Response

### `PUT /api/v1/auth/me`
_Update Me_

Update current user's profile.

**Request body:**
  *(schema: `UpdateMeRequest`)*
  - `first_name` `string` [optional]
  - `last_name` `string` [optional]
  - `phone` `string` [optional]
  - `avatar_url` `string` [optional]

**Responses:**
  - `200` → `app__schemas__auth__UserResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/auth/refresh`
_Refresh Token_

Refresh access token using a valid refresh token.

This endpoint implements refresh token rotation - the old refresh token
is invalidated and a new one is returned.

**Request body:**
  *(schema: `RefreshTokenRequest`)*
  - `refresh_token` `string` [**required**]

**Responses:**
  - `200` → `RefreshTokenResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/auth/register`
_Register_

Register a new user.

For B2B mode, company information is required.
For B2C mode, company is optional.

**Request body:**
  *(schema: `RegisterRequest`)*
  - `email` `string` [**required**]
  - `password` `string` [**required**]
  - `first_name` `string` [**required**]
  - `last_name` `string` [**required**]
  - `mode` `string` [optional] *(default: `b2c`)*
  - `company` `object` [optional]

**Responses:**
  - `201` → `RegisterResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## Companies

### `GET /api/v1/companies`
_List Companies_

List companies accessible to current user.

- Super admins see all companies
- Admins see their company and subsidiaries
- Regular users see only their assigned company

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 
  - `parent_only` `boolean` [optional] *(default: `False`)* — Only return parent companies

**Responses:**
  - `200` → `CompanyListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/companies`
_Create Company_

Create a new parent company.

Only super admins can create parent companies.

**Request body:**
  *(schema: `CompanyCreate`)*
  - `name` `string` [**required**]
  - `slug` `string` [optional]
  - `settings` `object` [optional]

**Responses:**
  - `201` → `app__schemas__company__CompanyResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/companies/{company_id}`
_Get Company_

Get a company by ID with subsidiary information.

**Path params:**
  - `company_id` `string` — 

**Responses:**
  - `200` → `CompanyWithSubsidiaries` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PUT /api/v1/companies/{company_id}`
_Update Company_

Update a company.

- Super admins can update any company
- Company admins can update their own company
- Parent company admins can update subsidiaries

**Path params:**
  - `company_id` `string` — 

**Request body:**
  *(schema: `CompanyUpdate`)*
  - `name` `string` [optional]
  - `slug` `string` [optional]
  - `status` `string` [optional]
  - `settings` `object` [optional]

**Responses:**
  - `200` → `app__schemas__company__CompanyResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/companies/{company_id}`
_Delete Company_

Delete a company (soft delete).

Only super admins can delete companies.
Parent companies with subsidiaries cannot be deleted.

**Path params:**
  - `company_id` `string` — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/companies/{company_id}/sub-companies`
_List Subsidiaries_

List subsidiaries of a parent company.

**Path params:**
  - `company_id` `string` — 

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `CompanyListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/companies/{company_id}/sub-companies`
_Create Subsidiary_

Create a subsidiary company.

- Super admins can create subsidiaries under any parent
- Parent company admins can create subsidiaries under their company

**Path params:**
  - `company_id` `string` — 

**Request body:**
  *(schema: `SubCompanyCreate`)*
  - `name` `string` [**required**]
  - `slug` `string` [optional]
  - `settings` `object` [optional]

**Responses:**
  - `201` → `app__schemas__company__CompanyResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/companies/{company_id}/users`
_List Company Users_

List users belonging to a company.

**Path params:**
  - `company_id` `string` — 

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `CompanyUsersResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/companies/{company_id}/users`
_Add User To Company_

Add a user to a company.

- Super admins can add users to any company
- Company admins can add users to their company

**Path params:**
  - `company_id` `string` — 

**Request body:**
  *(schema: `AddUserToCompanyRequest`)*
  - `user_id` `string` [**required**]
  - `is_primary` `boolean` [optional] *(default: `False`)*

**Responses:**
  - `200` → `AddUserToCompanyResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/companies/{company_id}/users/{user_id}`
_Remove User From Company_

Remove a user from a company.

- Super admins can remove users from any company
- Company admins can remove users from their company

**Path params:**
  - `company_id` `string` — 
  - `user_id` `string` — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## Database Access

### `POST /api/v1/data/query`
_Execute Query_

Execute a query with column-level access control.

The query will:
- Only return columns the user has access to
- Apply masking to columns with read_masked permission
- Apply row filters if configured
- Log the query for audit purposes

Example request:
```json
{
    "table_name": "users",
    "columns": ["id", "email", "name"],
    "filters": {"status": "active"},
    "order_by": "name",
    "limit": 100,
    "offset": 0
}
```

**Request body:**
  *(schema: `QueryRequest`)*
  - `table_name` `string` [**required**]
  - `schema_name` `string` [optional] *(default: `public`)*
  - `columns` `array` [optional]
  - `filters` `object` [optional]
  - `order_by` `string` [optional]
  - `order_direction` `string` [optional] *(default: `asc`)*
  - `limit` `integer` [optional] *(default: `100`)*
  - `offset` `integer` [optional] *(default: `0`)*

**Responses:**
  - `200` → `QueryResult` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/data/query-history`
_Get Query History_

Get query history for current user.

Admins can see all query history.

**Query params:**
  - `table_name` `string` [optional] — Filter by table
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `QueryHistoryResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/data/tables`
_List Managed Tables_

List all managed tables accessible to current user.

- Super admins must provide company_id to filter tables
- Regular users see tables for their company

**Query params:**
  - `company_id` `string` [optional] — Filter by company (required for super_admin)

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/data/tables`
_Register Table_

Register a table for access control.

Only super admins can register tables.
Company can be specified via query param or in request body.

**Query params:**
  - `company_id` `string` [optional] — Company ID (can also be in body)

**Request body:**
  *(schema: `ManagedTableCreate`)*
  - `table_name` `string` [**required**]
  - `schema_name` `string` [optional] *(default: `public`)*
  - `display_name` `string` [optional]
  - `description` `string` [optional]
  - `company_id` `string` [optional]

**Responses:**
  - `201` → `ManagedTableResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/data/tables/{table_name}/column-permissions`
_Grant Column Permission_

Grant permission on a table column.

Only admins can grant column permissions.

Permission levels:
- none: No access
- read: Can read full value
- read_masked: Can read masked value
- write: Can read and write

**Path params:**
  - `table_name` `string` — 

**Query params:**
  - `schema_name` `string` [optional] *(default: `public`)* — Database schema
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Request body:**
  *(schema: `ColumnPermissionCreate`)*
  - `column_name` `string` [**required**]
  - `permission` `string` [**required**]
  - `mask_pattern` `string` [optional]
  - `row_filter` `string` [optional]
  - `grantee_type` `string` [**required**]
  - `grantee_id` `string` [**required**]

**Responses:**
  - `200` → `ColumnPermissionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/data/tables/{table_name}/column-permissions/bulk`
_Bulk Grant Permissions_

Grant permissions on multiple columns at once.

Example request body:
```json
{
    "grantee_type": "user",
    "grantee_id": "uuid",
    "permissions": {
        "email": "read_masked",
        "name": "read",
        "phone": "none"
    }
}
```

**Path params:**
  - `table_name` `string` — 

**Query params:**
  - `schema_name` `string` [optional] *(default: `public`)* — Database schema

**Request body:**
  *(schema: `BulkColumnPermissionRequest`)*
  - `grantee_type` `string` [**required**]
  - `grantee_id` `string` [**required**]
  - `permissions` `object` [**required**]

**Responses:**
  - `200` → `BulkColumnPermissionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/data/tables/{table_name}/column-permissions/{column_name}`
_Revoke Column Permission_

Revoke a column permission.

**Path params:**
  - `table_name` `string` — 
  - `column_name` `string` — 

**Query params:**
  - `grantee_type` `string` [**required**] — user or role
  - `grantee_id` `string` [**required**] — Grantee UUID
  - `schema_name` `string` [optional] *(default: `public`)* — Database schema

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/data/tables/{table_name}/columns`
_Get Table Columns_

Get table columns with user's permissions on each column.

**Path params:**
  - `table_name` `string` — 

**Query params:**
  - `schema_name` `string` [optional] *(default: `public`)* — Database schema

**Responses:**
  - `200` → `TableColumnsResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/data/tables/{table_name}/permissions`
_Get Effective Permissions_

Get user's effective permissions on a table.

Shows which columns are readable, writable, masked, or blocked.

**Path params:**
  - `table_name` `string` — 

**Query params:**
  - `schema_name` `string` [optional] *(default: `public`)* — Database schema

**Responses:**
  - `200` → `EffectivePermissionsResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/data/tables/{table_name}/role-permissions/{role_id}`
_Get Role Table Permissions_

Get a role's column permissions for a table.

Returns a mapping of column_name to permission level.
Only admins and super_admins can view role permissions.

**Path params:**
  - `table_name` `string` — 
  - `role_id` `string` — 

**Query params:**
  - `schema_name` `string` [optional] *(default: `public`)* — Database schema
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/data/tables/{table_name}/user-permissions/{user_id}`
_Get User Table Permissions_

Get a specific user's column permissions for a table.

Returns a mapping of column_name to permission level.
Only admins and super_admins can view other users' permissions.

**Path params:**
  - `table_name` `string` — 
  - `user_id` `string` — 

**Query params:**
  - `schema_name` `string` [optional] *(default: `public`)* — Database schema
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/data/users/{user_id}/permissions`
_Get User Permissions_

Get all table permissions for a specific user.

Returns tables the user has access to with their column-level permissions.
Only super admins and admins can view other users' permissions.

**Path params:**
  - `user_id` `string` — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## Files

### `GET /api/v1/files`
_List Files_

List files.

If folder_id is not specified, returns all user's files.

**Query params:**
  - `folder_id` `string` [optional] — Filter by folder
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `FileListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/files/folders`
_List Folders_

List folders.

If parent_id is not specified, returns root folder children.

**Query params:**
  - `parent_id` `string` [optional] — Parent folder ID

**Responses:**
  - `200` → `FolderListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/files/folders`
_Create Folder_

Create a new folder.

**Request body:**
  *(schema: `FolderCreate`)*
  - `name` `string` [**required**]
  - `parent_folder_id` `string` [optional]
  - `is_shared` `boolean` [optional] *(default: `False`)*

**Responses:**
  - `201` → `FolderResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/files/folders/{folder_id}`
_Get Folder_

Get folder with contents.

**Path params:**
  - `folder_id` `string` — 

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `FolderWithContents` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PUT /api/v1/files/folders/{folder_id}`
_Update Folder_

Update a folder.

**Path params:**
  - `folder_id` `string` — 

**Request body:**
  *(schema: `FolderUpdate`)*
  - `name` `string` [optional]
  - `is_shared` `boolean` [optional]

**Responses:**
  - `200` → `FolderResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/files/folders/{folder_id}`
_Delete Folder_

Delete a folder.

Use recursive=true to delete non-empty folders.

**Path params:**
  - `folder_id` `string` — 

**Query params:**
  - `recursive` `boolean` [optional] *(default: `False`)* — Delete contents recursively

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/files/folders/{folder_id}/share`
_Share Folder_

Share a folder with a user, role, or company.

**Path params:**
  - `folder_id` `string` — 

**Request body:**
  *(schema: `FileShareRequest`)*
  - `grantee_type` `string` [**required**]
  - `grantee_id` `string` [**required**]
  - `permission` `string` [**required**]
  - `expires_at` `string` [optional]

**Responses:**
  - `200` → `FileShareResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/files/shared/with-me`
_Get Shared With Me_

Get files and folders shared with current user.

**Responses:**
  - `200` → `SharedWithMeResponse` Successful Response

### `DELETE /api/v1/files/shares/{grant_id}`
_Revoke Share_

Revoke a file or folder share.

**Path params:**
  - `grant_id` `string` — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/files/upload`
_Upload File_

Upload a file.

**Request body:**

**Responses:**
  - `201` → `FileUploadResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/files/{file_id}`
_Get File_

Get file metadata.

**Path params:**
  - `file_id` `string` — 

**Responses:**
  - `200` → `FileDetailResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/files/{file_id}`
_Delete File_

Delete a file.

**Path params:**
  - `file_id` `string` — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/files/{file_id}/download`
_Download File_

Download a file.

**Path params:**
  - `file_id` `string` — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/files/{file_id}/move`
_Move File_

Move a file to another folder.

**Path params:**
  - `file_id` `string` — 

**Request body:**
  *(schema: `FileMoveRequest`)*
  - `destination_folder_id` `string` [**required**]

**Responses:**
  - `200` → `FileResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/files/{file_id}/rename`
_Rename File_

Rename a file.

**Path params:**
  - `file_id` `string` — 

**Request body:**
  *(schema: `FileRenameRequest`)*
  - `new_filename` `string` [**required**]

**Responses:**
  - `200` → `FileResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/files/{file_id}/share`
_Share File_

Share a file with a user, role, or company.

**Path params:**
  - `file_id` `string` — 

**Request body:**
  *(schema: `FileShareRequest`)*
  - `grantee_type` `string` [**required**]
  - `grantee_id` `string` [**required**]
  - `permission` `string` [**required**]
  - `expires_at` `string` [optional]

**Responses:**
  - `200` → `FileShareResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## RAG

### `GET /api/v1/rag/debug/embedding-test`
_Debug Embedding Test_

Test embedding provider in HTTP context (debug endpoint).

This endpoint tests if embeddings work when called via HTTP.

**Responses:**
  - `200` Successful Response

### `POST /api/v1/rag/excel-decision`
_Handle Excel Decision_

Handle Excel file processing decision.

After uploading an Excel file, user must decide whether to:
- Process as RAG document (text extraction)
- Import as database table

**Request body:**
  *(schema: `ExcelDecisionRequest`)*
  - `file_id` `string` [**required**] — Storage path of the Excel file
  - `decision` `string` [**required**] — Either 'rag' or 'database'
  - `sheet_names` `array` [optional] — Specific sheets to process (for database import)

**Responses:**
  - `200` → `IngestionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/rag/files/{file_id}`
_Delete File Index_

Delete indexed data for a file.

Removes all chunks and embeddings for the specified file.
Does not delete the original file from storage.

**Path params:**
  - `file_id` `string` — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/rag/ingest`
_Ingest File_

Ingest a file for RAG processing.

Uploads and processes a document for semantic search and question answering.

- Supported types: PDF, Word, Excel, Text, Markdown
- Returns a task ID for tracking progress via SSE

**Query params:**
  - `chunk_size` `integer` [optional] — 
  - `chunk_overlap` `integer` [optional] — 
  - `chunking_strategy` `string` [optional] — 

**Request body:**

**Responses:**
  - `202` → `IngestionResponse` Successful Response
  - `400` → `RAGErrorResponse` Invalid file type
  - `413` → `RAGErrorResponse` File too large
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/rag/ingest/{file_id}`
_Ingest Existing File_

Ingest an existing file by storage path.

Use this endpoint to re-index a file or process a file
that was previously uploaded but not indexed.

**Path params:**
  - `file_id` `string` — 

**Request body:**

**Responses:**
  - `202` → `IngestionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/rag/ingest/{task_id}/status`
_Get Ingestion Status_

Get status of an ingestion task.

Returns current progress, chunk counts, and any errors.

**Path params:**
  - `task_id` `string` — 

**Responses:**
  - `200` → `IngestionStatusResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/rag/intents`
_List Intents_

List document intents.

Returns categorized intents discovered through self-learning.

**Responses:**
  - `200` → `IntentListResponse` Successful Response

### `POST /api/v1/rag/query`
_Query Documents_

Answer a question using RAG.

Retrieves relevant document chunks and generates an answer
with source citations.

**Request body:**
  *(schema: `RAGQueryRequest`)*
  - `question` `string` [**required**] — Question to answer
  - `file_ids` `array` [optional] — Filter by specific files
  - `top_k` `integer` [optional] — Number of chunks to retrieve
  - `max_context_tokens` `integer` [optional] — Maximum context tokens
  - `use_reranking` `boolean` [optional] — Whether to apply reranking
  - `system_prompt` `string` [optional] — Custom system prompt for answer generation

**Responses:**
  - `200` → `RAGQueryResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/rag/search`
_Search Documents_

Search documents using semantic similarity.

Returns ranked document chunks matching the query.

**Request body:**
  *(schema: `SimilaritySearchRequest`)*
  - `query` `string` [**required**] — Search query
  - `file_ids` `array` [optional] — Filter by specific files
  - `top_k` `integer` [optional] *(default: `10`)* — Number of results
  - `threshold` `number` [optional] — Minimum similarity threshold

**Responses:**
  - `200` → `SimilaritySearchResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/rag/stats`
_Get Document Stats_

Get statistics for indexed documents.

Returns counts and summaries of indexed content.

**Responses:**
  - `200` → `DocumentStatsResponse` Successful Response


## Roles

### `GET /api/v1/roles`
_List Roles_

List roles accessible to current user.

- Global roles (company_id=null) are available to all
- Company roles are filtered by company

**Query params:**
  - `company_id` `string` [optional] — Filter by company
  - `include_global` `boolean` [optional] *(default: `True`)* — Include global roles

**Responses:**
  - `200` → `RoleListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/roles`
_Create Role_

Create a new role.

- Super admins can create global and company roles
- Admins can create roles in their company

**Request body:**
  *(schema: `RoleCreate`)*
  - `name` `string` [**required**]
  - `slug` `string` [optional]
  - `description` `string` [optional]
  - `company_id` `string` [optional]
  - `hierarchy_level` `integer` [optional] *(default: `0`)*
  - `is_default` `boolean` [optional] *(default: `False`)*

**Responses:**
  - `201` → `RoleResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/roles/permissions/all`
_List All Permissions_

List all available permissions grouped by module.

**Responses:**
  - `200` → `PermissionListResponse` Successful Response

### `GET /api/v1/roles/permissions/module/{module}`
_Get Permissions By Module_

Get permissions for a specific module.

**Path params:**
  - `module` `string` — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/roles/{role_id}`
_Get Role_

Get a role by ID with permissions and user count.

**Path params:**
  - `role_id` `string` — 

**Responses:**
  - `200` → `RoleWithPermissions` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PUT /api/v1/roles/{role_id}`
_Update Role_

Update a role.

- Cannot update system roles
- Super admins can update any custom role
- Admins can update roles in their company

**Path params:**
  - `role_id` `string` — 

**Request body:**
  *(schema: `RoleUpdate`)*
  - `name` `string` [optional]
  - `slug` `string` [optional]
  - `description` `string` [optional]
  - `hierarchy_level` `integer` [optional]
  - `is_default` `boolean` [optional]

**Responses:**
  - `200` → `RoleResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/roles/{role_id}`
_Delete Role_

Delete a role (soft delete).

- Cannot delete system roles
- Cannot delete roles with users assigned

**Path params:**
  - `role_id` `string` — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/roles/{role_id}/permissions`
_Get Role Permissions_

Get permissions assigned to a role.

**Path params:**
  - `role_id` `string` — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PUT /api/v1/roles/{role_id}/permissions`
_Set Role Permissions_

Set all permissions for a role (replaces existing).

- Cannot modify system role permissions

**Path params:**
  - `role_id` `string` — 

**Request body:**
  *(schema: `SetRolePermissionsRequest`)*
  - `permission_ids` `array` [**required**]

**Responses:**
  - `200` → `SetRolePermissionsResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## Speech-to-Text

### `POST /api/v1/stt/transcribe`
_Transcribe audio to text_

Convert an uploaded audio file to text.

Accepts common audio formats (mp3, wav, ogg, flac, aac, webm, m4a).
Maximum file size: configured via STT_MAX_UPLOAD_MB (default 20 MB).

Returns:
    text: The transcribed text.
    language: Detected or provided language code.
    provider: STT backend used.
    model: Model name used.
    duration_seconds: Audio duration if reported by the provider.

**Request body:**

**Responses:**
  - `200` Transcription result
  - `422` → `HTTPValidationError` Validation Error


## System

### `GET /`
_Root_

Root endpoint.

**Responses:**
  - `200` Successful Response

### `GET /api/v1/system/audit/actions`
_List Audit Actions_

List all available audit action types.

Useful for filtering audit logs.

**Responses:**
  - `200` Successful Response

### `GET /api/v1/system/audit/logs`
_Get Audit Logs_

Get audit logs.

- Super admins can see all logs
- Company admins can see their company's logs
- Regular users can see their own logs

**Query params:**
  - `action` `string` [optional] — Filter by action type
  - `user_id` `string` [optional] — Filter by user ID
  - `company_id` `string` [optional] — Filter by company ID
  - `resource_type` `string` [optional] — Filter by resource type
  - `resource_id` `string` [optional] — Filter by resource ID
  - `start_date` `string` [optional] — Filter by start date
  - `end_date` `string` [optional] — Filter by end date
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `AuditLogListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/system/audit/resources/{resource_type}/{resource_id}`
_Get Resource History_

Get audit history for a specific resource.

Shows all actions performed on the resource.

**Path params:**
  - `resource_type` `string` — 
  - `resource_id` `string` — 

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `AuditLogListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/system/audit/users/{user_id}/activity`
_Get User Activity_

Get activity log for a specific user.

- Users can see their own activity
- Admins can see activity for users in their company
- Super admins can see all activity

**Path params:**
  - `user_id` `string` — 

**Query params:**
  - `days` `integer` [optional] *(default: `30`)* — Days to look back
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `AuditLogListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/system/audit/users/{user_id}/logins`
_Get Login History_

Get login history for a user.

Shows successful and failed login attempts.

**Path params:**
  - `user_id` `string` — 

**Query params:**
  - `days` `integer` [optional] *(default: `30`)* — Days to look back
  - `limit` `integer` [optional] *(default: `50`)* — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/system/health`
_Health Check_

Health check endpoint.

Returns status of the application and its dependencies.

**Responses:**
  - `200` → `HealthResponse` Successful Response

### `GET /api/v1/system/info`
_System Info_

Get system information.

Returns app configuration and feature flags.

**Responses:**
  - `200` → `SystemInfoResponse` Successful Response

### `GET /health`
_Health Check_

Health check endpoint.

**Responses:**
  - `200` Successful Response


## Users

### `GET /api/v1/users`
_List Users_

List users accessible to current user.

- Super admins see all users
- Admins see users in their company

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 
  - `company_id` `string` [optional] — Filter by company

**Responses:**
  - `200` → `UserListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/users`
_Create User_

Create a new user.

- Super admins can create any user type
- Admins can create regular and admin users
- Regular users cannot create users

**Request body:**
  *(schema: `UserCreate`)*
  - `email` `string` [**required**]
  - `first_name` `string` [optional]
  - `last_name` `string` [optional]
  - `password` `string` [**required**]
  - `user_type` `string` [optional] *(default: `regular`)*
  - `mode` `string` [optional] *(default: `b2b`)*
  - `company_id` `string` [optional]

**Responses:**
  - `201` → `app__schemas__user__UserResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/users/search`
_Search Users_

Search users by email or name.

**Query params:**
  - `q` `string` [**required**] — Search query
  - `company_id` `string` [optional] — Filter by company
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 

**Responses:**
  - `200` → `UserListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/users/{user_id}`
_Get User_

Get a user by ID with roles and companies.

**Path params:**
  - `user_id` `string` — 

**Responses:**
  - `200` → `UserDetailResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PUT /api/v1/users/{user_id}`
_Update User_

Update a user.

- Super admins can update any user
- Admins can update non-admin users
- Users can update their own profile (limited fields)

**Path params:**
  - `user_id` `string` — 

**Request body:**
  *(schema: `UserUpdate`)*
  - `email` `string` [optional]
  - `first_name` `string` [optional]
  - `last_name` `string` [optional]
  - `user_type` `string` [optional]
  - `status` `string` [optional]
  - `preferences` `object` [optional]

**Responses:**
  - `200` → `app__schemas__user__UserResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/users/{user_id}`
_Delete User_

Delete a user (soft delete).

- Cannot delete yourself
- Super admins can delete any user
- Admins can delete non-admin users

**Path params:**
  - `user_id` `string` — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/users/{user_id}/change-password`
_Admin Change Password_

Change a user's password (admin action).

This is different from the user changing their own password.
Requires admin privileges.

**Path params:**
  - `user_id` `string` — 

**Request body:**
  *(schema: `app__schemas__user__ChangePasswordRequest`)*
  - `new_password` `string` [**required**]

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/users/{user_id}/roles`
_Get User Roles_

Get roles assigned to a user.

**Path params:**
  - `user_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Filter by company

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PUT /api/v1/users/{user_id}/roles`
_Assign User Roles_

Assign roles to a user (replaces existing roles in context).

- Super admins can assign any role
- Admins can assign roles in their company

**Path params:**
  - `user_id` `string` — 

**Request body:**
  *(schema: `AssignRolesRequest`)*
  - `role_ids` `array` [**required**]
  - `company_id` `string` [optional]

**Responses:**
  - `200` → `AssignRolesResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## chat

### `POST /api/v1/chat/sessions`
_Create a new chat session_

Create a new chat session.

**Query params:**
  - `company_id` `string` [optional] — 

**Request body:**
  *(schema: `ChatSessionCreate`)*
  - `title` `string` [optional]
  - `connection_id` `string` [optional]

**Responses:**
  - `201` → `ChatSessionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/chat/sessions`
_List chat sessions_

List the current user's chat sessions.

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `50`)* — 
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` → `ChatSessionListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/chat/sessions/{session_id}`
_Get a chat session_

Get a single chat session by ID.

**Path params:**
  - `session_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` → `ChatSessionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PATCH /api/v1/chat/sessions/{session_id}`
_Update a chat session_

Update session title or active connection.

**Path params:**
  - `session_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Request body:**
  *(schema: `ChatSessionUpdate`)*
  - `title` `string` [optional]
  - `connection_id` `string` [optional]

**Responses:**
  - `200` → `ChatSessionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/chat/sessions/{session_id}`
_Delete a chat session_

Soft-delete a chat session.

**Path params:**
  - `session_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/chat/sessions/{session_id}/messages`
_List messages in a session_

Get paginated messages for a chat session.

**Path params:**
  - `session_id` `string` — 

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `50`)* — 
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` → `ChatMessageListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/chat/sessions/{session_id}/messages`
_Send a message_

Send a user message. Returns task_id for SSE subscription.

**Path params:**
  - `session_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Request body:**
  *(schema: `ChatMessageCreate`)*
  - `content` `string` [**required**]
  - `language` `string` [optional] *(default: `en`)* — Output language for AI-generated report content

**Responses:**
  - `202` → `ChatMessageSubmitResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## db-agent

### `POST /api/v1/db-agent/connections`
_Create database connection_

Create a new external database connection for querying.

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Request body:**
  *(schema: `DatabaseConnectionCreate`)*
  - `name` `string` [**required**]
  - `description` `string` [optional]
  - `database_type` `string` [**required**]
  - `host` `string` [**required**]
  - `port` `integer` [**required**]
  - `database_name` `string` [**required**]
  - `username` `string` [**required**]
  - `ssl_enabled` `boolean` [optional] *(default: `True`)*
  - `pool_size` `integer` [optional] *(default: `5`)*
  - `pool_timeout` `integer` [optional] *(default: `30`)*
  - `query_timeout` `integer` [optional] *(default: `30`)*
  - `password` `string` [**required**]
  - `ssl_ca_cert` `string` [optional]

**Responses:**
  - `201` → `DatabaseConnectionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/db-agent/connections`
_List database connections_

List all database connections for the company.

**Query params:**
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `100`)* — 
  - `active_only` `boolean` [optional] *(default: `False`)* — 
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` → `DatabaseConnectionListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/db-agent/connections/{connection_id}`
_Get database connection_

Get details of a specific database connection.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` → `DatabaseConnectionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PATCH /api/v1/db-agent/connections/{connection_id}`
_Update database connection_

Update an existing database connection.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Request body:**
  *(schema: `DatabaseConnectionUpdate`)*
  - `name` `string` [optional]
  - `description` `string` [optional]
  - `host` `string` [optional]
  - `port` `integer` [optional]
  - `database_name` `string` [optional]
  - `username` `string` [optional]
  - `password` `string` [optional]
  - `ssl_enabled` `boolean` [optional]
  - `ssl_ca_cert` `string` [optional]
  - `pool_size` `integer` [optional]
  - `pool_timeout` `integer` [optional]
  - `query_timeout` `integer` [optional]
  - `is_active` `boolean` [optional]

**Responses:**
  - `200` → `DatabaseConnectionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/db-agent/connections/{connection_id}`
_Delete database connection_

Delete a database connection.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/db-agent/connections/{connection_id}/discover-tables`
_Discover database tables_

Lightweight table discovery that connects to the database and returns a list of all tables without extracting full metadata or running AI. Use this to let users pick which tables to learn.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/db-agent/connections/{connection_id}/learn-schema`
_Learn database schema_

Initiate schema learning for a database connection.

    This process extracts table metadata, generates descriptions, and creates
    embeddings for semantic search. The process runs in two phases:

    1. **Basic Learning** (fast, no AI cost): Extracts schema structure
    2. **AI Sync** (optional): Generates descriptions and embeddings using AI

    Use the returned task_id to track progress via SSE streaming.

    Optionally pass `table_names` to refresh only specific tables instead of
    the entire schema (e.g. after adding columns to a few tables).

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `force_relearn` `boolean` [optional] *(default: `False`)* — Re-learn even if already learned
  - `include_ai_sync` `boolean` [optional] *(default: `True`)* — Include AI-powered description generation
  - `company_id` `string` [optional] — Company ID (required for super_admin)
  - `table_names` `array` [optional] — Optional list of fully-qualified table names (schema.table) to refresh. When provided, only these tables are re-extracted and re-synced.

**Responses:**
  - `202` → `SchemaLearnResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/db-agent/connections/{connection_id}/learn-schema/progress`
_Get schema learning progress_

Get the current progress of schema learning for a connection.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/db-agent/connections/{connection_id}/learn-schema/resume`
_Resume AI sync_

Resume AI sync (Phase 2) for tables that are still pending.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/db-agent/connections/{connection_id}/rules`
_Create business rule_

Create a new business rule for a database connection.

    **Access control:**
    - `global` or `table` scope: Requires admin or super_admin role.
    - `user` scope: Any authenticated user can create rules for themselves.
      Regular users must set scope_value to their own user ID.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Request body:**
  *(schema: `BusinessRuleCreate`)*
  - `name` `string` [**required**]
  - `scope_type` `string` [optional] *(default: `global`)*
  - `scope_value` `string` [optional]
  - `rule_text` `string` [**required**]

**Responses:**
  - `201` → `BusinessRuleResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/db-agent/connections/{connection_id}/rules`
_List business rules_

List business rules for a database connection.

    **Access control:**
    - Admin/super_admin: See all rules.
    - Regular users: See global rules, table rules, and their own user-scoped rules.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `scope_type` `string` [optional] — 
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` → `BusinessRuleListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/db-agent/connections/{connection_id}/schema`
_Get connection schema_

Get the learned table schema for a database connection.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` → `SchemaListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PATCH /api/v1/db-agent/connections/{connection_id}/set-default`
_Set default connection_

Set a connection as the default for its company.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` → `DatabaseConnectionResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/db-agent/connections/{connection_id}/test`
_Test database connection_

Test if a database connection is working.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` → `ConnectionTestResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/db-agent/connections/{connection_id}/unlearn-tables`
_Unlearn specific tables_

Remove learned schema for specific tables by name.

**Path params:**
  - `connection_id` `string` — 

**Query params:**
  - `table_names` `array` [**required**] — Fully-qualified table names (schema.table) to unlearn
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/db-agent/query`
_Execute natural language query_

Submit a natural language query for async execution.

    Returns a task_id immediately. Subscribe to real-time progress
    via SSE at: GET /api/v1/streams/{task_id}

    The pipeline streams events for each step: intent detection,
    table selection, column selection, business rules, SQL generation,
    validation, masking, and execution. The final result is delivered
    as an intermediate_result SSE event with result_type="query_result".

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Request body:**
  *(schema: `NLQueryRequest`)*
  - `query` `string` [**required**] — Natural language question
  - `connection_id` `string` [**required**] — Database connection to query
  - `include_explanation` `boolean` [optional] *(default: `True`)* — Include query explanation
  - `max_rows` `integer` [optional] — Maximum rows to return
  - `timeout` `integer` [optional] — Query timeout in seconds

**Responses:**
  - `202` → `QuerySubmitResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PATCH /api/v1/db-agent/rules/{rule_id}`
_Update business rule_

Update an existing business rule.

    **Access control:**
    - Admin/super_admin: Can update any rule.
    - Regular users: Can only update their own user-scoped rules.

**Path params:**
  - `rule_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Request body:**
  *(schema: `BusinessRuleUpdate`)*
  - `name` `string` [optional]
  - `scope_type` `string` [optional]
  - `scope_value` `string` [optional]
  - `rule_text` `string` [optional]
  - `is_active` `boolean` [optional]

**Responses:**
  - `200` → `BusinessRuleResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/db-agent/rules/{rule_id}`
_Delete business rule_

Delete a business rule.

    **Access control:**
    - Admin/super_admin: Can delete any rule.
    - Regular users: Can only delete their own user-scoped rules.

**Path params:**
  - `rule_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — Company ID (required for super_admin)

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## learning

### `POST /api/v1/learning/database`
_Trigger database schema learning_

Trigger learning for a database connection.

This will:
1. Extract schema metadata
2. Generate descriptions for tables
3. Create embeddings for semantic search
4. Classify tables into intents

**Request body:**
  *(schema: `DatabaseLearningRequest`)*
  - `connection_id` `string` [**required**] — Database connection ID
  - `force_relearn` `boolean` [optional] *(default: `False`)* — Re-learn even if already processed

**Responses:**
  - `200` → `LearningResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/learning/database/{connection_id}/intents`
_Get learned intents for a database_

Get all learned intents for a database connection.

**Path params:**
  - `connection_id` `string` — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/learning/documents`
_Trigger document learning_

Trigger learning for documents.

This will:
1. Map chunks to intent categories
2. Classify files into sub-intents
3. Generate embeddings for new intents

**Request body:**
  *(schema: `DocumentLearningRequest`)*
  - `company_id` `string` [optional] — Limit to specific company
  - `file_ids` `array` [optional] — Limit to specific files
  - `force_relearn` `boolean` [optional] *(default: `False`)* — Re-learn already mapped chunks

**Responses:**
  - `200` → `LearningResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/learning/documents/intents`
_Get learned document intents_

Get all learned document intents.

**Query params:**
  - `company_id` `string` [optional] — Filter by company ID

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/learning/documents/sub-intents`
_Get learned document sub-intents_

Get all learned document sub-intents.

**Query params:**
  - `company_id` `string` [optional] — Filter by company ID

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## reports

### `POST /api/v1/reports/generate`
_Ai Generate Report_

Start AI-driven report generation from a natural language query.

The AI will select the best matching template, adapt its sections
to the user's request, and execute the full pipeline.
Returns task_id for SSE progress subscription.

**Query params:**
  - `company_id` `string` [optional] — 

**Request body:**
  *(schema: `AIReportGenerateRequest`)*
  - `query` `string` [**required**] — Natural language description of the report to generate
  - `connection_id` `string` [optional] — Optional connection ID to restrict template selection
  - `title` `string` [optional] — Optional custom title (AI will generate one if not provided)
  - `language` `string` [optional] *(default: `en`)* — Output language for analysis and summary (e.g. 'en', 'ar')

**Responses:**
  - `202` → `ReportGenerateResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/reports/generations`
_List Generations_

List report generations for a company.

Super admins see all reports; other users see only their own.

**Query params:**
  - `company_id` `string` [optional] — 
  - `skip` `integer` [optional] *(default: `0`)* — 
  - `limit` `integer` [optional] *(default: `20`)* — 

**Responses:**
  - `200` → `ReportGenerationListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/reports/generations/{generation_id}`
_Get Generation_

Get a report generation with sections.

**Path params:**
  - `generation_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` → `ReportGenerationResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/reports/generations/{generation_id}/download`
_Download Report Pdf_

Download the report as a PDF file.

**Path params:**
  - `generation_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/reports/generations/{generation_id}/html`
_Get Generation Html_

Get the HTML content of a completed report.

**Path params:**
  - `generation_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/reports/templates`
_Create Template_

Create a new report template.

**Query params:**
  - `company_id` `string` [optional] — 

**Request body:**
  *(schema: `ReportTemplateCreate`)*
  - `name` `string` [**required**]
  - `description` `string` [optional]
  - `connection_id` `string` [**required**]
  - `report_type` `string` [optional] *(default: `custom`)*
  - `sections` `array` [**required**]
  - `default_analysis_prompt` `string` [optional]
  - `report_style` `object` [optional]

**Responses:**
  - `201` → `ReportTemplateResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/reports/templates`
_List Templates_

List all report templates for a company.

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` → `ReportTemplateListResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/reports/templates/{template_id}`
_Get Template_

Get a report template by ID.

**Path params:**
  - `template_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `200` → `ReportTemplateResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `PATCH /api/v1/reports/templates/{template_id}`
_Update Template_

Update a report template.

**Path params:**
  - `template_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Request body:**
  *(schema: `ReportTemplateUpdate`)*
  - `name` `string` [optional]
  - `description` `string` [optional]
  - `sections` `array` [optional]
  - `default_analysis_prompt` `string` [optional]
  - `report_style` `object` [optional]
  - `is_active` `boolean` [optional]

**Responses:**
  - `200` → `ReportTemplateResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/reports/templates/{template_id}`
_Delete Template_

Delete a report template.

**Path params:**
  - `template_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `POST /api/v1/reports/templates/{template_id}/generate`
_Generate Report_

Start generating a report from a template. Returns task_id for SSE.

**Path params:**
  - `template_id` `string` — 

**Query params:**
  - `company_id` `string` [optional] — 

**Request body:**

**Responses:**
  - `202` → `ReportGenerateResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error


## streams

### `GET /api/v1/streams`
_List user's streams_

List all active streams for the current user.

**Responses:**
  - `200` → `StreamListResponse` Successful Response

### `GET /api/v1/streams/stats`
_Get streaming statistics_

Get streaming service statistics (super admin only).

**Responses:**
  - `200` → `StreamStatsResponse` Successful Response

### `GET /api/v1/streams/{task_id}`
_Subscribe to SSE stream_

Subscribe to real-time events for a task via Server-Sent Events.

**Path params:**
  - `task_id` `string` — 

**Responses:**
  - `200` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `DELETE /api/v1/streams/{task_id}`
_Close a stream_

Close an active stream.

**Path params:**
  - `task_id` `string` — 

**Query params:**
  - `reason` `string` [optional] — Close reason

**Responses:**
  - `204` Successful Response
  - `422` → `HTTPValidationError` Validation Error

### `GET /api/v1/streams/{task_id}/info`
_Get stream information_

Get information about an active stream.

**Path params:**
  - `task_id` `string` — 

**Responses:**
  - `200` → `StreamInfoResponse` Successful Response
  - `422` → `HTTPValidationError` Validation Error

