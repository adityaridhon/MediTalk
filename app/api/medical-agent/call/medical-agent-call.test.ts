import { NextRequest } from "next/server";

// Mock global fetch
global.fetch = jest.fn();

// Now import after mocking
import { POST } from "./route";

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Medical Agent Call API - White-Box Testing", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env;
    process.env = { ...originalEnv, VAPI_API_KEY: "test-vapi-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // TC-POST-01: Success path - create assistant successfully
  it("should return 200 and create medical assistant successfully", async () => {
    const mockAssistant = {
      id: "assistant-123",
      model: {
        provider: "groq",
        model: "llama-3.1-8b-instant",
      },
      voice: {
        model: "eleven_turbo_v2_5",
        provider: "11labs",
        voiceId: "SCDJ1Fy4al0KS1awS6H9",
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Demam tinggi",
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.assistantId).toBe("assistant-123");
    expect(data.data.message).toBe("Medical assistant created successfully");
    expect(data.data.assistant).toEqual(mockAssistant);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.vapi.ai/assistant",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-vapi-key",
        },
      })
    );

    // Verify assistant config contains required fields
    const fetchCall = mockFetch.mock.calls[0];
    const bodyString = fetchCall[1]?.body as string;
    const bodyData = JSON.parse(bodyString);

    expect(bodyData.model.provider).toBe("groq");
    expect(bodyData.model.model).toBe("llama-3.1-8b-instant");
    expect(bodyData.firstMessage).toContain("Demam tinggi");
    expect(bodyData.recordingEnabled).toBe(true);
    expect(bodyData.silenceTimeoutSeconds).toBe(420);
    expect(bodyData.maxDurationSeconds).toBe(600);
  });

  // TC-POST-02: Missing gejala parameter
  it("should handle request with missing gejala", async () => {
    const mockAssistant = {
      id: "assistant-456",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Check that undefined gejala is handled in firstMessage
    const fetchCall = mockFetch.mock.calls[0];
    const bodyString = fetchCall[1]?.body as string;
    const bodyData = JSON.parse(bodyString);
    expect(bodyData.firstMessage).toContain("undefined");
  });

  // TC-POST-03: Missing phone parameter
  it("should create assistant even without phone parameter", async () => {
    const mockAssistant = {
      id: "assistant-789",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Sakit kepala",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.assistantId).toBe("assistant-789");
  });

  // TC-POST-04: Vapi API returns error (400)
  it("should return 500 when Vapi API returns 400 error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Invalid request" }),
      text: async () => "Invalid request",
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Demam",
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Vapi API error: 400");
  });

  // TC-POST-05: Vapi API returns error (401 Unauthorized)
  it("should return 500 when Vapi API returns 401 unauthorized", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
      text: async () => "Unauthorized",
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Batuk",
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Vapi API error: 401");
  });

  // TC-POST-06: Vapi API returns error (500)
  it("should return 500 when Vapi API returns 500 server error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal server error" }),
      text: async () => "Internal server error",
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Pusing",
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Vapi API error: 500");
  });

  // TC-POST-07: Network error
  it("should return 500 when network error occurs", async () => {
    mockFetch.mockRejectedValue(new Error("Network error: fetch failed"));

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Demam",
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Network error: fetch failed");
  });

  // TC-POST-08: Invalid JSON in response
  it("should return 500 when Vapi API returns invalid JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Invalid JSON");
      },
      text: async () => "not a json",
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Demam",
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid JSON");
  });

  // TC-POST-09: Invalid request body (malformed JSON)
  it("should return 500 when request body is invalid JSON", async () => {
    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: "invalid-json-string",
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  // TC-POST-10: Empty request body
  it("should handle empty request body", async () => {
    const mockAssistant = {
      id: "assistant-empty",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  // TC-POST-11: Verify assistant config structure
  it("should create assistant with correct configuration structure", async () => {
    const mockAssistant = {
      id: "assistant-config-test",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Sakit perut",
          phone: "+6281234567890",
        }),
      })
    );

    await POST(mockReq);

    const fetchCall = mockFetch.mock.calls[0];
    const bodyString = fetchCall[1]?.body as string;
    const config = JSON.parse(bodyString);

    // Verify model config
    expect(config.model).toBeDefined();
    expect(config.model.provider).toBe("groq");
    expect(config.model.model).toBe("llama-3.1-8b-instant");
    expect(config.model.maxTokens).toBe(150);
    expect(config.model.temperature).toBe(0.7);
    expect(config.model.messages).toHaveLength(1);
    expect(config.model.messages[0].role).toBe("system");
    expect(config.model.messages[0].content).toContain("Sakit perut");

    // Verify functions
    expect(config.functions).toHaveLength(1);
    expect(config.functions[0].name).toBe("endCall");

    // Verify voice config
    expect(config.voice).toBeDefined();
    expect(config.voice.model).toBe("eleven_turbo_v2_5");
    expect(config.voice.provider).toBe("11labs");
    expect(config.voice.voiceId).toBe("SCDJ1Fy4al0KS1awS6H9");

    // Verify transcriber
    expect(config.transcriber).toBeDefined();
    expect(config.transcriber.model).toBe("scribe_v1");
    expect(config.transcriber.language).toBe("id");
    expect(config.transcriber.provider).toBe("11labs");

    // Verify other settings
    expect(config.firstMessage).toContain("Sakit perut");
    expect(config.endCallMessage).toBe(
      "Terima kasih. Semoga lekas sembuh dan segera konsultasi dokter jika perlu."
    );
    expect(config.recordingEnabled).toBe(true);
    expect(config.silenceTimeoutSeconds).toBe(420);
    expect(config.maxDurationSeconds).toBe(600);
  });

  // TC-POST-12: Verify system prompt includes gejala
  it("should include gejala in system prompt", async () => {
    const testGejala = "Nyeri dada dan sesak napas";
    const mockAssistant = { id: "assistant-prompt-test" };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: testGejala,
          phone: "+6281234567890",
        }),
      })
    );

    await POST(mockReq);

    const fetchCall = mockFetch.mock.calls[0];
    const bodyString = fetchCall[1]?.body as string;
    const config = JSON.parse(bodyString);

    expect(config.model.messages[0].content).toContain(
      `FOKUS GEJALA: "${testGejala}"`
    );
    expect(config.firstMessage).toContain(testGejala);
  });

  // TC-POST-13: Verify API key is used in headers
  it("should use VAPI_API_KEY in authorization header", async () => {
    const customApiKey = "custom-test-key-12345";
    process.env.VAPI_API_KEY = customApiKey;

    const mockAssistant = { id: "assistant-auth-test" };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Test",
          phone: "+6281234567890",
        }),
      })
    );

    await POST(mockReq);

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;

    expect(headers.Authorization).toBe(`Bearer ${customApiKey}`);
    expect(headers["Content-Type"]).toBe("application/json");
  });

  // TC-POST-14: Non-Error object thrown
  it("should handle non-Error exceptions", async () => {
    mockFetch.mockRejectedValue("String error");

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: "Demam",
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to create medical agent");
  });

  // TC-POST-15: Long gejala text
  it("should handle long gejala text", async () => {
    const longGejala =
      "Demam tinggi disertai batuk berdahak, sakit kepala, nyeri otot, mual, muntah, diare, dan lemas selama 3 hari berturut-turut";
    const mockAssistant = { id: "assistant-long-text" };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAssistant,
      text: async () => JSON.stringify(mockAssistant),
    } as Response);

    const mockReq = new NextRequest(
      new Request("http://localhost:3000/api/medical-agent/call", {
        method: "POST",
        body: JSON.stringify({
          gejala: longGejala,
          phone: "+6281234567890",
        }),
      })
    );

    const response = await POST(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const fetchCall = mockFetch.mock.calls[0];
    const bodyString = fetchCall[1]?.body as string;
    const config = JSON.parse(bodyString);

    expect(config.firstMessage).toContain(longGejala);
  });
});
