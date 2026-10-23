# 🎬 3-Minute Video Demonstration Script
## BACSE344 — Cloud Infrastructure and Architecture (Digital Assignment 3)
**Domain:** Campus Dining & Hostel Mess Feedback System (MessHub)  
**Target Video Duration:** Exactly 3 Minutes (180 Seconds)  

---

## ⏱️ Timeline & Screen Walkthrough

### 0:00 – 0:25 | Introduction & Peak-Demand Scenario (Q1a)
- **Screen:** Open browser at `http://localhost`. Show the MessHub home page in dark glassmorphism.
- **Narration:**
  > "Hello Professor and Evaluators, this is the demonstration of Digital Assignment 3 for Cloud Infrastructure and Architecture, slot C1. Our application is MessHub, a campus mess and feedback system for residential university students.
  > In Question 1(a), our realistic peak-demand situation is the Dinner Rush between 8:30 PM and 9:15 PM, where thousands of residential students simultaneously check tomorrow's menu and submit feedback ratings. The hardest-hit API is `GET /api/menu`.
  > To handle this without downtime, we configured three backend instances using Docker Compose behind an Nginx load balancer on port 80, connected to our MongoDB Atlas cloud database."

---

### 0:25 – 0:55 | Round-Robin Load Distribution & k6 Benchmark (Q1a & Q1b)
- **Screen:** In Admin Portal, scroll to the **Cluster Load Distribution (Q1)** card.
- **Action:** Click the button **"Send 6 Requests (Test Round-Robin)"**.
- **Observation:** Notice the hit counters on `backend-instance-1`, `backend-instance-2`, and `backend-instance-3` increment sequentially and glow orange. Show the terminal output.
- **Action:** Click **"View k6 Benchmark Results"**. Show the benchmark table.
- **Narration:**
  > "Here, our Nginx load balancer distributes requests sequentially across `backend-instance-1`, `backend-instance-2`, and `backend-instance-3`, verified by the `X-Served-By` response header.
  > In Question 1(b), we load-tested the API with 1,000 requests using k6 under 20 concurrent virtual users. With 3 instances, our throughput increased to 96.17 requests per second, median response time dropped by 21.8% from 104 ms to 81 ms, and worst-case queuing delays reduced from 8.17 seconds down to 1.33 seconds—an 83.7% latency reduction!"

---

### 0:55 – 1:25 | High-Availability Failover & Resilient Nginx (Q1c)
- **Screen:** Point to the failover section in the benchmark modal or terminal log.
- **Narration:**
  > "In Question 1(c), we conducted a mid-flight container crash experiment, stopping `mess_backend_2` during continuous traffic.
  > Under the default Nginx configuration without retry, 3 requests failed with HTTP 502 Bad Gateway.
  > We then configured Nginx with high-availability directives: `proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504` with a 1-second connect timeout.
  > Repeating the failure test resulted in **0 failed requests—a 100% success rate**, as Nginx transparently and instantly retried in-flight requests on healthy nodes."

---

### 1:25 – 1:55 | Cloud Architecture Diagram & Edge/Fog Analysis (Q1d)
- **Screen:** Open `images/architecture_diagram.jpg` or show Figure 1.1 in `Assignment3_Report.html`.
- **Narration:**
  > "For Question 1(d), here is our architecture diagram. It shows our Vercel web frontend communicating with `mess_nginx_lb` on Port 80, distributing traffic across `mess_backend_1`, `mess_backend_2`, and `mess_backend_3`, all connected to MongoDB Atlas. From Assignment 1, we also retain our Render deployment.
  > Highlighted in vibrant orange is our **Edge/Fog Computing Campus Dining Node**. In a hostel mess, dining halls often suffer from cellular congestion or Wi-Fi dead zones when hundreds of students gather.
  > An on-premise Fog Node located right inside the mess hall caches active menus locally for sub-millisecond lookups and queues student feedback during outages, syncing asynchronously to MongoDB Atlas. During extreme surges, cloud bursting triggers serverless containers to absorb spikes."

---

### 1:55 – 2:25 | Sensitive Data & Salted Bcrypt Password Hashing (Q2a)
- **Screen:** Show the database before-and-after table in `Assignment3_Report.html` or run `node scripts/seed_users.js` in terminal.
- **Narration:**
  > "Moving to Question 2: Secure Your Application.
  > In 2(a), our most sensitive data includes student registration numbers, phone numbers, catering staff passwords, and dining feedback records.
  > We eliminated plain-text passwords and upgraded to **salted bcrypt hashing with 10 cryptographic rounds**.
  > As shown in our MongoDB Atlas database table, raw passwords like `adminSecurePassword123!` are now stored as secure salted hashes starting with `$2b$10$`, making rainbow-table and dictionary attacks computationally infeasible."

---

### 2:25 – 2:45 | Multi-Factor Authentication (TOTP) & Role-Based Access Control (Q2b)
- **Screen:** On browser, log out and click **Admin Login**. Show email and password verification. Then show the **TOTP MFA Step** with Google Authenticator QR Code.
- **Screen:** In Admin Portal, click **"Test PUT without Token (401)"**, **"Test Delete as Student (403)"**, and **"Authorized Admin Update (200)"**.
- **Narration:**
  > "In Question 2(b), we implemented RFC 6238 compliant TOTP Multi-Factor Authentication for Google and Microsoft Authenticator.
  > We restricted our Update and Delete APIs with JWT and Role-Based Access Control.
  > Testing without a token immediately returns **HTTP 401 Unauthorized**. Attempting delete as a student returns **HTTP 403 Forbidden**. Only an authenticated Admin with a verified TOTP session receives **HTTP 200 OK**."

---

### 2:45 – 3:00 | Trivy Container Hardening & Threat Modeling (Q2c & Q2d)
- **Screen:** Show the Trivy audit comparison table and conclusion.
- **Narration:**
  > "In 2(c), scanning with Aqua Security Trivy revealed that migrating from a heavy Debian base (`node:18`) to a minimal Alpine base (`node:20-alpine`) and dropping root privileges with `USER node` reduced our container image size by 82% and dropped CRITICAL and HIGH vulnerabilities to zero!
  > Finally, in 2(d), we modeled threats from rogue catering insiders and external credential stuffers, mapping our controls to GDPR Article 32 and Article 25 requirements.
  > All code, tests, Docker configurations, and reports are pushed to the `assignment-3` branch on GitHub. Thank you!"
