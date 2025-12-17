import express from 'express';
import sessionService from '../services/sessionService.js';
import faqService from '../services/faqService.js';
import llmService from '../services/llmService.js';
import escalationService from '../services/escalationService.js';
import queryStatService from '../services/queryStatService.js';
const router = express.Router();

router.post('/chat', async (req, res) => {
    try{
        const { sessionId, query } = req.body;

        if(!sessionId || !query){
            return res.status(400).json({ error: 'sessionId and query are required' });
        }

        const session = await sessionService.getSessionById(sessionId);
        if(!session){
            return res.status(404).json({ error: 'Session not found' });
        }

        const faqAnswer = await faqService.matchFAQ(query);

        if(faqAnswer){
            await sessionService.saveMessage(sessionId, 'user', query);
            await sessionService.saveMessage(sessionId, 'bot', faqAnswer);

            return res.json({
                source:'faq',
                answer: faqAnswer
            })
        } 

        const history = await sessionService.getHistory(sessionId);
        const llmresponse = await llmService.getResponse(query, history);
        
        if(llmresponse.needEscalation){
            await escalationService.logEscalation(sessionId, "LLM requested escalation", query);
            await sessionService.updateSessionStatus(sessionId, 'escalated');

            const escalationMessage = "Thanks for your time. Your query has been escalated to a human agent. Please wait for further assistance.";

            await sessionService.saveMessage(sessionId, 'user', query);
            await sessionService.saveMessage(sessionId, 'bot', escalationMessage);

            return res.json({
                source:'escalation',
                answer: escalationMessage
            });
        }

        await sessionService.saveMessage(sessionId, 'user', query);
        await sessionService.saveMessage(sessionId, 'bot', llmresponse.answer);

        await queryStatService.trackQuery(query, llmresponse.answer);

        return res.json({
            source:'llm',
            answer: llmresponse.answer
        });
    }catch(error){
        console.error('Error handling chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

export default router;