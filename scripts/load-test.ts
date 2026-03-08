type LoadTestOptions = {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: unknown;
  concurrency: number;
  requests: number;
};

async function runLoadTest(opts: LoadTestOptions) {
  const latencies: number[] = [];
  let ok = 0;
  let failed = 0;

  const worker = async () => {
    while (latencies.length + ok + failed < opts.requests) {
      const start = performance.now();
      try {
        const res = await fetch(opts.url, {
          method: opts.method,
          headers: opts.headers,
          body: opts.body ? JSON.stringify(opts.body) : undefined,
        });
        const ms = performance.now() - start;
        latencies.push(ms);
        if (res.ok) ok += 1;
        else failed += 1;
        await res.body?.cancel().catch(() => undefined);
      } catch {
        const ms = performance.now() - start;
        latencies.push(ms);
        failed += 1;
      }
    }
  };

  await Promise.all(Array.from({ length: opts.concurrency }, () => worker()));
  latencies.sort((a, b) => a - b);

  const p = (q: number) => latencies[Math.floor((q / 100) * (latencies.length - 1))] || 0;
  const avg = latencies.reduce((s, x) => s + x, 0) / Math.max(1, latencies.length);

  console.log(JSON.stringify({
    url: opts.url,
    requests: opts.requests,
    concurrency: opts.concurrency,
    ok,
    failed,
    latencyMs: {
      avg: Number(avg.toFixed(1)),
      p50: Number(p(50).toFixed(1)),
      p95: Number(p(95).toFixed(1)),
      p99: Number(p(99).toFixed(1)),
    },
  }));
}

const demoKey = process.env.DEMO_API_KEY || "";
const baseUrl = process.env.LOADTEST_BASE_URL || "http://localhost:3000";

runLoadTest({
  url: `${baseUrl}/api/act/types`,
  method: "GET",
  headers: {
    "x-demo-key": demoKey,
  },
  concurrency: Number(process.env.LOADTEST_CONCURRENCY || 10),
  requests: Number(process.env.LOADTEST_REQUESTS || 200),
}).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
