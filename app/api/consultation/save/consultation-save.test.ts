import { NextRequest } from "next/server";

// Mock dependencies FIRST
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
}));

// Now import after mocking
import { POST } from "./route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockEncrypt = encrypt as jest.MockedFunction<typeof encrypt>;

describe("Save Conversation API - White-Box Testing", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
      })
    );
  });

  // TC-POST-01: No Session
  it("should return 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized - Please login first");
    expect(mockAuth).toHaveBeenCalled();
  });

  // TC-POST-02: Missing consultationId
  it("should return 400 when consultationId is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("consultationId and conversation are required");
  });

  // TC-POST-03: Missing conversation
  it("should return 400 when conversation is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("consultationId and conversation are required");
  });

  // TC-POST-04: Missing both consultationId and conversation
  it("should return 400 when both consultationId and conversation are missing", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("consultationId and conversation are required");
  });

  // TC-POST-05: User not found
  it("should return 404 when user does not exist in database", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  // TC-POST-06: Consultation not found
  it("should return 404 when consultation does not exist", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Consultation not found or access denied");
    expect(prisma.consultation.findFirst).toHaveBeenCalledWith({
      where: {
        id: "cons-123",
        createdBy: "user-123",
      },
    });
  });

  // TC-POST-07: Consultation access denied (different user)
  it("should return 404 when consultation belongs to different user", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(null);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-456",
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Consultation not found or access denied");
  });

  // TC-POST-08: Success path
  it("should return 200 and save conversation successfully", async () => {
    const mockConversation = [
      { role: "user", content: "Hello", timestamp: "2025-01-01T10:00:00Z" },
      {
        role: "assistant",
        content: "Hi there!",
        timestamp: "2025-01-01T10:01:00Z",
      },
      {
        role: "user",
        content: "I have fever",
        timestamp: "2025-01-01T10:02:00Z",
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
      createdBy: "user-123",
    });
    mockEncrypt.mockReturnValue("encrypted-conversation-data");
    (prisma.consultation.update as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: "encrypted-conversation-data",
      createdBy: "user-123",
    });

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: mockConversation,
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Conversation saved successfully");
    expect(data.data.consultationId).toBe("cons-123");
    expect(data.data.conversationLength).toBe(3);
    expect(mockEncrypt).toHaveBeenCalledWith(mockConversation);
    expect(prisma.consultation.update).toHaveBeenCalledWith({
      where: { id: "cons-123" },
      data: { conversation: "encrypted-conversation-data" },
    });
  });

  // TC-POST-09: Database error during user lookup
  it("should return 500 when database error occurs during user lookup", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  // TC-POST-10: Database error during consultation lookup
  it("should return 500 when database error occurs during consultation lookup", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
    (prisma.consultation.findFirst as jest.Mock).mockRejectedValue(
      new Error("Database query failed")
    );

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  // TC-POST-11: Database error during update
  it("should return 500 when database error occurs during update", async () => {
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
      createdBy: "user-123",
    });
    mockEncrypt.mockReturnValue("encrypted-conversation-data");
    (prisma.consultation.update as jest.Mock).mockRejectedValue(
      new Error("Database update failed")
    );

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: [{ role: "user", content: "Hello" }],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  // TC-POST-12: Invalid JSON body
  it("should return 500 when request body is invalid JSON", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: "invalid-json",
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  // TC-POST-13: Empty conversation array
  it("should save successfully even with empty conversation array", async () => {
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
      createdBy: "user-123",
    });
    mockEncrypt.mockReturnValue("encrypted-empty-array");
    (prisma.consultation.update as jest.Mock).mockResolvedValue({
      id: "cons-123",
      gejala: "Demam",
      conversation: "encrypted-empty-array",
      createdBy: "user-123",
    });

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/consultation/save", {
        method: "POST",
        body: JSON.stringify({
          consultationId: "cons-123",
          conversation: [],
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.conversationLength).toBe(0);
  });
});
