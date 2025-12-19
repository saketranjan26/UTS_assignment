import express from "express";
import sessionService from "../services/sessionService.js";
const router = express.Router();    

router.post('/create-session', async (req, res) => {
    try {        
        const session = await sessionService.createSession();
        res.status(201).json({
            message:"Session created successfully",
            session: session
        });
    } catch (err){
        console.error('Error creating session:', err);
        res.status(500).json({ 
            error:"Failed to create session"
        });
    }
});

router.put('/end-session', async (req, res) => {
    const { sessionId } = req.body;
    
    if(!sessionId){
        return res.status(400).json({ error: 'sessionId is required' });
    }

    try {
        const updatedSession = await sessionService.updateSessionStatus(sessionId, 'inactive');
        res.json({
            message: 'Session ended successfully',
            session: updatedSession
        });
    } catch (err){
        console.error('Error ending session:', err);
        res.status(500).json({ 
            error:"Failed to end session"
        });
    }
});

export default router;