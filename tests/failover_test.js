import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Failover Test Configuration for Question 1(c)
// Sends constant traffic for 25 seconds while an instance is stopped mid-flight
export const options = {
  scenarios: {
    constant_traffic: {
      executor: 'constant-vus',
      vus: 15,
      duration: '25s',
    },
  },
};

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost/api/menu';

export default function () {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'not 502/503': (r) => r.status !== 502 && r.status !== 503 && r.status !== 504,
  });

  sleep(0.05); // Small delay between client requests
}
