import express from 'express';
import { ObjectID } from 'mongodb';

import Collections, { TownhallForm, QuestionForm } from 'db';
import {
    createTownhall,
    updateTownhall,
    deleteTownhall,
} from 'modules/townhalls';
import {
    askQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestions,
    getQuestion,
} from 'modules/questions';

const router = express.Router();

/**
 * @description just get a list of all the townhalls
 */
router.get('/', async (req, res, next) => {
    try {
        const townhalls = await Collections.Townhalls().find().toArray();
        res.send(townhalls);
    } catch (e) {
        next(e);
    }
});

/**
 * @description get a specific townhall
 */
router.get('/:townhallId', async (req, res, next) => {
    try {
        const { townhallId } = req.params as { townhallId: string };
        const townhalls = await Collections.Townhalls().findOne({
            _id: new ObjectID(townhallId),
        });
        res.send(townhalls);
    } catch (e) {
        next(e);
    }
});

/**
 * @description create a townhall
 */
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
        next(e);
    }
});

/**
 * @description update a specific townhall
 */
router.post('/:townhallId/update', async (req, res, next) => {
    try {
        const { form, user } = req.body as {
            form?: TownhallForm;
            user?: { _id: string; name: { first: string; last: string } };
        };
        const { townhallId } = req.params as { townhallId: string };

        if (!form || !user || !townhallId) {
            throw new Error('Invalid body params');
        }
        const { modifiedCount } = await updateTownhall(form, user, townhallId);
        if (modifiedCount !== 1) throw new Error('Unable to find townhall');
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.post('/:townhallId/delete', async (req, res, next) => {
    try {
        // TODO: permission checks & move to deleted collection rather than actually deleting
        const { townhallId } = req.params as { townhallId: string };
        const { deletedCount } = await deleteTownhall(townhallId);
        if (!deletedCount) throw new Error('Unable to delete townhall');
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

/**
 * @description set the current question of a townhall, main use case is the moderator setting the current question of a live townhall
 */
router.post('/:townhallId/questions/set-current', async (req, res, next) => {
    // TODO: check if the townhall is live so that a current question can only be set during a live townhall
    try {
        const { questionId } = req.body as { questionId?: string };
        const { townhallId } = req.params as { townhallId: string };
        if (!questionId) throw new Error('No question provided');
        const { modifiedCount } = await askQuestion(questionId, townhallId);
        if (modifiedCount < 1) throw new Error('Unable to question');
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

/**
 * @description create a question for a townhall, main use case is for when the
 */
router.post('/:townhallId/questions/create', async (req, res, next) => {
    // TODO: check if a townhall has ended
    try {
        const { form } = req.body as { form: QuestionForm };
        const { townhallId } = req.params as { townhallId: string };
        const { insertedCount } = await createQuestion(form, townhallId);
        if (insertedCount !== 1)
            throw new Error('Something went wrong with creating the question!');
        // TODO: ML/AI here
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});
/**
 * @description update a question, main use case is for when the user wants to update their question
 */
router.post(
    '/:townhallId/questions/:questionId/update',
    async (req, res, next) => {
        // TODO: check if a townhall has ended
        try {
            const { form } = req.body as { form: QuestionForm };
            const { townhallId, questionId } = req.params as {
                townhallId: string;
                questionId: string;
            };
            const { modifiedCount } = await updateQuestion(
                form,
                questionId,
                townhallId
            );
            if (modifiedCount < 1) throw new Error('Unable to find question');
            // TODO: ML/AI here
            res.sendStatus(200);
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    '/:townhallId/questions/:questionId/delete',
    async (req, res, next) => {
        try {
            // TODO: check if townhall is over and/or if question has been asked
            // TODO: move this to a deleted collection
            const { questionId, townhallId } = req.params as {
                townhallId: string;
                questionId: string;
            };
            const { deletedCount } = await deleteQuestion(
                questionId,
                townhallId
            );
            if (!deletedCount) throw new Error('Could not find question');
            res.sendStatus(200);
        } catch (e) {
            next(e);
        }
    }
);

router.get('/:townhallId/questions', async (req, res, next) => {
    try {
        const { townhallId } = req.params as { townhallId: string };
        const questions = await getQuestions(townhallId);
        res.status(200).send(questions);
    } catch (e) {
        next(e);
    }
});

router.get('/:townhallId/questions/:questionId', async (req, res, next) => {
    try {
        const { townhallId, questionId } = req.params as {
            townhallId: string;
            questionId: string;
        };
        const question = await getQuestion(townhallId, questionId);
        res.status(200).send(question);
    } catch (e) {
        next(e);
    }
});

export default router;
