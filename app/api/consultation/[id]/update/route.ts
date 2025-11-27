import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Update consultation with conversation and report
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { conversation, report } = body;

    // Validate required fields
    if (!conversation && !report) {
      return NextResponse.json(
        { error: "At least conversation or report is required" },
        { status: 400 }
      );
    }

    // Check if consultation exists and belongs to user
    const existingConsultation = await prisma.consultation.findFirst({
      where: {
        id: id,
        createdBy: session.user.email,
      },
    });

    if (!existingConsultation) {
      return NextResponse.json(
        { error: "Consultation not found or access denied" },
        { status: 404 }
      );
    }

    // Update consultation
    const updatedConsultation = await prisma.consultation.update({
      where: {
        id: id,
      },
      data: {
        ...(conversation && { conversation }),
        ...(report && { report }),
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

    return NextResponse.json({
      success: true,
      message: "Consultation updated successfully",
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error updating consultation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
