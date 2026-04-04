import { test } from "@playwright/test";
import { ContestPage } from "../../pages/Submission/contest-page";
import { SubmissionPage } from "../../pages/Submission/submission-page";

// test.describe.configure({ mode: "parallel" });

test.describe("Submission Feature", () => {
  let contestPage: ContestPage;
  let submissionPage: SubmissionPage;

  test.beforeEach(async ({ page }) => {
    contestPage = new ContestPage(page);
    submissionPage = new SubmissionPage(page);
    await contestPage.goto();
    await contestPage.login("somchai.ruk@email.com", "Password123!");
  });

  test.describe("ทดสอบการส่งผลงานของผู้ใช้", () => {
    test.describe("Positive Cases", () => {
      test("TC-01 | ดูรายการประกวดที่เปิดรับสมัคร", async () => {
        await contestPage.goToContestPage();
        await contestPage.filterByStatus("เปิดรับสมัคร");
        await contestPage.filterByTopicType("ทั้งหมด");
        await contestPage.filterByPoemType("ทั้งหมด");

        await contestPage.expectContestListVisible();
        await contestPage.expectAllContestsHaveStatus("เปิดรับสมัคร");

        await contestPage.expectContestVisible(
          "การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025"
        );
        await contestPage.expectContestVisible(
          "ประชันโคลงสี่สุภาพ หัวข้ออิสระ ชิงถ้วยพระราชทาน"
        );
        await contestPage.expectContestVisible(
          "ประกวดแต่งกาพย์ยานี 11 อนุรักษ์ธรรมชาติ"
        );
      });

      test("TC-02 | ค้นหาการประกวด (พบข้อมูล)", async () => {
        await contestPage.goToContestPage();
        await contestPage.searchContest("กลอนแปด");

        await contestPage.expectContestListVisible();

        await contestPage.expectContestVisible(
          "การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025"
        );
      });

      test("TC-04 | เข้าหน้าส่งผลงาน", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.expectSubmissionFormVisible();
        await submissionPage.expectSubmissionFormTitle("ฟอร์มสมัครเข้าประกวด");
      });

      test("TC-05 | ทดสอบส่งผลงานสำเร็จ", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        // Step 4: กรอกข้อมูลส่วนตัว
        await submissionPage.fillPersonalInfo({
          firstName: "สมชาย",
          lastName: "รักอักษร",
          email: "somchai.ruk@email.com",
          phone: "0123456789",
          level: "มัธยม",
          filePath: "tests/fixtures/sample.pdf",
        });

        await submissionPage.goNextFromPersonalInfo();

        // Step 6: กรอกข้อมูลผลงาน
        await submissionPage.fillPoemInfo({
          title: "กลอนวันภาษาไทย",
          content:
            "แสงอรุณอุ่นฟ้าพาสดใส ภาษาไทยงดงานตามวิถี สืบวัฒนธรรมค่าควรภัคดี ร่วมรักษาอย่างดีทุกเวลา",
        });

        // จะเช็คไฟล์ที่อัปโหลดด้วยก็ได้
        await submissionPage.expectFileUploaded("sample.pdf");

        await submissionPage.goNextFromPoemInfo();

        // Step 7: ยืนยันการส่ง
        await submissionPage.confirmSubmission();

        // Expected Result
        await submissionPage.expectSubmitSuccess();
        await submissionPage.expectPendingReviewStatus();
        await submissionPage.expectSubmissionProofVisible();
      });

      test("TC-06 | อัปโหลดไฟล์ถูกประเภท (.pdf)", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.uploadFile("tests/fixtures/sample.pdf");
        await submissionPage.expectFileUploaded("sample.pdf");
      });

      test("TC-07 | แก้ไขเนื้อหากลอน", async () => {
        const updatedContent = "แสงอรุณอุ่นฟ้าพาสดใส ภาษาไทยงดงานตามวิถี สืบวัฒนธรรมค่าควรภัคดี ร่วมรักษาอย่างดี";

        await submissionPage.goToMySubmissions();
        await submissionPage.openSubmission("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await submissionPage.clickEdit();

        await submissionPage.fillPoemInfo({
          title: "กลอนวันภาษาไทย",
          content: updatedContent,
        });

        await submissionPage.confirmEdit();
        await submissionPage.expectEditSuccess();
        await submissionPage.expectPoemContentVisible(updatedContent);
      });

      test("TC-08 | ตรวจสอบสถานะผลงาน 'รอการตรวจสอบ'", async () => {
        await submissionPage.goToMySubmissions();
        await submissionPage.openSubmission("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");

        await submissionPage.expectStatus("รอการตรวจสอบ");
      });

      test("TC-09 | ยกเลิกการสมัคร", async () => {
        await submissionPage.goToMySubmissions();
        await submissionPage.openSubmission(
          "การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025"
        );
        await submissionPage.cancelSubmission();
        await submissionPage.confirmCancel();

        await submissionPage.expectCancelSuccess();

        await submissionPage.goToMySubmissions();
        await submissionPage.expectSubmissionNotInList(
          "การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025"
        );
      });

      test("TC-14 | ดูประวัติการส่งผลงานทั้งหมด", async () => {
        await submissionPage.goToMySubmissions();

        await submissionPage.expectMySubmissionsListVisible();
        await submissionPage.expectSubmissionVisible(
          "การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2023"
        );
        await submissionPage.expectSubmissionVisible(
          "ประชันโคลงสี่สุภาพ หัวข้ออิสระ ชิงถ้วยพระราชทาน"
        );
      });

      test("TC-15 | ตรวจสอบสถานะผลงาน 'ตรวจแล้ว'", async () => {
        await submissionPage.goToMySubmissions();
        await submissionPage.openSubmission(
          "การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2023"
        );

        await submissionPage.expectStatus("ตรวจแล้ว");
      });
    });

    test.describe("Negative Cases", () => {
      test("TC-20 | ส่งผลงานซ้ำในการประกวดเดิม — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2023");
        await contestPage.openSubmissionForm();

        await submissionPage.expectDuplicateError("มีผลงานในรายการนี้แล้ว");
      });

      test("TC-21 | อัปโหลดไฟล์เกินขนาดที่กำหนด — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.uploadFile("tests/fixtures/large_file.pdf");
        await submissionPage.expectFileUploadError("ไฟล์มีขนาดเกินกำหนด");
      });

      test("TC-22 | ส่งผลงานโดยไม่กรอกชื่อ — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.fillPersonalInfo({
          firstName: "",
          lastName: "รักอักษร",
          email: "somchai.ruk@email.com",
          phone: "0812345678",
          level: "มัธยม",
          filePath: "tests/fixtures/sample.pdf",
        });

        await submissionPage.goNextFromPersonalInfo();

        await submissionPage.expectFieldError("firstName", "กรุณากรอกชื่อ");
      });

      test("TC-24 | ส่งผลงานโดยใส่อีเมลรูปแบบผิด — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.fillPersonalInfo({
          firstName: "สมชาย",
          lastName: "รักอักษร",
          email: "somchai.email",
          phone: "0812345678",
          level: "มัธยม",
          filePath: "tests/fixtures/sample.pdf",
        });

        await submissionPage.goNextFromPersonalInfo();
        await submissionPage.expectFieldError("email", "รูปแบบอีเมลไม่ถูกต้อง");
      });

      test("TC-25 | ส่งผลงานโดยใส่เบอร์โทรผิดรูปแบบ — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.fillPersonalInfo({
          firstName: "สมชาย",
          lastName: "รักอักษร",
          email: "somchai.ruk@email.com",
          phone: "abc1234",
          level: "มัธยม",
          filePath: "tests/fixtures/sample.pdf",
        });

        await submissionPage.goNextFromPersonalInfo();
        await submissionPage.expectFieldError("phone", "รูปแบบเบอร์โทรไม่ถูกต้อง");
      });

      test("TC-26 | ส่งผลงานโดยไม่กรอกเนื้อหากลอน — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.fillPersonalInfo({
          firstName: "สมชาย",
          lastName: "รักอักษร",
          email: "somchai.ruk@email.com",
          phone: "0812345678",
          level: "มัธยม",
          filePath: "tests/fixtures/sample.pdf",
        });

        await submissionPage.goNextFromPersonalInfo();

        await submissionPage.fillPoemInfo({
          title: "กลอนวันภาษาไทย",
          content: "",
        });

        await submissionPage.goNextFromPoemInfo();
        await submissionPage.expectFieldError("content", "กรุณากรอกเนื้อหากลอน");
      });

      test("TC-27 | ส่งผลงานโดยไม่เลือกระดับการแข่งขัน — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.fillPersonalInfo({
          firstName: "สมชาย",
          lastName: "รักอักษร",
          email: "somchai.ruk@email.com",
          phone: "0812345678",
          level: "",
          filePath: "tests/fixtures/sample.pdf",
        });

        await submissionPage.goNextFromPersonalInfo();
        await submissionPage.expectFieldError("level", "กรุณาเลือกระดับการแข่งขัน");
      });

      test("TC-28 | เข้าหน้าส่งผลงานโดยไม่ได้ล็อกอิน — redirect ไปหน้า login", async ({
        browser,
      }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        const contestPageNoAuth = new ContestPage(page);
        const submissionPageNoAuth = new SubmissionPage(page);

        await contestPageNoAuth.goto();
        await contestPageNoAuth.goToContestPage();
        await contestPageNoAuth.openContest(
          "การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025"
        );
        await contestPageNoAuth.openSubmissionForm();

        await submissionPageNoAuth.expectRedirectToLogin();

        await context.close();
      });

      test("TC-29 | อัปโหลดไฟล์ขนาด 0 byte — แสดง error", async () => {
        await contestPage.goToContestPage();
        await contestPage.openContest("การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025");
        await contestPage.openSubmissionForm();

        await submissionPage.uploadFile("tests/fixtures/empty_file.pdf");
        await submissionPage.expectFileUploadError("ไฟล์ไม่สามารถเป็นไฟล์ว่างได้");
      });
    });
  });
});