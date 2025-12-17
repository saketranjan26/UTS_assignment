import { Escalation } from "../db.js";

const logEscalation = async (sessionId, reason, userQuery) => {
    const escalation = new Escalation({ 
        sessionId, 
        reason, 
        userQuery, 
        timestamp: new Date() });
    return await escalation.save();
}

export default { logEscalation };