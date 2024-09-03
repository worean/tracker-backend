import express, { Request, Response } from 'express';

const router = express.Router();
interface User {
    id: string;
    name: string;
    email: string;
}

const router = express.Router();

// GET /users
router.get('/', (req: Request, res: Response) => {
    // Your code here
});

// GET /users/:id
router.get('/:id', (req: Request, res: Response) => {
    // Your code here
});

// POST /users
router.post('/', (req: Request, res: Response) => {
    // Your code here
});

// PUT /users/:id
router.put('/:id', (req: Request, res: Response) => {
    // Your code here
});

// DELETE /users/:id
router.delete('/:id', (req: Request, res: Response) => {
    // Your code here
});

export default router;
