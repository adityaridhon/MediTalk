import { NextRequest } from "next/server";

// Mock dependencies sebelum mulai
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    consultation: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/encryption", () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

// Import setelah mocking
import { GET, POST } from "./route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>;
const mockEncrypt = encrypt as jest.MockedFunction<typeof encrypt>;

describe("Consultation API Routes - White-Box Testing", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest(
      new Request("http://localhost:3000/api/consultation")
    );
  });

  describe("GET /api/consultation", () => {
    // TC-GET-01: No Session - Authentication Check
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized - Please login first");
    });

    // TC-GET-02: User Not Found
    it("should return 404 when user does not exist in database", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    // TC-GET-03: Success Path - Empty Consultations
    it("should return 200 with empty array when user has no consultations", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findMany as jest.Mock).mockResolvedValue([]);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(prisma.consultation.findMany).toHaveBeenCalledWith({
        where: { createdBy: "user-123" },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    // TC-GET-04: Success Path - With Encrypted Data
    it("should return 200 with decrypted consultations when found", async () => {
      const mockConsultations = [
        {
          id: "cons-1",
          gejala: "Demam",
          status: "ACTIVE",
          conversation: "encrypted-conversation-1",
          report: "encrypted-report-1",
          createdBy: "user-123",
          createdAt: new Date("2025-01-01"),
          user: {
            id: "user-123",
            name: "Test User",
            email: "test@example.com",
          },
        },
        {
          id: "cons-2",
          gejala: "Batuk",
          status: "COMPLETE",
          conversation: "encrypted-conversation-2",
          report: "encrypted-report-2",
          createdBy: "user-123",
          createdAt: new Date("2025-01-02"),
          user: {
            id: "user-123",
            name: "Test User",
            email: "test@example.com",
          },
        },
      ];

      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findMany as jest.Mock).mockResolvedValue(
        mockConsultations
      );
      mockDecrypt.mockImplementation((data) => `decrypted-${data}`);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].conversation).toBe(
        "decrypted-encrypted-conversation-1"
      );
      expect(data.data[0].report).toBe("decrypted-encrypted-report-1");
      expect(data.data[1].conversation).toBe(
        "decrypted-encrypted-conversation-2"
      );
      expect(data.data[1].report).toBe("decrypted-encrypted-report-2");
      expect(mockDecrypt).toHaveBeenCalledTimes(4); // 2 conversations + 2 reports
    });

    // TC-GET-05: Edge Case - Null Conversation and Report
    it("should handle null conversation and report fields", async () => {
      const mockConsultations = [
        {
          id: "cons-1",
          gejala: "Demam",
          status: "ACTIVE",
          conversation: null,
          report: null,
          createdBy: "user-123",
          createdAt: new Date("2025-01-01"),
          user: {
            id: "user-123",
            name: "Test User",
            email: "test@example.com",
          },
        },
      ];

      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findMany as jest.Mock).mockResolvedValue(
        mockConsultations
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data[0].conversation).toBeNull();
      expect(data.data[0].report).toBeNull();
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    // TC-GET-06: Exception Handling
    it("should return 500 when an unexpected error occurs", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("POST /api/consultation", () => {
    // TC-POST-01: No Session - Authentication Check
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized - Please login first");
    });

    // TC-POST-02: Missing Gejala Field
    it("should return 400 when gejala is missing", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);

      const mockReq = new NextRequest(
        new Request("http://localhost:3000/api/consultation", {
          method: "POST",
          body: JSON.stringify({}),
        })
      );

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Gejala is required");
    });

    // TC-POST-03: Empty Gejala String
    it("should return 400 when gejala is empty string", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);

      const mockReq = new NextRequest(
        new Request("http://localhost:3000/api/consultation", {
          method: "POST",
          body: JSON.stringify({ gejala: "" }),
        })
      );

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Gejala is required");
    });

    // TC-POST-04: Whitespace Only Gejala
    it("should return 400 when gejala is whitespace only", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);

      const mockReq = new NextRequest(
        new Request("http://localhost:3000/api/consultation", {
          method: "POST",
          body: JSON.stringify({ gejala: "   " }),
        })
      );

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Gejala is required");
    });

    // TC-POST-05: User Not Found
    it("should return 404 when user does not exist in database", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const mockReq = new NextRequest(
        new Request("http://localhost:3000/api/consultation", {
          method: "POST",
          body: JSON.stringify({ gejala: "Demam dan batuk" }),
        })
      );

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    // TC-POST-06: Success Path - Create Consultation
    it("should return 200 and create consultation when all data is valid", async () => {
      const mockCreatedConsultation = {
        id: "cons-123",
        gejala: "Demam tinggi",
        status: "ACTIVE",
        conversation: null,
        report: null,
        createdBy: "user-123",
        createdAt: new Date("2025-01-01"),
        user: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.create as jest.Mock).mockResolvedValue(
        mockCreatedConsultation
      );

      const mockReq = new NextRequest(
        new Request("http://localhost:3000/api/consultation", {
          method: "POST",
          body: JSON.stringify({ gejala: "Demam tinggi" }),
        })
      );

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("cons-123");
      expect(data.data.gejala).toBe("Demam tinggi");
      expect(data.data.status).toBe("ACTIVE");
      expect(prisma.consultation.create).toHaveBeenCalledWith({
        data: {
          gejala: "Demam tinggi",
          status: "ACTIVE",
          createdBy: "user-123",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    // TC-POST-07: Gejala with Leading/Trailing Whitespace
    it("should trim whitespace from gejala before saving", async () => {
      const mockCreatedConsultation = {
        id: "cons-123",
        gejala: "Demam tinggi",
        status: "ACTIVE",
        conversation: null,
        report: null,
        createdBy: "user-123",
        createdAt: new Date("2025-01-01"),
        user: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.create as jest.Mock).mockResolvedValue(
        mockCreatedConsultation
      );

      const mockReq = new NextRequest(
        new Request("http://localhost:3000/api/consultation", {
          method: "POST",
          body: JSON.stringify({ gejala: "  Demam tinggi  " }),
        })
      );

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.consultation.create).toHaveBeenCalledWith({
        data: {
          gejala: "Demam tinggi", // Should be trimmed
          status: "ACTIVE",
          createdBy: "user-123",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    // TC-POST-08: Exception Handling
    it("should return 500 when an unexpected error occurs", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const mockReq = new NextRequest(
        new Request("http://localhost:3000/api/consultation", {
          method: "POST",
          body: JSON.stringify({ gejala: "Demam tinggi" }),
        })
      );

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
