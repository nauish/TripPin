  CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    photo VARCHAR(255) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

CREATE TABLE trips (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  destination VARCHAR(50),
  start_date DATE,
  end_date DATE,
  photo VARCHAR(255),
  budget NUMERIC(10, 2),
  type VARCHAR(100),
  privacy_setting VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE attendees (
  trip_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'attendee',
  PRIMARY KEY (trip_id, user_id),
  FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE places (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  trip_id BIGINT NOT NULL,
  tag VARCHAR(255),
  day_number INTEGER NOT NULL,
  start_hour TIME,
  end_hour TIME,
  name VARCHAR(100) NOT NULL,
  dnd_order INTEGER,
  address VARCHAR(255) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  marker_type VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL,
  budget INTEGER,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE saved_trips (
  user_id BIGINT NOT NULL,
  trip_id BIGINT NOT NULL,
  save_date DATE NOT NULL,
  PRIMARY KEY (user_id, trip_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (trip_id) REFERENCES trips (id)
);

CREATE TABLE trip_comments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  trip_id BIGINT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (trip_id) REFERENCES trips (id)
);

CREATE TABLE trip_comment_photos (
  id BIGSERIAL PRIMARY KEY,
  trip_comment_id BIGINT NOT NULL,
  photo VARCHAR(255) NOT NULL,
  FOREIGN KEY (trip_comment_id) REFERENCES trip_comments (id) ON DELETE CASCADE
);

CREATE TABLE checklists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  trip_id BIGINT NOT NULL REFERENCES trips(id) 
);

CREATE TABLE checklist_items (
  id SERIAL PRIMARY KEY, 
  name VARCHAR(100) NOT NULL, 
  item_order BIGINT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  checklist_id INT NOT NULL REFERENCES checklists(id)
);