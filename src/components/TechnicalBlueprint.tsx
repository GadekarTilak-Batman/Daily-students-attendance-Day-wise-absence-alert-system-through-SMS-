import React, { useState } from 'react';
import { 
  Network, 
  Database, 
  GitBranch, 
  ShieldCheck, 
  Cpu, 
  FileCode, 
  Layers, 
  Download, 
  Copy, 
  Check, 
  Server, 
  Radio, 
  Smartphone, 
  Lock, 
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

type BlueprintSubTab = 'TOPOLOGY' | 'SEQUENCES' | 'DATA_MODEL' | 'QUEUE_ENGINE' | 'SECURITY';

export const TechnicalBlueprint: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<BlueprintSubTab>('TOPOLOGY');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadMarkdownSpec = () => {
    const mdContent = `# Comprehensive Technical Architectural Blueprint: Mother Theressa College of Engineering and Technology, Peddapalli
## Automated Student Absence Alert System with Real-Time Parent Notification

## 1. System Overview & Institutional Context
Implemented for Mother Theressa College of Engineering and Technology (MTCET), Peddapalli, this system provides an automated, low-latency attendance ingestion and concurrent SMS broadcast pipeline across active engineering classes (Computer Networks, DevOps, DAA, PPL, Computer Graphics). It detects absentees in real time, concurrently dispatches personalized SMS notifications to parents via carrier-grade telecom gateways, captures asynchronous Delivery Receipts (DLR), and supports a two-way parent acknowledgement (ACK) loop.

---

## 2. High-Level Distributed Topology
- **Client Tier**: Single-Page React Application with responsive attendance roll call grids and live WebSocket progress streams.
- **Edge / API Gateway**: Reverse proxy (Envoy / Kong) enforcing JWT RBAC, TLS 1.3 termination, and client IP rate limiting.
- **Attendance Ingestion Service**: Stateless microservice handling bulk session attendance commits with idempotent transaction guarantees.
- **Message Broker & Event Bus**: Apache Kafka cluster partition-keyed by institution_id:department.
- **SMS Worker Pool**: Horizontally scalable worker cluster equipped with Token Bucket rate limiters, Circuit Breakers, and exponential backoff.
- **Telecom Carrier Aggregators**: Multi-vendor SMPP v3.4 / REST failover bindings (Twilio, AWS SNS, Infobip, MSG91).
- **Inbound Webhook Processor**: Cryptographically signed (HMAC-SHA256) endpoint ingesting two-way parent SMS replies to reconcile attendance status to 'ACKNOWLEDGED'.
- **Persistence Tier**: PostgreSQL cluster with write-ahead logging (WAL), table partitioning on attendance_records (by academic_year and semester), and Redis for session caching and rate-limiting counters.

---

## 3. Relational Schema Architecture (PostgreSQL)
\`\`\`sql
-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    department_id UUID NOT NULL,
    semester SMALLINT NOT NULL,
    section CHAR(2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guardians
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_name VARCHAR(128) NOT NULL,
    phone_number_e164 VARCHAR(20) NOT NULL,
    email VARCHAR(128),
    relation_type VARCHAR(32) DEFAULT 'PARENT',
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    session_date DATE NOT NULL,
    period_id VARCHAR(32) NOT NULL,
    subject_code VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    marked_by UUID NOT NULL,
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT uq_student_session UNIQUE (student_id, session_date, period_id)
);

-- SMS Dispatch Logs
CREATE TABLE sms_dispatch_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    guardian_id UUID NOT NULL REFERENCES guardians(id),
    attendance_record_id UUID REFERENCES attendance_records(id),
    message_payload TEXT NOT NULL,
    carrier_provider VARCHAR(32) NOT NULL,
    carrier_message_id VARCHAR(128),
    status VARCHAR(20) NOT NULL CHECK (status IN ('QUEUED', 'SENDING', 'DELIVERED', 'FAILED', 'ACKNOWLEDGED')),
    carrier_status_code VARCHAR(32),
    retry_count SMALLINT DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    error_reason TEXT
);

-- Parent Inbound Acknowledgements
CREATE TABLE parent_inbound_acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sms_log_id UUID NOT NULL REFERENCES sms_dispatch_logs(id),
    raw_reply_text TEXT NOT NULL,
    excuse_classification VARCHAR(64),
    received_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by_staff BOOLEAN DEFAULT FALSE
);
\`\`\`

---

## 4. Rate Limiting, Concurrency & Failover Mechanics
- **Throughput Budget**: 100 TPS maximum per upstream aggregator bind.
- **Retry Algorithm**: Full Jitter Exponential Backoff: \`t_sleep = min(t_max, t_base * 2^attempt) + uniform(0, jitter)\`.
- **Circuit Breaker**: Trips to OPEN when error rate exceeds 25% over a 30-second rolling window, redirecting traffic to secondary fallback aggregator.

---

## 5. Security & FERPA Compliance
- Parent phone numbers and student identifiers encrypted at rest using AES-256-GCM.
- Inbound carrier webhooks verified via HMAC-SHA256 signature header matching institutional shared secret.
- Audit logging for all roll call mutations and parent message triggers.
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_messaging_system_technical_blueprint.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sqlSnippet = `-- Enterprise Attendance & Parent Messaging Schema (PostgreSQL)
CREATE TYPE attendance_status_enum AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE sms_delivery_status_enum AS ENUM ('QUEUED', 'SENDING', 'DELIVERED', 'FAILED', 'ACKNOWLEDGED');

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    department_id VARCHAR(64) NOT NULL,
    semester SMALLINT NOT NULL,
    section CHAR(2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_name VARCHAR(128) NOT NULL,
    phone_e164 VARCHAR(20) NOT NULL,
    email VARCHAR(128),
    is_primary_contact BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    session_date DATE NOT NULL,
    period_id VARCHAR(32) NOT NULL,
    subject_code VARCHAR(64) NOT NULL,
    status attendance_status_enum NOT NULL,
    marked_by_user_id VARCHAR(64) NOT NULL,
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT uq_attendance_session UNIQUE (student_id, session_date, period_id)
);

CREATE TABLE sms_dispatch_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    guardian_id UUID NOT NULL REFERENCES guardians(id),
    session_date DATE NOT NULL,
    period_id VARCHAR(32) NOT NULL,
    message_content TEXT NOT NULL,
    carrier_provider VARCHAR(32) NOT NULL,
    carrier_message_sid VARCHAR(128),
    status sms_delivery_status_enum NOT NULL DEFAULT 'QUEUED',
    carrier_status_code VARCHAR(32),
    retry_count SMALLINT DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    error_reason TEXT
);

CREATE TABLE parent_inbound_acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sms_log_id UUID NOT NULL REFERENCES sms_dispatch_logs(id),
    student_id UUID NOT NULL REFERENCES students(id),
    reply_body TEXT NOT NULL,
    classified_excuse_category VARCHAR(64),
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes for Real-Time Roll Call & Audit
CREATE INDEX idx_attendance_date_period ON attendance_records (session_date, period_id, status);
CREATE INDEX idx_sms_status_date ON sms_dispatch_logs (status, sent_at);
CREATE INDEX idx_guardian_phone ON guardians (phone_e164);`;

  const queueCodeSnippet = `// Production-Grade SMS Dispatch Worker with Token Bucket & Circuit Breaker
import { CircuitBreaker } from './circuitBreaker';
import { TokenBucket } from './tokenBucket';

const rateLimiter = new TokenBucket({ capacity: 100, refillRatePerSec: 50 }); // 100 TPS max
const primaryGatewayBreaker = new CircuitBreaker({ failureThresholdPct: 25, windowMs: 30000 });

export async function processSmsDispatchTask(task: SmsDispatchJob): Promise<DispatchResult> {
  // 1. Await Token Bucket capacity to respect Telecom Regulatory rate limits
  await rateLimiter.acquireToken();

  // 2. Execute via Circuit Breaker with automatic failover to secondary provider
  try {
    return await primaryGatewayBreaker.execute(async () => {
      return await twilioGateway.send({
        from: task.senderId,
        to: task.parentPhone,
        body: task.messageContent,
        statusCallback: 'https://api.campus.edu/v1/sms/webhook/dlr'
      });
    });
  } catch (primaryError) {
    logger.warn('Primary SMS aggregator failed. Triggering failover carrier...', { error: primaryError });
    return await fallbackAwsSnsGateway.send({
      senderId: task.senderId,
      phone: task.parentPhone,
      message: task.messageContent
    });
  }
}`;

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Network className="w-4 h-4" />
              <span>Mother Theressa College of Engineering & Technology, Peddapalli</span>
              <span className="text-slate-600">|</span>
              <span>Telecommunications Architecture</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Automated Student Absence Alert System & Telecommunications Architecture
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              MTCET Peddapalli engineering blueprint detailing real-time absence detection across Computer Networks, DevOps, DAA, PPL, and Computer Graphics, concurrent carrier fan-out, DLT compliance, two-way parent acknowledgement, and relational data modeling.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadMarkdownSpec}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-900" />
              <span>Download Blueprint (Markdown)</span>
            </button>
          </div>
        </div>

        {/* Blueprint Sub-navigation */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('TOPOLOGY')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'TOPOLOGY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>01. System Topology & Microservices</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SEQUENCES')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'SEQUENCES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>02. End-to-End Sequence Lifecycles</span>
          </button>

          <button
            onClick={() => setActiveSubTab('DATA_MODEL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'DATA_MODEL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>03. Relational Schema & DDL</span>
          </button>

          <button
            onClick={() => setActiveSubTab('QUEUE_ENGINE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'QUEUE_ENGINE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>04. Queueing, Rate Limits & Failover</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SECURITY')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'SECURITY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>05. Security, FERPA & RBAC</span>
          </button>
        </div>
      </div>

      {/* SUB-SECTION 01: SYSTEM TOPOLOGY */}
      {activeSubTab === 'TOPOLOGY' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                01. Distributed System Topology & Component Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visual architectural block diagram illustrating the end-to-end data flow from staff roll call input to telecom carriers and parent handsets.
              </p>
            </div>

            {/* Interactive Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5">
              {/* Node 1: Ingestion */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    LAYER 1: CLIENT
                  </span>
                  <Server className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">Faculty & Staff Web UI</h3>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• React 19 SPA + WebSocket</li>
                  <li>• Instant Roll Call Toggles</li>
                  <li>• Bulk Absence Auto-Detector</li>
                  <li>• One-Click Batch Trigger</li>
                </ul>
              </div>

              {/* Node 2: API Gateway & Event Bus */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    LAYER 2: BROKER
                  </span>
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">Kafka Event Bus</h3>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Topic: <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">attendance.marked</code></li>
                  <li>• Topic: <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">sms.dispatch.requested</code></li>
                  <li>• Partitioned by Dept & Session</li>
                  <li>• Zero Data Loss Durability</li>
                </ul>
              </div>

              {/* Node 3: Workers & Gateways */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    LAYER 3: DISPATCH
                  </span>
                  <Radio className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">SMS Worker Cluster</h3>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Token-Bucket (100 TPS)</li>
                  <li>• DLT Template Interpolation</li>
                  <li>• Multi-Carrier Circuit Breaker</li>
                  <li>• Twilio / AWS SNS / SMPP Bind</li>
                </ul>
              </div>

              {/* Node 4: Telecom & Parent */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    LAYER 4: RECIPIENT
                  </span>
                  <Smartphone className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">SS7 / Carrier Towers</h3>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Cellular Handset Delivery</li>
                  <li>• DLR Webhook Callback</li>
                  <li>• 2-Way Inbound SMS Reply</li>
                  <li>• Automatic ACK Reconciler</li>
                </ul>
              </div>
            </div>

            {/* Technical Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>Carrier Protocol: SMPP v3.4 vs REST</span>
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  While low-volume notification apps rely on standard REST APIs (HTTP 200/500 overhead of ~150ms per call), our enterprise absence alert architecture utilizes dedicated <strong>SMPP v3.4 (Short Message Peer-to-Peer)</strong> persistent TCP connections with upstream telecom aggregators. This enables sub-30ms transmission latency and true concurrent packet bursts of over 1,000 TPS during peak morning attendance submission windows (08:30 - 09:30 AM).
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Two-Way Inbound Webhook Reconciliation</span>
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  When a parent responds to an alert (e.g. &ldquo;Diya has a 102°F fever, doctor note attached&rdquo;), the telecom gateway posts an inbound MO (Mobile Originated) webhook. Our API Gateway validates the HMAC-SHA256 signature, matches the parent phone number with the student roll number, updates the SMS log to <strong className="font-mono text-blue-700">ACKNOWLEDGED</strong>, and appends the excuse note to the dean&apos;s daily log.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 02: SEQUENCE LIFECYCLES */}
      {activeSubTab === 'SEQUENCES' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                02. End-to-End Sequence Lifecycles & Step-by-Step Flow
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Detailed protocol flows for roll call ingestion, idempotent broadcast fan-out, asynchronous DLR receipts, and parent replies.
              </p>
            </div>

            <div className="space-y-4">
              {/* Sequence 1 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900 text-sm">
                    Phase 1: Roll Call Ingestion & Absence Detection
                  </div>
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                    p99 &lt; 85ms
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                  <li><strong>Faculty Marks Roster</strong>: Faculty toggles student statuses on the web client for Period 1.</li>
                  <li><strong>Client-Side Trigger Evaluation</strong>: React state engine inspects status delta; if status == <code className="bg-slate-200 px-1 py-0.5 rounded">ABSENT</code>, pushes student into the pending broadcast buffer.</li>
                  <li><strong>Batch Ingestion API</strong>: POST to <code className="bg-slate-200 px-1 py-0.5 rounded">/api/v1/attendance/batch</code> with Idempotency-Key header.</li>
                  <li><strong>Database Commit & Event Emission</strong>: Records inserted inside a PostgreSQL transaction; an event <code className="bg-slate-200 px-1 py-0.5 rounded">AttendanceMarkedEvent</code> is published to Kafka topic.</li>
                </ol>
              </div>

              {/* Sequence 2 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900 text-sm">
                    Phase 2: Simultaneous Batch SMS Fan-Out ("At a Time")
                  </div>
                  <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                    Concurrent Burst
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                  <li><strong>Batch Broadcast Triggered</strong>: Faculty clicks &ldquo;Send Instant SMS to All Absent Parents at Once&rdquo;.</li>
                  <li><strong>Worker Parallelization</strong>: Worker cluster pulls absent recipients, interpolates dynamic placeholders ({'{student_name}'}, {'{roll_no}'}, {'{period}'}) against registered DLT templates.</li>
                  <li><strong>Token-Bucket Rate Limiter</strong>: Enforces telecom compliance (max 100 TPS per bind) to prevent upstream carrier 429 throttling.</li>
                  <li><strong>Concurrent Gateway Dispatch</strong>: Submits parallel requests to upstream telecom aggregator (Twilio / AWS SNS / SMPP gateway).</li>
                  <li><strong>Initial Delivery Log</strong>: Inserts rows in <code className="bg-slate-200 px-1 py-0.5 rounded">sms_dispatch_logs</code> with state <code className="bg-slate-200 px-1 py-0.5 rounded">SENDING</code> and tracks carrier message SID.</li>
                </ol>
              </div>

              {/* Sequence 3 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900 text-sm">
                    Phase 3: Carrier Delivery Receipts (DLR) & Resend Recovery
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                    Async Webhook
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                  <li><strong>Handset Handshake</strong>: Upstream mobile switching center (MSC) delivers SMS to parent&apos;s handset and sends SS7 delivery acknowledgement back to aggregator.</li>
                  <li><strong>DLR Webhook Callback</strong>: Aggregator dispatches signed HTTP POST to college endpoint with carrier code <code className="bg-slate-200 px-1 py-0.5 rounded">DELIVRD_200</code> or error (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded">ERR_TIMEOUT_504</code>).</li>
                  <li><strong>Log State Machine Transition</strong>: System updates <code className="bg-slate-200 px-1 py-0.5 rounded">sms_dispatch_logs.status</code> to DELIVERED or FAILED.</li>
                  <li><strong>Automatic Dead-Letter Queue & Resend Engine</strong>: Failed alerts are flagged for 1-click bulk recovery or phone correction.</li>
                </ol>
              </div>

              {/* Sequence 4 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900 text-sm">
                    Phase 4: Inbound Parent ACK & Automated Leave Classification
                  </div>
                  <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                    2-Way Loop
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                  <li><strong>Parent Replies via SMS</strong>: Parent texts back (e.g. &ldquo;Fever under doctor care&rdquo;).</li>
                  <li><strong>Carrier Inbound Webhook</strong>: Gateway receives MO SMS and posts to webhook listener.</li>
                  <li><strong>Correlation & Status Update</strong>: System correlates parent phone with student, changes log status to <code className="bg-slate-200 px-1 py-0.5 rounded">ACKNOWLEDGED</code>, and saves the excuse note.</li>
                  <li><strong>Real-Time UI Push</strong>: College dashboard automatically reflects the parent&apos;s verified response.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 03: RELATIONAL DATA MODEL */}
      {activeSubTab === 'DATA_MODEL' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  03. Relational Database Schema & Production DDL (PostgreSQL)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fully normalized entity relationship schema engineered for high-concurrency roll call sessions and telecom delivery audit compliance.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(sqlSnippet, 'sql')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
              >
                {copiedCode === 'sql' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied DDL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy PostgreSQL DDL</span>
                  </>
                )}
              </button>
            </div>

            {/* DDL Code Viewer */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>schema.sql — PostgreSQL 16+</span>
                <span>UTF-8</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
                <code>{sqlSnippet}</code>
              </pre>
            </div>

            {/* Table Explanations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-mono font-bold text-slate-900">attendance_records</span>
                <p className="text-slate-600 text-[11px]">
                  Enforces unique constraint <code className="bg-slate-200 px-1 py-0.5 rounded">(student_id, session_date, period_id)</code> to ensure idempotent attendance marking without duplicate records.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-mono font-bold text-slate-900">sms_dispatch_logs</span>
                <p className="text-slate-600 text-[11px]">
                  Tracks carrier message SID, carrier delivery receipt timestamps, retry attempts, and detailed error codes (e.g. timeout, invalid E.164 formatting).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-mono font-bold text-slate-900">parent_inbound_ack</span>
                <p className="text-slate-600 text-[11px]">
                  Stores raw parent SMS responses, parsed leave categories (medical, transit, emergency), and ties directly to the originating alert UUID.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 04: QUEUEING & RATE LIMITING */}
      {activeSubTab === 'QUEUE_ENGINE' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                04. Telecommunications Queueing, Rate Limiting & Failover Engine
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Engineering strategies to adhere to telecom regulatory limits, prevent upstream aggregator 429 throttling, and survive carrier outages.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Conceptual Breakdown */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>Token Bucket Rate Limiting (100 TPS)</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Telecom aggregators and mobile network operators enforce strict Transactions Per Second (TPS) limits on registered sender IDs (e.g., maximum 50–100 TPS per SMPP bind). Exceeding this rate results in immediate dropped messages or carrier queue starvation. Our architecture enforces a <strong>Token Bucket</strong> in Redis: tokens refill at a fixed rate, smoothing concurrent bursts from college-wide roll calls into an orderly, regulatory-compliant stream.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span>Full Jitter Exponential Backoff</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    When upstream carrier timeouts occur (e.g., transient network congestion on a regional tower), retrying immediately creates a stampede effect. The system calculates backoff delay using:
                  </p>
                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px]">
                    t_sleep = min(t_max, t_base * 2^attempt) + uniform(0, jitter)
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-purple-600" />
                    <span>Multi-Gateway Circuit Breaker</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    If the primary carrier gateway (e.g. Twilio) exhibits an error rate &gt; 25% over a 30-second rolling window, the circuit breaker trips to <strong className="font-mono text-rose-600">OPEN</strong> and immediately reroutes all subsequent traffic to the secondary fallback gateway (e.g. AWS SNS / MSG91) without dropping absence alerts.
                  </p>
                </div>
              </div>

              {/* Right Column: Code Snippet */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Worker Implementation Pattern
                  </span>
                  <button
                    onClick={() => copyToClipboard(queueCodeSnippet, 'queue')}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    {copiedCode === 'queue' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Code</span>
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                    smsWorker.ts — Concurrency & Circuit Breaker
                  </div>
                  <pre className="p-4 text-[11px] font-mono text-blue-300 overflow-x-auto leading-relaxed max-h-96">
                    <code>{queueCodeSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 05: SECURITY & COMPLIANCE */}
      {activeSubTab === 'SECURITY' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                05. Security, Student Privacy (FERPA), & Role-Based Access Control (RBAC)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Institutional governance protocols safeguarding student educational records, parent contact PII, and telecommunication integrity.
              </p>
            </div>

            {/* Security Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">FERPA / GDPR Compliance</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Student roll call histories and guardian phone numbers are classified as protected educational records. All parent phone numbers and contact metadata are encrypted at rest using <strong>AES-256-GCM</strong> with envelope key management via institutional KMS.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">HMAC Webhook Signatures</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  All inbound carrier delivery receipts and parent response webhooks require valid cryptographic validation using an HMAC-SHA256 signature header (<code className="bg-slate-200 px-1 py-0.5 rounded">X-Carrier-Signature</code>), preventing spoofed delivery statuses or forged parent excuses.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">DLT Template Registration</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Conforms to telecommunication Distributed Ledger Technology (DLT) regulations (e.g., TRAI / FCC 10DLC). Messages must match pre-registered template headers to guarantee non-spam delivery across carrier firewalls.
                </p>
              </div>
            </div>

            {/* RBAC Matrix Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Role-Based Access Control (RBAC) Permissions Matrix
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2.5 px-3">Role / Principal</th>
                      <th className="py-2.5 px-3 text-center">Mark Roll Call</th>
                      <th className="py-2.5 px-3 text-center">Trigger Batch SMS</th>
                      <th className="py-2.5 px-3 text-center">Resend Failed Alerts</th>
                      <th className="py-2.5 px-3 text-center">Edit Parent Phone</th>
                      <th className="py-2.5 px-3 text-center">Configure Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Class Faculty / Lecturer</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (Assigned Only)</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">✗</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">✗</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Department Head (HOD)</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (All Dept)</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">✗</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Dean of Student Affairs</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">Audit View</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (Escalation)</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">✗</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">System Administrator</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (Master)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
