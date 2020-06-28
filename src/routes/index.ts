import express from 'express';
import { ObjectID } from 'mongodb';

import Collections, { TownhallForm } from 'db';
import { createTownhall, updateTownhall } from 'modules/townhalls';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const townhalls = await Collections.Townhalls().find().toArray();
        res.send(townhalls);
    } catch (e) {
        next(e);
    }
});

router.get('/:_id', async (req, res, next) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            throw new Error('No townhall id provided');
        }
        const townhalls = await Collections.Townhalls().findOne({
            _id: new ObjectID(_id),
        });
        res.send(townhalls);
    } catch (e) {
        next(e);
    }
});

router.post('/create', async (req, res, next) => {
    try {
        const { form, user } = req.body as {
            form?: TownhallForm;
            user?: { _id: string; name: { first: string; last: string } };
        };
        if (!form || !user) {
            throw new Error('Invalid body params');
        }
        await createTownhall(form, user);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/:_id/update', async (req, res, next) => {
    try {
        const { form, user, townhallId } = req.body as {
            form?: TownhallForm;
            user?: { _id: string; name: { first: string; last: string } };
            townhallId: string;
        };
        if (!form || !user || !townhallId) {
            throw new Error('Invalid body params');
        }
        await updateTownhall(form, user, townhallId);
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});
router.post('/:_id/set-current-question');

router.delete('/:_id');

export default router;
