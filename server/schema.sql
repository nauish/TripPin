CREATE TABLE user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  destination VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC(10, 2) NOT NULL,
  type VARCHAR(100) NOT NULL,
  privacy int(3) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE attendee (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trip (id) ON DELETE CASCADE,
)

CREATE TABLE place (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  marker_type VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE trip_place (
  trip_id INTEGER NOT NULL,
  place_id INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  PRIMARY KEY (trip_id, place_id),
  FOREIGN KEY (trip_id) REFERENCES trip (id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES place (id) ON DELETE CASCADE
);

CREATE TABLE followed (
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  follow_date DATE NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES user (id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE saved_trip (
  user_id INTEGER NOT NULL,
  trip_id INTEGER NOT NULL,
  save_date DATE NOT NULL,
  PRIMARY KEY (user_id, trip_id),
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trip (id) ON DELETE CASCADE
);

CREATE TABLE chat_message (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  FOREIGN KEY (sender_id) REFERENCES user (id),
  FOREIGN KEY (trip_id) REFERENCES trip (id)
);

CREATE TABLE trip_comment (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  trip_id INTEGER,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user (id),
  FOREIGN KEY (trip_id) REFERENCES trip (id),
);
