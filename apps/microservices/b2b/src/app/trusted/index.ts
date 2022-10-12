import * as express from 'express';
const router = express.Router()

router.get('/api', (req, res) => {
    res.send({ message: 'trusted' });
});

export {
    router
}
