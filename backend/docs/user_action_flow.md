User action flow overview
=========================

The following flows map end-user journeys to backend routes and the tables they
read or mutate. Each arrow (``-->``) represents a user action that invokes one or
more API endpoints; nested bullets expand conditional paths.

1. Account access and authentication
------------------------------------
```
Visitor opens app --> POST /auth/login
  --> if credentials invalid --> display error from InvalidPassword/UserNotFound
  --> if credentials valid --> receive access + refresh JWTs --> store tokens
        --> continue with authenticated navigation --> GET /users/me for profile bootstrap
            --> if 404/401 --> force logout and show login screen again
```
```
Visitor needs account --> POST /users/register
  --> if email exists --> surface duplicate email error
  --> if success --> new `user` row (role=client) --> redirect to login --> POST /auth/login
```
```
Forgot password CTA --> POST /users/forget-password
  --> if email not registered --> show error
  --> if success --> reset email sent --> user opens reset link --> POST /users/reset-password
        --> on success --> hashed password updated --> redirect to login
```
```
Authenticated session refreshing --> POST /auth/refresh with stored refresh token
  --> if token valid --> replace access token --> continue session seamlessly
  --> if token invalid/expired --> force re-authentication via login form
```
```
User wants to edit profile --> PUT /users/update
  --> if password change requested --> ensure confirm matches
  --> on success --> updated `user` row --> refresh local profile cache
```
```
Admin promotes client to lawyer --> PATCH /users/{id}/role
  --> if caller not admin --> show forbidden message
  --> if transition valid --> role changes to LAWYER --> update UI badges and access
```

2. Documentation consumption (clients, lawyers, admins)
-------------------------------------------------------
```
Authenticated user navigates to knowledge base --> GET /documentation/
  --> list rendered using presigned URLs --> user clicks document --> GET /documentation/{id}
        --> download/preview document via S3 URL
```
```
Admin wants to add resource --> POST /documentation/
  --> if file invalid --> show validation error
  --> on success --> `law_documentation` row + S3 upload --> list auto-refreshes
```
```
Admin edits document metadata --> PATCH /documentation/{id}
  --> update reflects immediately; if file replaced --> new S3 URL shared with clients
```
```
Admin removes outdated doc --> DELETE /documentation/{id}
  --> if deletion fails (S3 cleanup issue) --> show error
  --> on success --> remove from listing
```

3. Lawyer onboarding and profile management
-------------------------------------------
```
Client aspires to become lawyer --> prepare verification form --> POST /lawyer/verification-requests
  --> if pending request exists --> UI blocks resubmission
  --> if uploads succeed --> `lawyer_verification_request` row stored (status=pending)
        --> applicant lands on request history page --> GET /lawyer/verification-requests/me
            --> see timeline of submissions + statuses
```
```
Admin reviews submissions dashboard --> GET /lawyer/verification-requests (optional status filter)
  --> selects request --> GET /lawyer/verification-requests/{request_id}
        --> downloads documents via presigned URLs for manual review
```
```
Admin approves --> PATCH /lawyer/verification-requests/{id}/approve
  --> system promotes user role to LAWYER, seeds `lawyer_profile` row
  --> applicant notified --> frontend should refresh current user + profile views
```
```
Admin rejects --> PATCH /lawyer/verification-requests/{id}/reject
  --> rejection reason stored --> applicant sees message in request history
```
```
Admin rescinds lawyer role --> POST /lawyer/lawyers/{id}/revoke
  --> frontend should warn about cascading profile removal and request revocation
```
```
Lawyer views own profile --> GET /lawyer/profile/me
  --> if profile missing or caller not lawyer --> show forbidden prompt
```
```
Lawyer edits profile details --> PATCH /lawyer/profile/me
  --> on success --> `lawyer_profile` row updated --> refresh UI with latest info
```
```
Client or anonymous visitor views public profile --> GET /lawyer/profiles/{lawyer_id}
  --> display aggregated rating (via `lawyer_rating`) + availability cues
```

4. Schedule publication and booking lifecycle
---------------------------------------------
```
Lawyer manages availability -->
  Create slot: POST /booking/schedule (create_schedule_slot) --> new `lawyer_schedule_slot`
  View own slots: GET /booking/schedule/me (list_my_schedule)
  Edit slot: PATCH /booking/schedule/{slot_id} (update_schedule_slot)
  Delete slot: DELETE /booking/schedule/{slot_id}
  --> UI should prevent overlaps per ScheduleConflict errors
```
```
Client searches for available lawyers --> GET /booking/lawyers/{lawyer_id}/schedule (list_public_schedule)
  --> filter by lawyer profile and available slots --> proceed to booking request form
```
```
Client submits booking --> POST /booking/requests (create_booking_request)
  --> on success --> `booking_request` row pending --> redirect to request detail
        --> fetch detail via GET /booking/requests/{id}
        --> attachments uploaded stored in S3
```
```
Client monitors requests --> GET /booking/requests/me (list_my_requests)
  --> shows statuses (pending/accepted/declined)
```
```
Lawyer reviews incoming --> GET /booking/requests/incoming (list_incoming_requests)
  --> selects request --> GET /booking/requests/{id}
        --> Accept or decline via PATCH /booking/requests/{id}/decision (decide_booking_request)
            --> if accepted --> `case_history` row created (state=in_progress)
            --> if declined --> booking_request.status=declined; client notified
```
```
Lawyer updates case progress --> GET /booking/cases/{case_id} (get_case_history)
  --> edit via PATCH /booking/cases/{case_id} (update_case_history)
  --> add attachments via POST /booking/cases/{case_id}/attachments (add_case_attachment)
  --> maintain notes via PATCH /booking/cases/{case_id}/notes (update_case_notes)
  --> when work finished --> update state to COMPLETED --> set ending_time
```
```
Client reviews case list --> GET /booking/cases/me (list_my_cases)
  --> open detail --> GET /booking/cases/{case_id}
  --> if case completed and unrated --> display rating prompt --> POST /booking/cases/{case_id}/rating (rate_case)
        --> on success --> new `lawyer_rating` row --> lawyer profile averages refresh
```
```
Participants check case rating --> GET /booking/cases/{case_id}/rating (get_case_rating)
```

5. Real-time chat interactions
------------------------------
```
Authenticated user checks chat status --> GET /chat/health (optional)
```
```
User initiates conversation --> POST /chat/conversations
  --> backend prevents self-chat and duplicates --> either returns existing thread or creates
        --> store `chat_conversations` + `chat_participants`
  --> UI navigates to conversation detail --> GET /chat/conversations/{id}/messages (initial batch)
```
```
User lists conversations --> GET /chat/conversations
  --> display participants, last message summary (joined with `chat_messages`)
```
```
User joins websocket --> WEBSOCKET /chat/ws?token=<JWT>
  --> maintain live presence --> receive incoming events and receipts
```
```
Sending message --> POST /chat/conversations/{id}/messages
  --> on success --> append to history and broadcast via websocket --> update `chat_messages`
```
```
Uploading attachment --> POST /chat/conversations/{id}/attachments
  --> if size/type invalid --> show error
  --> else --> store in S3 + create message referencing attachment
```
```
Marking as read --> POST /chat/messages/{message_id}/ack with status=READ/DELIVERED
  --> updates `chat_message_receipts`
```

6. Legal AI assistant usage
---------------------------
```
Authenticated user opens AI assistant --> GET /legal-ai/health (optional ping for status)
```
```
User submits question --> POST /legal-ai/query
  --> backend responds with generated answer + citations --> UI threads messages
```

7. Admin oversight wrap-up
--------------------------
```
Admin dashboards combine:
  - GET /users/me (to confirm role)
  - GET /documentation/ for resource maintenance
  - Lawyer verification routes for compliance
  - Booking request and case endpoints for dispute resolution (same as above)
  - Chat routes for moderation tooling (view messages via list endpoints)
```
```
If admin needs to audit revoked lawyers --> consult `lawyer_role_revocation` entries retrieved via existing admin reporting queries (custom endpoints may be added later)
```