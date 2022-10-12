import * as express from 'express';
import { makeValidateBody } from 'express-class-validator'
import { PendingConnection } from '@wri-monorepos/sql';

import { createPendingConnection } from './service';

const router = express.Router()

router.post('', 
    makeValidateBody(PendingConnection),
    async (req, res) => {
        const pending = req.body;
        const result = await createPendingConnection(pending);
        return res.status(201).json(result)
    }
);

export {
    router,
}