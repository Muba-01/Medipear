import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { updateComment, deleteComment } from "@/services/commentService";
import Comment from "@/models/Comment";
import { connectDB } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      console.log("[DEBUG] PUT comment - no authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { content } = body as { content?: unknown };

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Check if user is the author
    await connectDB();
    const comment = await Comment.findById(id);
    if (!comment) {
      console.log("[DEBUG] PUT comment - comment not found:", id);
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    
    if (comment.author.toString() !== user._id.toString()) {
      console.log("[DEBUG] PUT comment - unauthorized user", user._id.toString(), "vs", comment.author.toString());
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("[DEBUG] PUT comment - updating comment:", id);
    const updatedComment = await updateComment(id, content);
    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("[DEBUG] Error updating comment:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      console.log("[DEBUG] DELETE comment - no authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is the author
    await connectDB();
    const comment = await Comment.findById(id);
    if (!comment) {
      console.log("[DEBUG] DELETE comment - comment not found:", id);
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    
    if (comment.author.toString() !== user._id.toString()) {
      console.log("[DEBUG] DELETE comment - unauthorized user", user._id.toString(), "vs", comment.author.toString());
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("[DEBUG] DELETE comment - deleting comment:", id);
    const deletedComment = await deleteComment(id);
    return NextResponse.json(deletedComment);
  } catch (error) {
    console.error("[DEBUG] Error deleting comment:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}