# QuickNotes Data Model

## Entities

### Users

Stores registered QuickNotes users.

| Column | Type | Key |
|---|---|---|
| id | INTEGER | Primary Key |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE, NOT NULL |
| created_at | TEXT | NOT NULL |

### Notes

Stores notes created by users.

| Column | Type | Key |
|---|---|---|
| id | INTEGER | Primary Key |
| user_id | INTEGER | Foreign Key |
| title | TEXT | NOT NULL |
| body | TEXT | |
| created_at | TEXT | NOT NULL |
| updated_at | TEXT | NOT NULL |

### Tags

Stores reusable tags.

| Column | Type | Key |
|---|---|---|
| id | INTEGER | Primary Key |
| name | TEXT | UNIQUE, NOT NULL |

### Note Tags

Join table connecting notes and tags.

| Column | Type | Key |
|---|---|---|
| note_id | INTEGER | Foreign Key |
| tag_id | INTEGER | Foreign Key |

The combination of `note_id` and `tag_id` is the primary key.

## Relationships

One user can have many notes, so `users` to `notes` is a **one-to-many** relationship.

One note can have many tags and one tag can belong to many notes. Therefore, `notes` and `tags` have a **many-to-many** relationship.

The `note_tags` join table is required to represent this many-to-many relationship.

## CREATE TABLE Statements

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,

    PRIMARY KEY (note_id, tag_id),

    FOREIGN KEY (note_id) REFERENCES notes(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
````

## Example Queries

### 1. Get all notes belonging to a user

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 7
ORDER BY created_at DESC;
```

### 2. Get notes with a particular tag

```sql
SELECT notes.id, notes.title, notes.body
FROM notes
JOIN note_tags
    ON notes.id = note_tags.note_id
JOIN tags
    ON tags.id = note_tags.tag_id
WHERE tags.name = 'school';
```

### 3. Count notes belonging to each user

```sql
SELECT
    users.name,
    COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes
    ON users.id = notes.user_id
GROUP BY users.id, users.name;
```

## Index

An index should be created on `notes.user_id` because a common operation is retrieving all notes belonging to a particular user.

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

This allows the database to find a user's notes more efficiently as the table grows.

## SQL or NoSQL?

I would choose **SQL** for QuickNotes because the system has clear relationships between users, notes and tags. Users own notes, while notes and tags have a many-to-many relationship through `note_tags`. SQL provides foreign keys, constraints, transactions, JOINs and reliable data integrity, making it a better fit for this structured system than a NoSQL database.

```

