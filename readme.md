# DNS Server with Redis Caching

This project implements a lightweight **UDP DNS server** with **in-memory database** and  **Redis caching** , alongside a simple **Express API** for adding and retrieving DNS records.

---

## **Features**

* Handles **DNS queries** over UDP (`dgram`).
* Decodes and encodes packets using [`dns-packet`](https://www.npmjs.com/package/dns-packet).
* Stores records in an in-memory array (`localdb`) for quick access.
* **Caches responses** in Redis to improve performance.
* Provides an **Express API** to:
  * Add DNS records.
  * Retrieve all stored records.

---

## **UDP DNS Server Logic (`server.ts`)**

The DNS server workflow:

1. **Receive UDP packet** from client.
2. **Validate packet length** (must be at least 12 bytes).
3. **Decode DNS packet** using `dns-packet`.
4. **Search in localdb** for a matching record:
   * `name` — The queried domain.
   * `type` — Record type (e.g., `A`, `AAAA`, `MX`).
5. **Check Redis cache** :

* If found, return cached response.

1. **Build DNS response** with:
   * Question section (original query).
   * Answer section (IP address or relevant data).
2. **Send response to client** and cache it in Redis.

---

## **Redis Caching**

* Keys are JSON strings containing `{ name, type }`.
* Values are binary DNS responses (encoded via `dns-packet`).
* This reduces repeated processing for frequently queried domains.

---

## **Dependencies**

* [`dgram`]() — UDP networking.
* [`dns-packet`](https://www.npmjs.com/package/dns-packet) — DNS packet encoding/decoding.
* [`express`]() — HTTP API server.
* [`redis`](https://www.npmjs.com/package/redis) — Caching layer.

---

## **Example DNS Query**

Using `dig`:

```
dig @127.0.0.1 -p 41234 example.com
```

Expected output (if record exists):

```
example.com.    300    IN    A    127.0.0.1
```
