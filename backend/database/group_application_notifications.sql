-- PostgreSQL Conversion
-- Note: The table name 'group_application_notifications' is not a reserved keyword and does not require quotes.

CREATE TABLE group_application_notifications (
    notification_id SERIAL PRIMARY KEY,
    application_id INT NOT NULL,
    recipient_id INT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);