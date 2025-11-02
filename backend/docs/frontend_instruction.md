Frontend integration checklist based on user action flows
=======================================================

This guide pairs each user journey with the exact API contracts—HTTP method,
expected headers, body payloads, query/path parameters, and notable responses—so
frontend engineers can wire UI states directly to backend routes described in
`user_action_flow.txt`.

Formatting legend
-----------------
* **Endpoint** `METHOD /path` — call sequence label.
* **Auth** — bearer token or unauthenticated.
* **Request** — encoding plus required/optional parameters.
* **Success** — key fields returned on success.
* **Errors** — backend exceptions or HTTP codes the UI should surface.

1 Account access and authentication
------------------------------------

### 1.1 Login and bootstrap current user
- **Endpoint** `POST /auth/login`
  - **Auth**: none (public).
  - **Request**: `application/x-www-form-urlencoded`
    - `username` (string, required) — user email entered in login form.
    - `password` (string, required).
    - Optional OAuth2 form extras sent automatically by most clients:
      `grant_type`, `scope`, `client_id`, `client_secret` (leave blank).
  - **Success**: `{ "access_token", "refresh_token", "token_type" }`.
  - **Errors**: `400 InvalidPassword`, `404 UserNotFound`.
- **Endpoint** `GET /users/me`
  - **Auth**: `Authorization: Bearer <access_token>`.
  - **Request**: none.
  - **Success**: current user profile `UserResponse`.
  - **Errors**: `401 NotAuthenticated` (expired token) — trigger logout + login form.

### 1.2 Registration then login
- **Endpoint** `POST /users/register`
  - **Auth**: none.
  - **Request**: `application/json`
    - `username` (string, required).
    - `email` (string, required).
    - `password` (string, required).
  - **Success**: newly created `UserResponse` (role defaults to CLIENT).
  - **Errors**: `409 UserEmailExist`.
- **Endpoint** `POST /auth/login` — reuse credentials, same payload as 1.1.

### 1.3 Forgot/reset password
- **Endpoint** `POST /users/forget-password`
  - **Auth**: none.
  - **Request**: `application/json` `{ "email": "user@example.com" }`.
  - **Success**: `{ "message": "Reset email sent" }` (no token change).
  - **Errors**: `404 UserNotFound`.
- **Endpoint** `POST /users/reset-password`
  - **Auth**: none (link-protected).
  - **Request**:
    - Query parameter `token` (string) from reset URL.
    - JSON body `{ "new_password": "...", "confirm_password": "..." }`.
  - **Success**: updated `UserResponse`.
  - **Errors**: `400 InvalidPasswordMatch`, `401 Invalid or expired token`, `404 UserNotFound`.

### 1.4 Refresh token flow
- **Endpoint** `POST /auth/refresh`
  - **Auth**: none (uses refresh token).
  - **Request**: query string `?refresh_token=<refresh JWT>`.
  - **Success**: `{ "access_token", "token_type" }`.
  - **Errors**: `401 NotAuthenticated`, `400 InvalidToken`.

### 1.5 Profile update
- **Endpoint** `PUT /users/update`
  - **Auth**: bearer required.
  - **Request**: JSON with any of the optional keys:
    - `username`, `password`, `phone_number`, `address`.
  - **Success**: updated `UserResponse` (refresh local profile cache after save).
  - **Errors**: `404 UserNotFound`, validation errors on blank strings.

### 1.6 Role promotion (admin only)
- **Endpoint** `PATCH /users/{user_id}/role`
  - **Auth**: bearer (admin).
  - **Path**: `{user_id}` UUID of target user.
  - **Request**: JSON `{ "role": "LAWYER" }`.
  - **Success**: target `UserResponse` with new role.
  - **Errors**: `403 UnauthorizedRoleUpdate`, `400 InvalidRoleTransition`, `404 UserNotFound`.

2 Documentation consumption and management
-------------------------------------------

### 2.1 Browse documents
- **Endpoint** `GET /documentation/`
  - **Auth**: bearer recommended but not enforced (returns all docs).
  - **Success**: array of `DocumentationResponse` objects (`id`, `display_name`, `file_url`, etc.).
- **Endpoint** `GET /documentation/{document_id}`
  - **Auth**: none.
  - **Path**: `document_id` (UUID string).
  - **Success**: single `DocumentationResponse` with presigned `file_url`.

### 2.2 Upload new document (admin)
- **Endpoint** `POST /documentation/`
  - **Auth**: admin bearer.
  - **Request**: `multipart/form-data`
    - `display_name` (string, required).
    - `document` (file, required, PDF only).
  - **Success**: `DocumentationCreateResponse` (`id`, `file_url`).
  - **Errors**: `400 DocumentationInvalidFile`, `500 DocumentationUploadFailed`.

### 2.3 Update document metadata / file (admin)
- **Endpoint** `PATCH /documentation/{document_id}`
  - **Auth**: admin bearer.
  - **Request**: `multipart/form-data` allowing optional fields:
    - `display_name` (string) to rename.
    - `document` (file) to replace asset (PDF enforced).
  - **Success**: refreshed `DocumentationResponse`.

### 2.4 Delete document (admin)
- **Endpoint** `DELETE /documentation/{document_id}`
  - **Auth**: admin bearer.
  - **Success**: empty body (`204 No Content`).
  - **Errors**: `404 DocumentationNotFound`, `500 DocumentationDeletionFailed` (surface message).

3 Lawyer onboarding and profile management
-------------------------------------------

### 3.1 Submit verification request (client -> lawyer)
- **Endpoint** `POST /lawyer/verification-requests`
  - **Auth**: client bearer.
  - **Request**: `multipart/form-data`
    - Files (all required): `identity_card_front`, `identity_card_back`, `portrait`,
      `law_certificate`, `bachelor_degree`.
    - Fields: `years_of_experience` (integer >= 0),
      `current_job_position` (string, optional, <= 255 chars).
  - **Success**: `RequestDetailResponse` (IDs + presigned document URLs).
  - **Errors**: `409 RequestAlreadyExists`, `403 RequestRoleForbidden`, file validation errors.

### 3.2 Track own requests
- **Endpoint** `GET /lawyer/verification-requests/me`
  - **Auth**: bearer (applicant).
  - **Success**: list of `RequestSummaryResponse` objects.

### 3.3 Admin review workflow
- **Endpoint** `GET /lawyer/verification-requests?status=<optional>`
  - **Auth**: admin bearer.
  - **Query**: `status` filter (e.g., `pending`, `approved`, `rejected`).
- **Endpoint** `GET /lawyer/verification-requests/{request_id}`
  - **Auth**: admin bearer.
  - **Path**: `request_id` UUID.
  - **Success**: `RequestDetailResponse` with presigned document links.
- **Endpoint** `PATCH /lawyer/verification-requests/{id}/approve`
  - **Auth**: admin bearer.
  - **Success**: approved `RequestDetailResponse`; also triggers role + profile creation.
- **Endpoint** `PATCH /lawyer/verification-requests/{id}/reject`
  - **Auth**: admin bearer.
  - **Request**: JSON `{ "rejection_reason": "string" }`.

### 3.4 Manage lawyer role lifecycle
- **Endpoint** `POST /lawyer/lawyers/{user_id}/revoke`
  - **Auth**: admin bearer.
  - **Path**: `user_id` of lawyer to revoke.
  - **Request**: JSON `{ "reason": "string" }` (see length constraints in schema).
  - **Success**: `LawyerRoleRevocationResponse`.

### 3.5 Lawyer profile APIs
- **Endpoint** `GET /lawyer/profile/me`
  - **Auth**: lawyer bearer.
- **Endpoint** `PATCH /lawyer/profile/me`
  - **Auth**: lawyer bearer.
  - **Request**: JSON with optional keys
    `display_name`, `phone_number`, `website_url`, `office_address`,
    `speaking_languages` (array of strings), `education`, `current_level`,
    `years_of_experience` (int).
  - **Success**: updated `LawyerProfileResponse`.
- **Endpoint** `GET /lawyer/profiles/{lawyer_id}` (public)
  - **Path**: `lawyer_id` UUID.
  - **Success**: public profile with rating aggregate.

4 Schedule publication and booking lifecycle
---------------------------------------------

### 4.1 Lawyer schedule management
- **Endpoint** `POST /booking/schedule`
  - **Auth**: lawyer bearer.
  - **Request**: JSON `{ "start_time": ISO8601, "end_time": ISO8601 }`.
  - **Success**: `ScheduleSlotResponse`.
- **Endpoint** `GET /booking/schedule/me`
  - **Auth**: lawyer bearer.
- **Endpoint** `PATCH /booking/schedule/{slot_id}`
  - **Auth**: lawyer bearer.
  - **Path**: `slot_id` UUID.
  - **Request**: JSON same as creation.
- **Endpoint** `DELETE /booking/schedule/{slot_id}`
  - **Auth**: lawyer bearer.

### 4.2 Client browsing availability
- **Endpoint** `GET /booking/lawyers/{lawyer_id}/schedule`
  - **Auth**: optional bearer.
  - **Path**: `lawyer_id` UUID.
  - **Success**: open slots (unbooked only).

### 4.3 Booking request submission
- **Endpoint** `POST /booking/requests`
  - **Auth**: client bearer.
  - **Request**: `multipart/form-data`
    - Fields: `lawyer_id` (UUID string), `title` (string),
      `short_description` (string),
      `desired_start_time` (ISO8601), `desired_end_time` (ISO8601).
    - File: optional `attachment` (any allowed content type per booking settings).
  - **Success**: `BookingRequestCreateResponse` (includes `attachment_url`).

### 4.4 Booking tracking & decisioning
- **Endpoint** `GET /booking/requests/me` (client bearer).
- **Endpoint** `GET /booking/requests/incoming` (lawyer bearer).
- **Endpoint** `GET /booking/requests/{id}` (auth: client/lawyer/admin involved).
- **Endpoint** `PATCH /booking/requests/{id}/decision`
  - **Auth**: lawyer bearer.
  - **Request**: JSON `{ "accept": true|false }`.
  - **Success**: `BookingDecisionResponse` with booking summary and optional `case`.

### 4.5 Case management & collaboration
- **Endpoint** `GET /booking/cases/me`
  - **Auth**: bearer (lawyer sees lawyer cases, client sees client cases).
- **Endpoint** `GET /booking/cases/{case_id}`
  - **Auth**: bearer (participant or admin).
- **Endpoint** `PATCH /booking/cases/{case_id}`
  - **Auth**: lawyer bearer.
  - **Request**: JSON with optional keys
    `title`, `description`, `state` (`COMPLETED` | `CANCELLED`).
- **Endpoint** `PATCH /booking/cases/{case_id}/notes`
  - **Auth**: bearer.
  - **Request**: JSON `{ "lawyer_note": str | null, "client_note": str | null }` (role-specific fields applied).
- **Endpoint** `POST /booking/cases/{case_id}/attachments`
  - **Auth**: bearer.
  - **Request**: `multipart/form-data` with file field `attachment`.
  - **Success**: updated `CaseHistoryResponse` with new `attachment_urls`.
- **Endpoint** `POST /booking/cases/{case_id}/rating`
  - **Auth**: client bearer.
  - **Request**: JSON `{ "stars": 1-5 }`.
- **Endpoint** `GET /booking/cases/{case_id}/rating`
  - **Auth**: bearer (participant or admin).

5 Real-time chat interactions
------------------------------

### 5.1 Conversation lifecycle
- **Endpoint** `POST /chat/conversations`
  - **Auth**: bearer.
  - **Request**: JSON `{ "recipient_id": "<UUID>" }`.
  - **Success**: `ChatConversationResponse` including participants and last message summary.
- **Endpoint** `GET /chat/conversations`
  - **Auth**: bearer.
  - **Success**: list of conversations for current user.
- **Endpoint** `GET /chat/conversations/{conversation_id}/messages`
  - **Auth**: bearer.
  - **Path**: conversation UUID.
  - **Query (optional)**: `limit` (int, default 50), `before` (ISO timestamp) for pagination.
  - **Success**: chronological list of `ChatMessageResponse`.

### 5.2 Messaging
- **Endpoint** `POST /chat/conversations/{conversation_id}/messages`
  - **Auth**: bearer.
  - **Request**: JSON `{ "content": "..." }` (must be non-empty after trim).
- **Endpoint** `POST /chat/conversations/{conversation_id}/attachments`
  - **Auth**: bearer.
  - **Request**: `multipart/form-data`
    - File field `file` (respect size/type limits from settings).
    - Optional `caption` string.
- **Endpoint** `POST /chat/messages/{message_id}/ack`
  - **Auth**: bearer.
  - **Request**: JSON `{ "status": "delivered" | "read" }`.

### 5.3 Websocket session
- **Endpoint** `WEBSOCKET /chat/ws`
  - **Auth**: query parameter `token=<access JWT>`.
  - **Usage**: establish socket after login; send/receive JSON events for `message`, `receipt`, `presence` updates.

6 Legal AI assistant usage
---------------------------

- **Endpoint** `GET /legal-ai/health`
  - **Auth**: bearer recommended (same token as rest of app).
  - **Success**: uptime diagnostics.
- **Endpoint** `POST /legal-ai/query`
  - **Auth**: bearer.
  - **Request**: JSON `{ "question": "...", "session_id": "<UUID>" }` (session_id optional; backend will default if omitted).
  - **Success**: `LegalAIResponse` with answer, citations, suggestions, etc.

7 Admin oversight touchpoints
------------------------------

Combine the above endpoints depending on dashboard view:
- Use `GET /users/me` to verify admin role before rendering protected modules.
- For documentation, lawyer verification, booking, and chat moderation, reuse the
  admin-only endpoints listed earlier; ensure every request carries the admin's
  bearer token and renders backend validation messages (e.g., revocation
  reasons, rejection_reason strings) to staff users.

Implementation reminders
------------------------
- All bearer-protected calls require `Authorization: Bearer <access_token>`.
- Multipart requests must set `Content-Type: multipart/form-data` with correct
  field names exactly as listed.
- Date/time fields use ISO 8601 strings (UTC) compatible with JavaScript
  `Date.toISOString()`.
- When uploading files, preserve original filenames so S3 keys remain user
  friendly.
- Surface backend error messages to guide user correction (e.g., duplicate email
  or invalid schedule range).