const { InfluxDB, Point } = require('@influxdata/influxdb-client')
const dotenv = require("dotenv")

dotenv.config()

const INFLUXDB_TOKEN = 'nTXnJacKiAZRpO54LxxAQh1FgIGg_jqO60hcIa3JNvBaZEo57xDOXgz1lMwymbHn4hM5F0C8mikw5SoCEwDq7Q=='

console.log(INFLUXDB_TOKEN)
const token = INFLUXDB_TOKEN
const url = 'http://localhost:8086'

const client = new InfluxDB({ url, token })

const org = 'MeterFlow'
const bucket = 'api_logs'

// ns = nanosecond precision
const writeClient = client.getWriteApi(org, bucket, 'ns')

// Helper to safely write after a delay
function delayedWrite(delayMs, point) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      try {
        if (writeClient.closed) {
          reject(new Error('WriteApi already closed'));
          return;
        }
        writeClient.writePoint(point);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, delayMs);
    // Store timeoutId if needed for cleanup, but not required here
  });
}

async function runQuery() {
  try {
    // Write 5 points spaced by 1 second
    const promises = [];
    for (let i = 0; i < 5; i++) {
      const point = new Point('measurement1')
        .tag('tagname1', 'tagvalue1')
        .intField('field1', i);

      promises.push(delayedWrite(i * 1000, point));
    }

    // Example API log point (immediate)
    const apiPoint = new Point('measurement1')
      .tag('endpoint', '/users')
      .intField('status_code', 200)
      .floatField('latency_ms', 123.45);

    if (!writeClient.closed) {
      writeClient.writePoint(apiPoint);
    }

    // Wait for all delayed writes to complete
    await Promise.all(promises);

    // Now safe to flush and close
    console.log('All writes scheduled, flushing...');
    await writeClient.flush();
    await writeClient.close();
    console.log('All writes finished successfully');
  } catch (err) {
    console.error('Error in runQuery:', err);
    // Ensure close even on error
    try {
      if (!writeClient.closed) {
        await writeClient.close();
      }
    } catch (closeErr) {
      console.error('Error closing writeClient:', closeErr);
    }
    throw err;
  }
}

runQuery().catch(err => {
  console.error('Error writing to InfluxDB', err);
  process.exit(1);
});