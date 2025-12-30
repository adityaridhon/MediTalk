import { NextRequest } from "next/server";

// Mock dependencies yang dibutuhkan
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
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/encryption", () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

// baru import after mocking
import { GET, PATCH, DELETE } from "./route";
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
      new Request("http://localhost:3000/api/consultation/123")
    );
  });

  describe("GET /api/consultation/[id]", () => {
    const mockParams = { id: "consultation-123" };

    // TC-GET-01: No Session
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized - Please login first");
    });

    // TC-GET-02: No ID
    it("should return 400 when consultation ID is missing", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);

      const response = await GET(mockRequest, {
        params: Promise.resolve({ id: "" }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Consultation ID is required");
    });

    // TC-GET-03: User Not Found
    it("should return 404 when user does not exist in database", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    // TC-GET-04: Consultation Not Found
    it("should return 404 when consultation does not exist or not owned by user", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await GET(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Consultation not found");
    });

    // TC-GET-05: Success Path
    it("should return 200 with decrypted consultation data when found", async () => {
      const mockConsultation = {
        id: "consultation-123",
        createdBy: "user-123",
        conversation: "encrypted-conversation",
        report: "encrypted-report",
        status: "COMPLETE",
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
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(
        mockConsultation
      );
      mockDecrypt.mockImplementation((data) => `decrypted-${data}`);

      const response = await GET(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.conversation).toBe("decrypted-encrypted-conversation");
      expect(data.data.report).toBe("decrypted-encrypted-report");
      expect(data.status).toBe("COMPLETE");
      expect(mockDecrypt).toHaveBeenCalledTimes(2);
    });

    // TC-GET-06: Exception Handling
    it("should return 500 when an unexpected error occurs", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await GET(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    // Edge case: Null conversation and report
    it("should handle null conversation and report fields", async () => {
      const mockConsultation = {
        id: "consultation-123",
        createdBy: "user-123",
        conversation: null,
        report: null,
        status: "IN_PROGRESS",
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
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(
        mockConsultation
      );

      const response = await GET(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.conversation).toBeNull();
      expect(data.data.report).toBeNull();
      expect(mockDecrypt).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/consultation/[id]", () => {
    const mockParams = { id: "consultation-123" };

    // TC-PATCH-01: No Session
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await PATCH(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    // TC-PATCH-02: User Not Found
    it("should return 404 when user does not exist in database", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await PATCH(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    // TC-PATCH-03: Consultation Not Found
    it("should return 404 when consultation does not exist", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await PATCH(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Consultation not found");
    });

    // TC-PATCH-04: Not Owner
    it("should return 403 when user is not the consultation owner", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findUnique as jest.Mock).mockResolvedValue({
        id: "consultation-123",
        createdBy: "different-user-456",
      });

      const response = await PATCH(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    // TC-PATCH-05: Success Path
    it("should return 200 and update consultation status when authorized", async () => {
      const mockUpdatedConsultation = {
        id: "consultation-123",
        status: "COMPLETE",
        createdBy: "user-123",
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
      (prisma.consultation.findUnique as jest.Mock).mockResolvedValue({
        id: "consultation-123",
        createdBy: "user-123",
      });
      (prisma.consultation.update as jest.Mock).mockResolvedValue(
        mockUpdatedConsultation
      );

      const response = await PATCH(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("COMPLETE");
      expect(prisma.consultation.update).toHaveBeenCalledWith({
        where: { id: "consultation-123" },
        data: { status: "COMPLETE" },
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

    // TC-PATCH-06: Exception Handling
    it("should return 500 when an unexpected error occurs", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await PATCH(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("DELETE /api/consultation/[id]", () => {
    const mockParams = { id: "consultation-123" };

    // TC-DELETE-01: No Session
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await DELETE(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    // TC-DELETE-02: User Not Found
    it("should return 404 when user does not exist in database", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await DELETE(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    // TC-DELETE-03: Consultation Not Found
    it("should return 404 when consultation does not exist", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await DELETE(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Consultation not found");
    });

    // TC-DELETE-04: Not Owner
    it("should return 403 when user is not the consultation owner", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findUnique as jest.Mock).mockResolvedValue({
        id: "consultation-123",
        createdBy: "different-user-456",
      });

      const response = await DELETE(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    // TC-DELETE-05: Success Path
    it("should return 200 and delete consultation when authorized", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });
      (prisma.consultation.findUnique as jest.Mock).mockResolvedValue({
        id: "consultation-123",
        createdBy: "user-123",
      });
      (prisma.consultation.delete as jest.Mock).mockResolvedValue({
        id: "consultation-123",
      });

      const response = await DELETE(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Consultation deleted successfully");
      expect(prisma.consultation.delete).toHaveBeenCalledWith({
        where: { id: "consultation-123" },
      });
    });

    // TC-DELETE-06: Exception Handling
    it("should return 500 when an unexpected error occurs", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" },
      } as any);
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await DELETE(mockRequest, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
