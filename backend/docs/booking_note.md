Booking module endpoint overview
================================

1. Client sends booking request
   - Endpoint: POST /booking/requests (create_booking_request)
   - Validates desired schedule against LawyerScheduleSlot availability via find_available_slot.
   - Stores optional attachment on S3 using upload_attachment and reserves the schedule slot.

2. Lawyer reviews booking request
   - Endpoint: GET /booking/requests/incoming (list_incoming_requests) exposes pending/processed requests.
   - Endpoint: POST /booking/requests/{booking_id}/decision (decide_booking_request) allows lawyer to accept or decline.
     * Acceptance locks the selected slot, creates a CaseHistory record, and mirrors attachments.
     * Decline frees the schedule slot for future bookings.

3. Lawyer schedule management
   - Endpoint: POST /booking/schedule (create_schedule_slot) creates availability windows.
   - Endpoint: PATCH /booking/schedule/{slot_id} (update_schedule_slot) adjusts unbooked slots.
   - Endpoint: DELETE /booking/schedule/{slot_id} (delete_schedule_slot) removes unused slots.
   - Endpoint: GET /booking/schedule/me (list_my_schedule) gives lawyers a management view.
   - Endpoint: GET /booking/lawyers/{lawyer_id}/schedule (list_public_schedule) exposes free slots to clients.

4. Case history access and maintenance after acceptance
   - Endpoint: GET /booking/cases/me and GET /booking/cases/{case_id} expose case histories to both parties.
   - Endpoint: PATCH /booking/cases/{case_id} (update_case_history) lets the lawyer edit title/description and close the case.
   - Endpoint: PATCH /booking/cases/{case_id}/notes (update_case_notes) allows each party to manage their own notes.
   - Endpoint: POST /booking/cases/{case_id}/attachments (add_case_attachment) stores additional evidence files.

5. Ratings after case completion
   - Endpoint: POST /booking/cases/{case_id}/rating (rate_case) lets the client submit 1-5 star feedback for completed cases.
   - Endpoint: GET /booking/cases/{case_id}/rating (get_case_rating) returns the existing rating to authorised participants.

Supporting utilities and guarantees
-----------------------------------
- Slot overlap detection and availability enforcement rely on slot_overlaps and find_available_slot.
- Attachment handling (build_booking_attachment_key, build_case_attachment_key, upload_attachment, generate_attachment_url, delete_attachment) keeps evidence in S3.
- calculate_lawyer_rating aggregates LawyerRating data so lawyer profiles display current averages.
- Exceptions in src/booking/exceptions.py describe when operations are rejected (e.g. ScheduleConflict, BookingAlreadyReviewed, RatingNotAllowed) and are thrown directly from route handlers when requirements are violated.