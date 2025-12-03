import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Save consultation conversation ke DB
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const { consultationId, conversation } = await request.json();

    if (!consultationId || !conversation) {
      return NextResponse.json(
        { error: "consultationId and conversation are required" },
        { status: 400 }
      );
    }


    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingConsultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        createdBy: user.id,
      },
    });

    if (!existingConsultation) {
      return NextResponse.json(
        { error: "Consultation not found or access denied" },
        { status: 404 }
      );
    }

    const updatedConsultation = await prisma.consultation.update({
      where: {
        id: consultationId,
      },
      data: {
        conversation: conversation, 
      },
    });


    return NextResponse.json({
      success: true,
      message: "Conversation saved successfully",
      data: {
        consultationId: updatedConsultation.id,
        conversationLength: conversation.length,
      },
    });

  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}