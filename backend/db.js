import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

const SessionSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now  }, 
    status:{ type: String, enum: ['active', 'inactive','escalated'], default: 'active'  }
});

const MessageSchema =   new  mongoose.Schema({
    sessionId:{type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true  },
    sender:{ type: String, enum: ['user', 'bot'], required: true  },
    content:{ type: String, required: true  },
    timestamp:{ type: Date, default: Date.now  }
});

const EscalationSchema = new mongoose.Schema({
    sessionId:{type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true  },
    reason:{ type: String, required: true  },
    userQuery:{ type: String },
    timestamp:{ type: Date, default: Date.now  }
});

const Session = mongoose.model('Session', SessionSchema);
const Message = mongoose.model('Message', MessageSchema);
const Escalation = mongoose.model('Escalation', EscalationSchema);

export { Session, Message, Escalation };