# Postgres is the only stateful service

Sessions, rate-limit counters, the job queue with its schedules, and the mail outbox all live in the one Postgres database beside the domain's tables. There is no Redis and no hosted queue. The auth library stores its sessions and its rate limits in Postgres; pg-boss keeps its queue in its own schema of the same database; the app's own rate limiter is a fixed-window counter table.

## Why

Traffic is a football group's. A second stateful service is a second backup, a second outage, a second bill and a second thing the operations session has to provide on any host. The decision is revisited only when a measurement asks for it.
