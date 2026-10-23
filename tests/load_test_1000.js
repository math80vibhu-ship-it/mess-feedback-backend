import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration for Question 1(b)
// Exactly 1,000 requests with fixed concurrency
export const options = {
  scenarios: {
    thousand_requests: {
      executor: 'shared-iterations',
      vus: 20,              // 20 concurrent Virtual Users
      iterations: 1000,     // Total 1,000 requests
      maxDuration: '60s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% errors expected
  },
};

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost/api/menu';

export default function () {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Zero sleep for maximum throughput measurement
}
