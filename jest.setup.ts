// Jest setup file
import "@testing-library/jest-dom";

// Mock environment variables
process.env.AUTH_SECRET = "test-secret";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
