CREATE TABLE favorite_management (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL
);

INSERT INTO favorite_management (product_id, user_id) VALUES
(274, 440);