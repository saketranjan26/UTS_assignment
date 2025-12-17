import mongoose from "mongoose";
import { Session, Message } from "../db.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createSession = async () => {
  try {
    const session = new Session({
      status: "active",
      createdAt: new Date()
    });

    return await session.save();
  } catch (error) {
    throw new Error("Failed to create session");
  }
};

const getSessionById = async (sessionId) => {
  if (!isValidObjectId(sessionId)) {
    throw new Error("Invalid sessionId format");
  }

  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  return session;
};

const updateSessionStatus = async (sessionId, status) => {
  if (!isValidObjectId(sessionId)) {
    throw new Error("Invalid sessionId format");
  }

  const session = await Session.findByIdAndUpdate(
    sessionId,
    { status },
    { new: true }
  );

  if (!session) {
    throw new Error("Session not found");
  }

  return session;
};

const saveMessage = async (sessionId, sender, content) => {
  if (!isValidObjectId(sessionId)) {
    throw new Error("Invalid sessionId format");
  }

  if (!sender || !content) {
    throw new Error("sender and content are required");
  }

  try {
    const message = new Message({
      sessionId,
      sender,
      content,
      timestamp: new Date()
    });

    return await message.save();
  } catch (error) {
    throw new Error("Failed to save message");
  }
};

const getHistory = async (sessionId) => {
  if (!isValidObjectId(sessionId)) {
    throw new Error("Invalid sessionId format");
  }

  return await Message.find({ sessionId }).sort({ timestamp: 1 });
};

export default {
  createSession,
  getSessionById,
  updateSessionStatus,
  saveMessage,
  getHistory
};
