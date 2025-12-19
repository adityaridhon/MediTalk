import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Consultation {
  id: string;
  gejala: string;
  conversation: any[];
  report: any;
  status: string;
  createdBy: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Hook utk single consultation
export const useConsultation = (consultationId: string) => {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultation = async () => {
      if (!consultationId) {
        setLoading(false);
        setError("Consultation ID not provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/consultation/${consultationId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Konsultasi tidak ditemukan");
          } else if (response.status === 401) {
            throw new Error("Tidak memiliki akses ke konsultasi ini");
          } else {
            throw new Error(`HTTP Error: ${response.status}`);
          }
        }

        const result = await response.json();

        if (result.success && result.data) {
          setConsultation(result.data);
        } else {
          throw new Error(result.message || "Data konsultasi tidak valid");
        }
      } catch (error) {
        console.error("Error fetching consultation:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data konsultasi"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [consultationId]);

  return { consultation, loading, error };
};

// Hook utk list consultations
export const useConsultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        setError("User not logged in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/consultation", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Tidak memiliki akses");
          } else {
            throw new Error(`HTTP Error: ${response.status}`);
          }
        }

        const result = await response.json();

        if (result.success && result.data) {
          setConsultations(result.data);
        } else {
          throw new Error(result.message || "Data konsultasi tidak valid");
        }
      } catch (error) {
        console.error("Error fetching consultations:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data konsultasi"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [session]);

  const refetch = () => {
    if (session?.user?.email) {
      setLoading(true);
      fetch("/api/consultation", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data) {
            setConsultations(result.data);
          }
        })
        .catch((err) => {
          console.error("Error refetching:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const deleteConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/consultation/${consultationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete consultation");
      }

      const result = await response.json();

      if (result.success) {
        // Update state lokal
        setConsultations((prev) => prev.filter((c) => c.id !== consultationId));
      }

      return result;
    } catch (error) {
      console.error("Error deleting consultation:", error);
      throw error;
    }
  };

  return { consultations, loading, error, refetch, deleteConsultation };
};
