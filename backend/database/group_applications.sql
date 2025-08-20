CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE group_applications (
    application_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    applicant_id INT NOT NULL,
    message TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);