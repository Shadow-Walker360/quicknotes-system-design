# QuickNotes System Design

QuickNotes is a small API client and system-design project demonstrating how a browser application can communicate with a REST API and how the backend could be designed to support approximately 1 million users.

The front end uses the JSONPlaceholder practice API to demonstrate:

- GET requests for loading notes
- POST requests for creating notes
- DELETE requests for deleting notes
- Loading, success, error and empty states
- Client-side validation
- Disabled buttons during requests
- Safe rendering using `textContent`

The documentation describes the real QuickNotes service that a backend team could build.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
````

## How to Run

Clone the repository:

```bash
git clone https://github.com/Shadow-Walker360/quicknotes-system-design.git
```

Enter the project:

```bash
cd quicknotes-system-design
```

Because the project uses browser JavaScript and the Fetch API, it is best to run it through a local HTTP server.

With Python installed:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

Click **Load Notes** to request the first 10 notes from JSONPlaceholder.

## Documentation

* [API Design](docs/api-design.md)
* [Data Model](docs/data-model.md)
* [Architecture](docs/architecture.md)

## What I Learned

1. I learned how a browser client can use GET, POST and DELETE requests to communicate with a REST API.
2. I learned how relational database tables use primary keys, foreign keys and join tables to model relationships.
3. I learned how caching, load balancing and read replicas can help a system handle increasing traffic.
4. I learned how queues and workers allow expensive background operations to run asynchronously.
5. I learned how to estimate reads, writes and storage requirements before designing a scalable architecture.

```
