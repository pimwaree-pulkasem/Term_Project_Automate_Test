import { test, expect, request, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.API_BASE_URL ?? 'https://poetry-contest-platform.vercel.app/api';
const TOKEN = process.env.API_TOKEN ?? '';

const CONTEST_ID                    = Number(process.env.CONTEST_ID                    ?? 1);
const CLOSED_CONTEST_ID             = Number(process.env.CLOSED_CONTEST_ID             ?? 2);
const UPCOMING_CONTEST_ID           = Number(process.env.UPCOMING_CONTEST_ID           ?? 3);
const ANNOUNCED_CONTEST_ID          = Number(process.env.ANNOUNCED_CONTEST_ID          ?? 1);
const UNANNOUNCED_CONTEST_ID        = Number(process.env.UNANNOUNCED_CONTEST_ID        ?? 3);
const EXISTING_SUBMISSION_ID        = Number(process.env.EXISTING_SUBMISSION_ID        ?? 1);
const PENDING_SUBMISSION_ID         = Number(process.env.PENDING_SUBMISSION_ID         ?? 1);
const REVISION_SUBMISSION_ID        = Number(process.env.REVISION_SUBMISSION_ID        ?? 2);
const GRADED_SUBMISSION_ID          = Number(process.env.GRADED_SUBMISSION_ID          ?? 3);
const DEADLINE_PASSED_SUBMISSION_ID = Number(process.env.DEADLINE_PASSED_SUBMISSION_ID ?? 4);
const OTHER_SUBMISSION_ID           = Number(process.env.OTHER_SUBMISSION_ID           ?? 999);

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}@example.com`;
}

function authHeaders(token = TOKEN): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildSubmission(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    contest_id: CONTEST_ID,
    first_name: 'สมชาย',
    last_name:  'รักอักษร',
    email:      uniqueEmail('somchai.ruk'),
    phone:      '0812345678',
    level:      'มัธยม',
    title:      `ชื่อผลงาน ${Date.now()}`,
    content:    'แสงอรุณอุ่นฟ้าพาสดใส ภาษาไทยงดงามตามวิถี',
    ...overrides,
  };
}

// Context พร้อม token (ใช้สำหรับ test ที่ต้องการ auth)
async function createApiContext(extraHeaders: Record<string, string> = {}): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

// Context ที่ไม่มี Authorization header เลย (ใช้สำหรับ test 401)
// แก้ไข: แยก function ออกมาชัดเจน เพื่อไม่ให้ Playwright inherit token จาก environment
async function createApiContextNoAuth(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      // ไม่มี Authorization header โดยตั้งใจ
    },
  });
}

async function expectJsonMessage(
  response: Awaited<ReturnType<APIRequestContext['get' | 'post' | 'put' | 'delete']>>,
  expectedStatus: number,
  expectedMessage?: string,
) {
  expect(response.status()).toBe(expectedStatus);
  if (expectedMessage) {
    const body = await response.json();
    expect(String(body.message ?? '')).toContain(expectedMessage);
    return body;
  }
  return response.json();
}

function pdfFile() {
  return { name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%test pdf\n') };
}
function jpgFile() {
  return { name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00]) };
}
function pngFile() {
  return { name: 'test.png', mimeType: 'image/png', buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]) };
}
function exeFile() {
  return { name: 'test.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ-test-exe') };
}
function emptyPdfFile() {
  return { name: 'empty.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) };
}
function largePdfFile() {
  return { name: 'largefile.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(11 * 1024 * 1024, 1) };
}

test.describe('API Test Cases - ผู้ส่งผลงาน', () => {

  // 1. การประกวด (Contest) — ATC-01 ถึง ATC-07
  test.describe('การประกวด (Contest)', () => {

    // แก้ไข: ลบ skipIfNoToken() ออกทุก test — ใช้ TOKEN จาก env โดยตรง
    // ถ้าไม่มี TOKEN จะได้ผล 401 จาก API ซึ่งทำให้ test fail ตามที่ควรจะเป็น

    test('ATC-01 | ดูรายการประกวดทั้งหมด', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get('/contests');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.data ?? body)).toBeTruthy();
      await api.dispose();
    });

    test('ATC-02 | ดูรายการประกวดที่เปิดรับสมัคร', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get('/contests?status=open');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.data ?? body)).toBeTruthy();
      await api.dispose();
    });

    test('ATC-03 | ดูรายการประกวดที่กำลังจะเปิด', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get('/contests?status=upcoming');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.data ?? body)).toBeTruthy();
      await api.dispose();
    });

    test('ATC-04 | ค้นหาการประกวด (พบข้อมูล)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get('/contests?search=กลอนแปด');
      expect(response.status()).toBe(200);
      const body = await response.json();
      const items = body.data ?? body;
      expect(Array.isArray(items)).toBeTruthy();
      expect(items.length).toBeGreaterThan(0);
      await api.dispose();
    });

    test('ATC-05 | ค้นหาการประกวด (ไม่พบข้อมูล)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get('/contests?search=xyzxyz999');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data ?? body).toEqual([]);
      await api.dispose();
    });

    test('ATC-06 | ดูรายละเอียดการประกวด', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get(`/contests/${CONTEST_ID}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data?.id ?? body.id).toBeTruthy();
      await api.dispose();
    });

    test('ATC-07 | ดูรายละเอียดการประกวดที่ไม่มีในระบบ', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get('/contests/99999');
      expect(response.status()).toBe(404);
      await api.dispose();
    });
  });

  // 2. การส่งผลงาน (Submission) — ATC-08 ถึง ATC-24
  test.describe('การส่งผลงาน (Submission)', () => {

    test('ATC-08 | ส่งผลงานสำเร็จ (ระดับมัธยม)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ level: 'มัธยม' }) });
      expect(response.status()).toBe(201);
      await api.dispose();
    });

    test('ATC-09 | ส่งผลงานสำเร็จ (ระดับประชาชน)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', {
        data: buildSubmission({
          first_name: 'สมหญิง',
          last_name:  'รักกลอน',
          email:      uniqueEmail('somying'),
          phone:      '0812345679',
          level:      'ประชาชน',
        }),
      });
      expect(response.status()).toBe(201);
      await api.dispose();
    });

    test('ATC-10 | ส่งผลงานสำเร็จ (ระดับมหาวิทยาลัย)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', {
        data: buildSubmission({
          first_name: 'สมศักดิ์',
          last_name:  'รักบทกวี',
          email:      uniqueEmail('somsak'),
          phone:      '0812345670',
          level:      'มหาวิทยาลัย',
        }),
      });
      expect(response.status()).toBe(201);
      await api.dispose();
    });

    // แก้ไข: ใช้ createApiContextNoAuth() แทน createApiContext() เพื่อให้ไม่มี token จริงๆ
    test('ATC-11 | ส่งผลงานโดยไม่มี token', async () => {
      const api = await createApiContextNoAuth();
      const response = await api.post('/submissions', { data: buildSubmission() });
      expect(response.status()).toBe(401);
      await api.dispose();
    });

    test('ATC-12 | ส่งผลงานซ้ำในประกวดเดิม', async () => {
      const api = await createApiContext(authHeaders());
      const payload = buildSubmission({ email: uniqueEmail('duplicate.case') });
      const first = await api.post('/submissions', { data: payload });
      expect(first.status()).toBe(201);
      const second = await api.post('/submissions', { data: payload });
      expect(second.status()).toBe(409);
      await api.dispose();
    });

    test('ATC-13 | ส่งผลงานโดยไม่กรอกชื่อ', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ first_name: '' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-14 | ส่งผลงานโดยไม่กรอกนามสกุล', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ last_name: '' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-15 | ส่งผลงานโดยกรอกอีเมลรูปแบบผิด', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ email: 'somchai.email' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-16 | ส่งผลงานโดยกรอกอีเมลไม่มี domain', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ email: 'somchai@' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-17 | ส่งผลงานโดยกรอกเบอร์โทรผิดรูปแบบ', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ phone: 'abc1234' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-18 | ส่งผลงานโดยกรอกเบอร์โทรไม่ครบ 10 หลัก', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ phone: '0812345' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-19 | ส่งผลงานโดยไม่เลือกระดับการแข่งขัน', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ level: '' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-20 | ส่งผลงานโดยไม่กรอกชื่อผลงาน', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ title: '' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-21 | ส่งผลงานโดยไม่กรอกเนื้อหากลอน', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ content: '' }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-22 | ส่งผลงานในประกวดที่ปิดรับสมัครแล้ว', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ contest_id: CLOSED_CONTEST_ID }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-23 | ส่งผลงานในประกวดที่ยังไม่เปิดรับสมัคร', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ contest_id: UPCOMING_CONTEST_ID }) });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-24 | ส่งผลงานในประกวดที่ไม่มีในระบบ', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions', { data: buildSubmission({ contest_id: 99999 }) });
      expect(response.status()).toBe(404);
      await api.dispose();
    });
  });

  // 3. การอัปโหลดไฟล์ (File Upload) — ATC-25 ถึง ATC-31
  test.describe('การอัปโหลดไฟล์ (File Upload)', () => {

    test('ATC-25 | อัปโหลดไฟล์ถูกประเภท (PDF)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions/upload', { multipart: { file: pdfFile() } });
      expect(response.status()).toBe(200);
      await api.dispose();
    });

    test('ATC-26 | อัปโหลดไฟล์ถูกประเภท (JPG)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions/upload', { multipart: { file: jpgFile() } });
      expect(response.status()).toBe(200);
      await api.dispose();
    });

    test('ATC-27 | อัปโหลดไฟล์ถูกประเภท (PNG)', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions/upload', { multipart: { file: pngFile() } });
      expect(response.status()).toBe(200);
      await api.dispose();
    });

    test('ATC-28 | อัปโหลดไฟล์ผิดประเภท', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions/upload', { multipart: { file: exeFile() } });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-29 | อัปโหลดไฟล์เกินขนาดที่กำหนด', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions/upload', { multipart: { file: largePdfFile() } });
      expect([400, 413]).toContain(response.status());
      const body = await response.json();
      expect(String(body.message ?? '')).toContain('File size exceeds limit');
      await api.dispose();
    });

    test('ATC-30 | อัปโหลดไฟล์ขนาด 0 byte', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.post('/submissions/upload', { multipart: { file: emptyPdfFile() } });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    // แก้ไข: ใช้ createApiContextNoAuth() แทน createApiContext()
    test('ATC-31 | อัปโหลดไฟล์โดยไม่มี token', async () => {
      const api = await createApiContextNoAuth();
      const response = await api.post('/submissions/upload', { multipart: { file: pdfFile() } });
      expect(response.status()).toBe(401);
      await api.dispose();
    });
  });

  // 4. การแก้ไขผลงาน (Edit Submission) — ATC-32 ถึง ATC-37
  test.describe('การแก้ไขผลงาน (Edit Submission)', () => {

    test('ATC-32 | แก้ไขเนื้อหากลอนสำเร็จ', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.put(`/submissions/${EXISTING_SUBMISSION_ID}`, {
        data: { content: 'เนื้อหากลอนใหม่' },
      });
      expect(response.status()).toBe(200);
      await api.dispose();
    });

    test('ATC-33 | แก้ไขข้อมูลส่วนตัวสำเร็จ', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.put(`/submissions/${EXISTING_SUBMISSION_ID}`, {
        data: { phone: '0899999999' },
      });
      expect(response.status()).toBe(200);
      await api.dispose();
    });

    test('ATC-34 | แก้ไขผลงานหลัง deadline', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.put(`/submissions/${DEADLINE_PASSED_SUBMISSION_ID}`, {
        data: { content: 'เนื้อหากลอนใหม่' },
      });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-35 | แก้ไขผลงานที่มีสถานะ "ตรวจแล้ว"', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.put(`/submissions/${GRADED_SUBMISSION_ID}`, {
        data: { content: 'เนื้อหากลอนใหม่' },
      });
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-36 | แก้ไขผลงานของคนอื่น', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.put(`/submissions/${OTHER_SUBMISSION_ID}`, {
        data: { content: 'เนื้อหากลอนใหม่' },
      });
      expect(response.status()).toBe(403);
      await api.dispose();
    });

    // แก้ไข: ใช้ createApiContextNoAuth() แทน createApiContext()
    test('ATC-37 | แก้ไขผลงานโดยไม่มี token', async () => {
      const api = await createApiContextNoAuth();
      const response = await api.put(`/submissions/${EXISTING_SUBMISSION_ID}`, {
        data: { content: 'เนื้อหากลอนใหม่' },
      });
      expect(response.status()).toBe(401);
      await api.dispose();
    });
  });

  // 5. การดูสถานะผลงาน (Check Status) — ATC-38 ถึง ATC-43
  test.describe('การดูสถานะผลงาน (Check Status)', () => {

    test('ATC-38 | ดูสถานะผลงาน "รอการตรวจสอบ"', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get(`/submissions/${PENDING_SUBMISSION_ID}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(String(body.data?.status ?? body.status)).toContain('รอการตรวจสอบ');
      await api.dispose();
    });

    test('ATC-39 | ดูสถานะผลงาน "รอแก้ไข"', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get(`/submissions/${REVISION_SUBMISSION_ID}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(String(body.data?.status ?? body.status)).toContain('รอแก้ไข');
      await api.dispose();
    });

    test('ATC-40 | ดูสถานะผลงาน "ตรวจแล้ว"', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get(`/submissions/${GRADED_SUBMISSION_ID}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(String(body.data?.status ?? body.status)).toContain('ตรวจแล้ว');
      await api.dispose();
    });

    test('ATC-41 | ดูสถานะผลงานของคนอื่น', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get(`/submissions/${OTHER_SUBMISSION_ID}`);
      expect(response.status()).toBe(403);
      await api.dispose();
    });

    // ATC-42 ระบบนี้ไม่ได้ออกแบบให้เป็น public
    test('ATC-42 | ดูสถานะผลงานโดยไม่มี token', async () => {
      const api = await createApiContextNoAuth();
      const response = await api.get(`/submissions/${EXISTING_SUBMISSION_ID}`);
      expect(response.status()).toBe(401);
      await api.dispose();
    });

    test('ATC-43 | ดูประวัติการส่งผลงานทั้งหมด', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get('/submissions/my');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.data ?? body)).toBeTruthy();
      await api.dispose();
    });
  });

  // 6. การยกเลิกการสมัคร (Cancel Submission) — ATC-44 ถึง ATC-48
  test.describe('การยกเลิกการสมัคร (Cancel Submission)', () => {

    test('ATC-44 | ยกเลิกการสมัครสำเร็จ', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.delete(`/submissions/${EXISTING_SUBMISSION_ID}`);
      expect(response.status()).toBe(200);
      await api.dispose();
    });

    test('ATC-45 | ยกเลิกการสมัครที่มีสถานะ "ตรวจแล้ว"', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.delete(`/submissions/${GRADED_SUBMISSION_ID}`);
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-46 | ยกเลิกการสมัครหลัง deadline', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.delete(`/submissions/${DEADLINE_PASSED_SUBMISSION_ID}`);
      expect(response.status()).toBe(400);
      await api.dispose();
    });

    test('ATC-47 | ยกเลิกการสมัครของคนอื่น', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.delete(`/submissions/${OTHER_SUBMISSION_ID}`);
      expect(response.status()).toBe(403);
      await api.dispose();
    });

    // แก้ไข: ใช้ createApiContextNoAuth() แทน createApiContext()
    test('ATC-48 | ยกเลิกการสมัครโดยไม่มี token', async () => {
      const api = await createApiContextNoAuth();
      const response = await api.delete(`/submissions/${EXISTING_SUBMISSION_ID}`);
      expect(response.status()).toBe(401);
      await api.dispose();
    });
  });

  // 7. การดูผลการแข่งขัน (Result) — ATC-49 ถึง ATC-50
  test.describe('การดูผลการแข่งขัน (Result)', () => {

    test('ATC-49 | ดูผลการแข่งขันที่ประกาศผลแล้ว', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get(`/contests/${ANNOUNCED_CONTEST_ID}/results`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data ?? body).toBeTruthy();
      await api.dispose();
    });

    test('ATC-50 | ดูผลการแข่งขันที่ยังไม่ประกาศผล', async () => {
      const api = await createApiContext(authHeaders());
      const response = await api.get(`/contests/${UNANNOUNCED_CONTEST_ID}/results`);
      expect(response.status()).toBe(400);
      await api.dispose();
    });
  });
});
