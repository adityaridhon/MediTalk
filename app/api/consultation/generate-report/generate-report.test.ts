import { NextRequest } from "next/server";

// Create mock function for Groq
const mockGroqCreate = jest.fn();

// Mock dependencies yang dipakai
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    consultation: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/encryption", () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

jest.mock("groq-sdk", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockGroqCreate,
      },
    },
  }));
});

// import after mocking dep
import { POST } from "./route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockEncrypt = encrypt as jest.MockedFunction<typeof encrypt>;
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>;

describe("Generate Report API - White-Box Testing", () => {
  let mockRequest: NextRequest;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env;
    process.env = { ...originalEnv, GROQ_API_KEY: "test-groq-key" };
    mockRequest = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
      })
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // TC-POST-01: Missing GROQ_API_KEY
  it("should return 500 when GROQ_API_KEY is not configured", async () => {
    delete process.env.GROQ_API_KEY;

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Groq API key not configured");
  });

  // TC-POST-02: No Session
  it("should return 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized - Please login first");
  });

  // TC-POST-03: Invalid Request Body
  it("should return 400 when request body is invalid JSON", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: "invalid-json",
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid request body");
  });

  // TC-POST-04: Missing consultationId
  it("should return 400 when consultationId is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("consultationId is required");
  });

  // TC-POST-05: User Not Found
  it("should return 404 when user does not exist in database", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("User not found");
  });

  // TC-POST-06: Consultation Not Found
  it("should return 404 when consultation does not exist or access denied", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Consultation not found or access denied");
  });

  // TC-POST-07: No Conversation
  it("should return 400 when conversation is null", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: null,
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("No conversation found to generate report");
  });

  // TC-POST-08: Conversation Not Array
  it("should return 400 when conversation is not an array", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: "encrypted-data",
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue({ invalid: "data" });

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("No conversation found to generate report");
  });

  // TC-POST-09: Empty Conversation Array
  it("should return 400 when conversation array is empty", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: "encrypted-data",
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue([]);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("No conversation found to generate report");
  });

  // TC-POST-10: Groq API Error
  it("should return 503 when Groq API fails", async () => {
    const mockConversation = [
      {
        role: "user",
        content: "Saya demam",
        timestamp: "2025-01-01T10:00:00Z",
      },
      {
        role: "assistant",
        content: "Berapa lama?",
        timestamp: "2025-01-01T10:01:00Z",
      },
    ];

    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: "encrypted-data",
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue(mockConversation);
    mockGroqCreate.mockRejectedValue(new Error("Groq API rate limit exceeded"));

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error).toBe("AI service temporarily unavailable");
    expect(data.details).toBe("Groq API rate limit exceeded");
  });

  // TC-POST-11: Empty Response from Groq
  it("should return 500 when Groq returns empty response", async () => {
    const mockConversation = [
      {
        role: "user",
        content: "Saya demam",
        timestamp: "2025-01-01T10:00:00Z",
      },
    ];

    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: "encrypted-data",
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue(mockConversation);
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Empty response from Groq AI");
  });

  // TC-POST-12: Success Path with Valid JSON
  it("should return 200 and generate report successfully", async () => {
    const mockConversation = [
      {
        role: "user",
        content: "Saya demam",
        timestamp: "2025-01-01T10:00:00Z",
      },
      {
        role: "assistant",
        content: "Berapa lama?",
        timestamp: "2025-01-01T10:01:00Z",
      },
    ];

    const mockReport = {
      ringkasan_gejala: "Demam",
      keluhan_utama: "Demam",
      gejala_tambahan: [],
      durasi_gejala: "1 hari",
      tingkat_keparahan: "sedang",
      faktor_pemicu: "Tidak diketahui",
      riwayat_pengobatan: "Belum ada",
      rekomendasi: {
        tindakan_segera: "Minum paracetamol",
        perawatan_rumah: "Istirahat",
        kapan_ke_dokter: "Jika >3 hari",
        spesialis_yang_disarankan: "Dokter umum",
      },
      catatan_penting: "Monitor",
      tingkat_urgensi: "sedang",
    };

    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: "encrypted-data",
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue(mockConversation);
    mockEncrypt.mockReturnValue("encrypted-report");
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockReport) } }],
    });
    (prisma.consultation.update as jest.Mock).mockResolvedValue({
      id: "cons-123",
      status: "COMPLETE",
    });

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Report generated successfully using Groq AI");
    expect(data.data.report.ringkasan_gejala).toBe("Demam");
    expect(data.data.report.metadata).toBeDefined();
    expect(data.data.consultationId).toBe("cons-123");
    expect(data.data.status).toBe("COMPLETE");
  });

  // TC-POST-13: Database Save Error
  it("should return 500 when database save fails", async () => {
    const mockConversation = [
      { role: "user", content: "Sakit", timestamp: "2025-01-01T10:00:00Z" },
    ];

    const mockReport = {
      ringkasan_gejala: "Sakit",
      keluhan_utama: "Sakit",
      gejala_tambahan: [],
      durasi_gejala: "1 hari",
      tingkat_keparahan: "ringan",
      faktor_pemicu: "Tidak diketahui",
      riwayat_pengobatan: "Belum ada",
      rekomendasi: {
        tindakan_segera: "Monitor",
        perawatan_rumah: "Istirahat",
        kapan_ke_dokter: "Jika memburuk",
        spesialis_yang_disarankan: "Dokter umum",
      },
      catatan_penting: "Monitor",
      tingkat_urgensi: "rendah",
    };

    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Sakit",
      conversation: "encrypted-data",
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue(mockConversation);
    mockEncrypt.mockReturnValue("encrypted-report");
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockReport) } }],
    });
    (prisma.consultation.update as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to save report to database");
    expect(data.details).toBe("Database connection failed");
  });

  // TC-POST-14: Generic Error Handling
  it("should return 500 for unexpected errors", async () => {
    mockAuth.mockRejectedValue(new Error("Unexpected error"));

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unexpected error");
  });

  // TC-POST-15: Missing Required Fields
  it("should fill missing required fields with defaults", async () => {
    const mockConversation = [
      { role: "user", content: "Sakit", timestamp: "2025-01-01T10:00:00Z" },
    ];

    const incompleteReport = {
      ringkasan_gejala: "Sakit",
      // Missing other required fields
    };

    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Sakit",
      conversation: "encrypted-data",
      createdBy: "user-123",
    });
    mockDecrypt.mockReturnValue(mockConversation);
    mockEncrypt.mockReturnValue("encrypted-report");
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(incompleteReport) } }],
    });
    (prisma.consultation.update as jest.Mock).mockResolvedValue({
      id: "cons-123",
      status: "COMPLETE",
    });

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/generate-report", {
        method: "POST",
        body: JSON.stringify({ consultationId: "cons-123" }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.report.keluhan_utama).toBe("Tidak tersedia");
    expect(data.data.report.tingkat_keparahan).toBe("Tidak tersedia");
    expect(data.data.report.rekomendasi).toBeDefined();
  });
});
