-- Create pass_verifications table
CREATE TABLE IF NOT EXISTS pass_verifications (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    pass_id uuid NOT NULL,
    student_id uuid NOT NULL,
    verification_count INTEGER DEFAULT 1,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pass_verifications_pkey PRIMARY KEY (id),
    CONSTRAINT pass_verifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT pass_verifications_unique_pass_student UNIQUE(pass_id, student_id)
);

CREATE INDEX idx_pass_verifications_student_id ON pass_verifications USING btree (student_id);
CREATE INDEX idx_pass_verifications_pass_id ON pass_verifications USING btree (pass_id);

-- Add trigger for updated_at
CREATE TRIGGER set_pass_verifications_updated_at
    BEFORE UPDATE ON pass_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 