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

export default router;