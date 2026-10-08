# QuickNotes Architecture

## Functional Requirements

1. Users can register and authenticate.
2. Authenticated users can create notes.
3. Users can view their notes.
4. Users can update notes.
5. Users can delete notes.
6. Users can organise notes using tags.
7. The system provides a REST API.
8. The system returns useful HTTP status codes and error messages.

## Non-Functional Requirements

1. The system should remain available during individual server failures.
2. API requests should have low latency.
3. The system should scale to approximately 1 million users.
4. Database reads should scale independently from writes.
5. User data must be protected through authentication and authorization.
6. The system should support monitoring, logging and backups.
7. Background work should not block normal API requests.

## Load Estimate

Assumptions:

- 1,000,000 registered users.
- 10% are active each day = 100,000 daily active users.
- Each active user reads their notes 20 times per day.
- Each active user creates 1 note per day.
- Each note averages 2 KB including its text and metadata.
- One year contains 365 days.
- Peak traffic is estimated at 5× average traffic.

### Reads Per Second

```text
100,000 users × 20 reads/day
= 2,000,000 reads/day

2,000,000 ÷ 86,400
≈ 23.15 reads/second
````

Peak:

```text
23.15 × 5
≈ 115.75 reads/second
```

Therefore, the system should support approximately **23 reads/second average and 116 reads/second peak**.

### Writes Per Second

```text
100,000 users × 1 note/day
= 100,000 writes/day

100,000 ÷ 86,400
≈ 1.16 writes/second
```

Peak:

```text
1.16 × 5
≈ 5.79 writes/second
```

Therefore, the system should support approximately **1.16 writes/second average and 5.8 writes/second peak**.

### Storage Per Year

```text
100,000 notes/day × 2 KB
= 200,000 KB/day
= 200 MB/day

200 MB × 365
= 73,000 MB
≈ 73 GB/year
```

The estimate is approximately **73 GB of new note data per year**, excluding indexes, backups, replication and other infrastructure data.

## Architecture Diagram

```text
                         ┌──────────────┐
                         │   Clients    │
                         │ Web / Mobile │
                         └──────┬───────┘
                                |
                                v
                         ┌──────────────┐
                         │     DNS      │
                         └──────┬───────┘
                                |
                                v
                         ┌──────────────┐
                         │     CDN      │
                         └──────┬───────┘
                                |
                                v
                       ┌──────────────────┐
                       │  Load Balancer   │
                       └────────┬─────────┘
                                |
                 ┌──────────────┼──────────────┐
                 |              |              |
                 v              v              v
           ┌───────────┐  ┌───────────┐  ┌───────────┐
           │ App Server│  │ App Server│  │ App Server│
           │     1     │  │     2     │  │     3     │
           └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                 |              |              |
                 └──────────────┼──────────────┘
                                |
                       ┌────────┴────────┐
                       |                 |
                       v                 v
                 ┌──────────┐     ┌──────────────┐
                 │  Cache   │     │   Primary    │
                 │  Redis   │     │   Database   │
                 └──────────┘     └──────┬───────┘
                                        |
                                        | Replication
                                        v
                                  ┌──────────────┐
                                  │ Read Replica │
                                  └──────────────┘


             Background Jobs
                    |
                    v
               ┌─────────┐
               │  Queue  │
               └────┬────┘
                    |
                    v
               ┌─────────┐
               │ Worker  │
               └─────────┘
```

## Component Responsibilities

### Client

The client provides the user interface and sends API requests to the service.

### DNS

DNS converts the public QuickNotes domain into the network endpoint used by clients.

### CDN

The CDN caches and serves static assets close to users, reducing latency and origin traffic.

### Load Balancer

The load balancer distributes requests across multiple app servers and removes unhealthy servers from rotation.

### App Servers

App servers execute authentication, authorization and application logic for API requests.

### Cache

The cache stores frequently accessed data so repeated reads do not always reach the database.

### Primary Database

The primary database stores authoritative application data and handles writes.

### Read Replica

The read replica handles database read traffic, reducing load on the primary database.

### Queue

The queue stores background jobs reliably until a worker can process them.

### Worker

The worker performs background operations without making users wait for them during API requests.

## GET /notes Flow

1. The client sends `GET /notes`.
2. DNS resolves the QuickNotes domain.
3. The request reaches the CDN.
4. If the requested resource is not suitable for CDN caching, the request continues to the load balancer.
5. The load balancer selects a healthy app server.
6. The app server authenticates the user and checks authorization.
7. The app server checks the cache for the requested notes.
8. If the data is cached, it is returned without querying the database.
9. If there is a cache miss, the app server queries the read replica.
10. The result is placed in the cache.
11. The app server returns the notes to the client.

## POST /notes Flow

1. The client sends `POST /notes` with the note data.
2. DNS resolves the QuickNotes domain.
3. The request reaches the load balancer.
4. The load balancer selects a healthy app server.
5. The app server authenticates and authorizes the user.
6. The server validates the title and body.
7. The note is written to the primary database.
8. Any required background work is placed on the queue.
9. Relevant cached data is invalidated or updated.
10. The server returns `201 Created` with the new note.
11. Database replication eventually makes the new data available to the read replica.

## Trade-offs

### Cache Performance vs Data Freshness

Caching reduces database load and improves response times, but cached data can become stale. QuickNotes should use appropriate expiration times and invalidate affected cache entries after writes.

### Read Replicas vs Consistency

Read replicas allow the application to handle more reads, but replication can introduce eventual consistency. Immediately after creating a note, a user may temporarily receive older data from a replica.

### More App Servers vs Infrastructure Cost

Running multiple app servers prevents one server from becoming a bottleneck or single point of failure, but it increases infrastructure costs.

### Queue vs Immediate Processing

A queue allows expensive background work to happen asynchronously, but queued jobs introduce additional system complexity and may not complete immediately.

## Avoiding Single Points of Failure

The architecture avoids single points of failure by running multiple app servers behind a load balancer, using replicated database infrastructure with a read replica, deploying redundant cache instances where required, and using a durable queue with worker redundancy. DNS and CDN services should also use highly available managed infrastructure. Health checks allow unhealthy application servers to be removed from traffic automatically.

```

