Database Overview
==================

Database name
-------------
The application uses a PostgreSQL database whose name is provided through the
`POSTGRES_DB` environment variable (see `.env.example`). All tables described
below live in that database.

Base columns
------------
Every ORM model inherits from `src.core.base_model.Base`, which contributes the
following columns to each table:

* `id` (UUID, primary key, indexed) – automatically generated with `uuid4`.
* `create_at` (timestamptz) – defaults to the current UTC time when the row is
  inserted.
* `updated_at` (timestamptz) – defaults to the current UTC time and updates on
  each modification.

Tables
------

`user`
~~~~~~
Represents platform accounts.

* `username` (varchar(50), required).
* `email` (varchar(50), required, unique, indexed).
* `hashed_password` (varchar(255), required).
* `phone_number` (varchar(20), optional, unique).
* `address` (varchar(200), optional).
* `role` (varchar(20), required, defaults to `client`).
* `is_email_verified` (boolean, required, defaults to `true`).
* `email_verification_sent_at` (timestamptz, optional).

`lawyer_verification_request`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Stores the documents a lawyer submits for verification.

* `user_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `identity_card_front_url` (varchar(255), required).
* `identity_card_back_url` (varchar(255), required).
* `portrait_url` (varchar(255), required).
* `law_certificate_url` (varchar(255), required).
* `bachelor_degree_url` (varchar(255), required).
* `years_of_experience` (integer, required).
* `current_job_position` (varchar, optional).
* `status` (varchar(20), required, defaults to `pending`).
* `rejection_reason` (varchar(500), optional).
* `reviewed_by_admin_id` (UUID, optional) – foreign key to `user.id`,
  `ON DELETE SET NULL`.
* `reviewed_at` (timestamptz, optional).

`lawyer_profile`
~~~~~~~~~~~~~~~~
Holds the public profile metadata for a verified lawyer. Each lawyer has at
most one profile.

* `user_id` (UUID, required, unique) – foreign key to `user.id`,
  `ON DELETE CASCADE`.
* `display_name` (varchar, required).
* `phone_number` (varchar, optional).
* `website_url` (varchar, optional).
* `office_address` (varchar, optional).
* `speaking_languages` (text[] with mutable tracking, required, defaults to
  empty list).
* `education` (varchar, optional).
* `current_level` (varchar, optional).
* `years_of_experience` (integer, required, defaults to 0).

`lawyer_role_revocation`
~~~~~~~~~~~~~~~~~~~~~~~~
Captures audit entries when an admin revokes a lawyer role.

* `user_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `revoked_by_admin_id` (UUID, optional) – foreign key to `user.id`,
  `ON DELETE SET NULL`.
* `reason` (varchar, required).

`law_documentation`
~~~~~~~~~~~~~~~~~~~
Metadata for legal documents uploaded by admins and stored in S3.

* `display_name` (varchar(255), required).
* `s3_key` (varchar(255), required, unique) – location of the file in S3.
* `original_filename` (varchar(255), required).
* `content_type` (varchar(100), required).
* `uploaded_by_id` (UUID, optional) – foreign key to `user.id`,
  `ON DELETE SET NULL`.

`lawyer_schedule_slot`
~~~~~~~~~~~~~~~~~~~~~~
Represents availability blocks a lawyer manages.

* `lawyer_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `start_time` (timestamptz, required).
* `end_time` (timestamptz, required).
* `is_booked` (boolean, required, defaults to `false`).

`booking_request`
~~~~~~~~~~~~~~~~~
Stores meeting requests initiated by clients.

* `client_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `lawyer_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `schedule_slot_id` (UUID, optional) – foreign key to
  `lawyer_schedule_slot.id`, `ON DELETE SET NULL`.
* `title` (varchar(200), required).
* `short_description` (varchar(1000), required).
* `desired_start_time` (timestamptz, required).
* `desired_end_time` (timestamptz, required).
* `attachment_key` (varchar(255), optional) – S3 reference to the uploaded
  supporting file.
* `status` (varchar(20), required, defaults to `pending`).
* `decision_at` (timestamptz, optional).

`case_history`
~~~~~~~~~~~~~~
Represents accepted bookings and tracks ongoing work.

* `booking_request_id` (UUID, optional) – foreign key to `booking_request.id`,
  `ON DELETE SET NULL`.
* `lawyer_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `client_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `title` (varchar(200), required).
* `description` (text, optional).
* `state` (varchar(20), required, defaults to `in_progress`).
* `attachment_keys` (text[] with mutable tracking, required, defaults to empty
  list) – stores S3 keys for case files.
* `lawyer_note` (varchar(2000), optional).
* `client_note` (varchar(2000), optional).
* `started_at` (timestamptz, required, defaults to `now()`).
* `ending_time` (timestamptz, optional) – set when the case is completed or
  cancelled.

`lawyer_rating`
~~~~~~~~~~~~~~~
Persists client feedback after a case is completed. Each case can have at most
one rating because of the unique constraint on `case_history_id`.

* `case_history_id` (UUID, required, unique) – foreign key to
  `case_history.id`, `ON DELETE CASCADE`.
* `lawyer_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `client_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`.
* `stars` (integer, required) – the 1–5 star score given by the client.

`chat_conversations`
~~~~~~~~~~~~~~~~~~~~
Top-level thread for user-to-user messaging.

* `last_message_at` (timestamptz, optional).

`chat_participants`
~~~~~~~~~~~~~~~~~~~
Membership table linking users to conversations. A unique constraint prevents a
user from joining the same conversation twice.

* `conversation_id` (UUID, required) – foreign key to `chat_conversations.id`,
  `ON DELETE CASCADE`, indexed.
* `user_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`,
  indexed.
* `last_read_at` (timestamptz, optional).
* Unique constraint `uq_chat_participant_membership` on
  (`conversation_id`, `user_id`).

`chat_messages`
~~~~~~~~~~~~~~~
Stores individual messages.

* `conversation_id` (UUID, required) – foreign key to `chat_conversations.id`,
  `ON DELETE CASCADE`, indexed.
* `sender_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`,
  indexed.
* `content` (text, optional).
* `attachment_name` (varchar(255), optional).
* `attachment_key` (varchar(512), optional).
* `attachment_content_type` (varchar(100), optional).
* `attachment_size` (integer, optional).

`chat_message_receipts`
~~~~~~~~~~~~~~~~~~~~~~~
Tracks delivery and read receipts per recipient. A unique constraint ensures a
single receipt per message/user combination.

* `message_id` (UUID, required) – foreign key to `chat_messages.id`,
  `ON DELETE CASCADE`, indexed.
* `user_id` (UUID, required) – foreign key to `user.id`, `ON DELETE CASCADE`,
  indexed.
* `delivered_at` (timestamptz, optional).
* `read_at` (timestamptz, optional).
* Unique constraint `uq_chat_message_receipt` on (`message_id`, `user_id`).